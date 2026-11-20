// @vitest-environment node
import { execFile } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, describe, expect, it } from "vitest";

const run = promisify(execFile);
const root = join(__dirname, "..");
const script = join(root, "scripts/generate-greeting-audio.mjs");

// A pretend Google / Azure text-to-speech service that records every request.
type Seen = { api: string; key?: string; body: Record<string, unknown> | string };
const seen: Seen[] = [];
const server = http.createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const url = new URL(req.url ?? "/", "http://x");
  if (url.pathname === "/v1/text:synthesize") {
    const body = JSON.parse(raw);
    seen.push({ api: "google", key: url.searchParams.get("key") ?? "", body });
    if (url.searchParams.get("key") === "bad") {
      res.statusCode = 403;
      return res.end('{"error":{"message":"API key not valid"}}');
    }
    if (body.voice.name && !/Wavenet|Standard/.test(body.voice.name)) {
      res.statusCode = 400; // pretend the newest voice names don't exist
      return res.end('{"error":{"message":"voice does not exist"}}');
    }
    return res.end(JSON.stringify({ audioContent: Buffer.from("fake-mp3-bytes").toString("base64") }));
  }
  if (url.pathname === "/cognitiveservices/v1") {
    seen.push({ api: "azure", key: String(req.headers["ocp-apim-subscription-key"]), body: raw });
    return res.end("fake-mp3-bytes");
  }
  res.statusCode = 404;
  res.end();
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

function project() {
  const dir = mkdtempSync(join(tmpdir(), "greetings-"));
  mkdirSync(join(dir, "src/data"), { recursive: true });
  copyFileSync(join(root, "src/data/greetings.ts"), join(dir, "src/data/greetings.ts"));
  return dir;
}

async function generate(dir: string, args: string[], env: Record<string, string>) {
  seen.length = 0;
  try {
    const out = await run("node", ["--experimental-strip-types", script, "--root", dir, "--no-process", ...args], {
      env: { ...process.env, GOOGLE_TTS_API_KEY: "", AZURE_SPEECH_KEY: "", GOOGLE_TTS_BASE: base, AZURE_TTS_BASE: base, ...env },
      timeout: 60000,
    });
    return { code: 0, text: out.stdout + out.stderr };
  } catch (error) {
    const e = error as { code?: number; stdout?: string; stderr?: string };
    return { code: e.code ?? 1, text: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

afterAll(() => {
  server.close();
});

describe("generate-greeting-audio", () => {
  it("makes a clip for every language and phrase asked for, in the right language", async () => {
    const dir = project();
    const result = await generate(dir, ["--languages", "mr,gu,sa", "--kinds", "hello"], { GOOGLE_TTS_API_KEY: "test" });
    expect(result.code).toBe(0);
    expect(readdirSync(join(dir, "recordings/greetings")).sort()).toEqual(["gu-hello.mp3", "mr-hello.mp3", "sa-hello.mp3"]);

    const voiceFor = (text: string) => seen.filter((s) => (s.body as { input: { text: string } }).input.text === text).map((s) => (s.body as { voice: { languageCode: string; name?: string } }).voice);
    expect(voiceFor("नमस्कार")[0].languageCode).toBe("mr-IN");
    expect(voiceFor("નમસ્તે")[0].languageCode).toBe("gu-IN");
    const sanskrit = voiceFor("नमो नमः");
    expect(sanskrit[0].languageCode).toBe("hi-IN"); // no Sanskrit voice exists, so a Hindi one reads it
    expect(sanskrit.length).toBeGreaterThan(1); // the first voice name was refused, so it tried the next
    rmSync(dir, { recursive: true, force: true });
  });

  it("never overwrites a clip you recorded yourself, and does nothing on a second run", async () => {
    const dir = project();
    mkdirSync(join(dir, "recordings/greetings"), { recursive: true });
    writeFileSync(join(dir, "recordings/greetings/gu-hello.m4a"), "my own voice");

    await generate(dir, ["--languages", "gu,mr", "--kinds", "hello"], { GOOGLE_TTS_API_KEY: "test" });
    expect(existsSync(join(dir, "recordings/greetings/gu-hello.mp3"))).toBe(false); // yours is kept
    expect(existsSync(join(dir, "recordings/greetings/mr-hello.mp3"))).toBe(true);

    await generate(dir, ["--languages", "gu,mr", "--kinds", "hello"], { GOOGLE_TTS_API_KEY: "test" });
    expect(seen).toHaveLength(0);
    rmSync(dir, { recursive: true, force: true });
  });

  it("can use Microsoft Azure instead", async () => {
    const dir = project();
    const result = await generate(dir, ["--provider", "azure", "--languages", "ja", "--kinds", "thank-you"], { AZURE_SPEECH_KEY: "azure-key", AZURE_SPEECH_REGION: "centralindia" });
    expect(result.code).toBe(0);
    expect(seen).toHaveLength(1);
    expect(seen[0].key).toBe("azure-key");
    expect(String(seen[0].body)).toContain('name="ja-JP-KeitaNeural"');
    expect(String(seen[0].body)).toContain("ありがとうございます");
    expect(existsSync(join(dir, "recordings/greetings/ja-thank-you.mp3"))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it("stops with a clear message when the key is wrong or missing", async () => {
    const dir = project();
    const wrong = await generate(dir, ["--languages", "en", "--kinds", "hello"], { GOOGLE_TTS_API_KEY: "bad" });
    expect(wrong.code).toBe(1);
    expect(wrong.text).toMatch(/refused the key/);
    expect(seen).toHaveLength(1); // it didn't keep hammering the service

    const none = await generate(dir, [], {});
    expect(none.code).toBe(1);
    expect(none.text).toContain("GOOGLE_TTS_API_KEY");
    rmSync(dir, { recursive: true, force: true });
  });
});
