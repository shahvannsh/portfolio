// @vitest-environment node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

function walk(dir: string, accept: (file: string) => boolean, out: string[] = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(root, rel)).isDirectory()) walk(rel, accept, out);
    else if (accept(rel)) out.push(rel);
  }
  return out;
}

type Header = { key: string; value: string };
const config = JSON.parse(read("vercel.json")) as { headers: { source: string; headers: Header[] }[] };
const siteHeaders = config.headers.find((h) => h.source === "/(.*)")?.headers ?? [];
const header = (key: string) => siteHeaders.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value ?? "";
const csp = Object.fromEntries(
  header("Content-Security-Policy")
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => [d.split(" ")[0], d.split(" ").slice(1)]),
) as Record<string, string[]>;

describe("response headers", () => {
  it("has a strict content security policy", () => {
    expect(csp["default-src"]).toEqual(["'self'"]);
    expect(csp["script-src"]).toEqual(["'self'"]); // no inline scripts, no eval, no third parties
    expect(csp["connect-src"]).toEqual(["'self'"]); // injected code can't send data elsewhere
    expect(csp["frame-ancestors"]).toEqual(["'none'"]);
    expect(csp["object-src"]).toEqual(["'none'"]);
    expect(csp["base-uri"]).toEqual(["'self'"]);
    expect(csp["form-action"]).toEqual(["'self'"]);
    expect(header("Content-Security-Policy")).not.toMatch(/unsafe-eval|\*/);
    expect(csp["script-src"]).not.toContain("'unsafe-inline'");
    expect(csp["style-src"]).not.toContain("'unsafe-inline'"); // no injected <style> elements
    expect(csp["style-src-attr"]).toEqual(["'unsafe-inline'"]); // React inline style props only
  });

  it("sets the other protective headers", () => {
    expect(header("Strict-Transport-Security")).toMatch(/max-age=(\d{8,})/);
    expect(Number(/max-age=(\d+)/.exec(header("Strict-Transport-Security"))?.[1])).toBeGreaterThanOrEqual(31536000);
    expect(header("X-Content-Type-Options")).toBe("nosniff");
    expect(header("X-Frame-Options")).toBe("DENY");
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header("Cross-Origin-Opener-Policy")).toBe("same-origin");
    for (const feature of ["camera", "microphone", "geolocation", "payment"]) {
      expect(header("Permissions-Policy")).toContain(`${feature}=()`);
    }
  });

  it("never caches API responses", () => {
    const api = config.headers.find((h) => h.source === "/api/(.*)")?.headers ?? [];
    expect(api.find((h) => h.key === "Cache-Control")?.value).toBe("no-store");
  });
});

describe("pages", () => {
  for (const page of ["index.html", "card.html"]) {
    it(`${page} has no inline scripts or inline event handlers`, () => {
      const html = read(page);
      const scripts = [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1]);
      for (const attrs of scripts) {
        expect(/\bsrc=/.test(attrs) || /type="application\/ld\+json"/.test(attrs)).toBe(true);
      }
      expect(html).not.toMatch(/\son[a-z]+\s*=/i);
      expect(html).not.toMatch(/(src|href)="http:\/\//i);
    });
  }

  it("ships the script files the pages rely on", () => {
    expect(existsSync(join(root, "public/theme-init.js"))).toBe(true);
    expect(existsSync(join(root, "public/va-init.js"))).toBe(true);
    expect(existsSync(join(root, "public/.well-known/security.txt"))).toBe(true);
  });
});

const SECRET = /sk-ant-[A-Za-z0-9_-]{10,}|\bre_[A-Za-z0-9]{20,}|\bgh[pousr]_[A-Za-z0-9]{30,}|\bAKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;

describe("source code", () => {
  const files = walk("src", (f) => /\.(ts|tsx)$/.test(f) && !f.includes("__tests__"));
  const text = files.map((f) => [f, read(f)] as const);

  it("never uses dangerous APIs", () => {
    const banned = /dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write|\beval\s*\(|new Function\s*\(|setTimeout\(\s*["'`]|setInterval\(\s*["'`]/;
    for (const [file, source] of text) expect(source, file).not.toMatch(banned);
  });

  it("never creates inline <style> or <script> elements", () => {
    for (const [file, source] of text) {
      expect(source, file).not.toMatch(/<style[\s>]|<script[\s>]|createElement\(\s*["'](style|script)["']/);
    }
  });

  it("opens external links safely", () => {
    for (const [file, source] of text) {
      for (const m of source.matchAll(/target=/g)) {
        const around = source.slice(Math.max(0, (m.index ?? 0) - 400), (m.index ?? 0) + 400);
        if (around.includes("_blank")) expect(around, file).toContain("noopener");
      }
    }
  });

  it("only reads the one public environment flag", () => {
    for (const [file, source] of text) {
      for (const m of source.matchAll(/import\.meta\.env\.([A-Z_]+)/g)) {
        expect(["VITE_AI_CHAT", "MODE", "DEV", "PROD", "BASE_URL"], file).toContain(m[1]);
      }
    }
  });

  it("has a secret scanner that really detects keys", () => {
    for (const fake of ["sk-ant-api03-abcdefghijklmnop", "re_" + "a1B2c3D4e5F6g7H8i9J0k1L2", "ghp_" + "a".repeat(36), "AKIA" + "ABCDEFGHIJKLMNOP", "-----BEGIN RSA PRIVATE KEY-----"]) {
      expect(fake).toMatch(SECRET);
    }
    expect("are_not_a_secret_just_a_long_identifier_name").not.toMatch(SECRET);
  });

  it("contains no secrets", () => {
    const scan = [
      ...files,
      ...walk("api", () => true),
      ...walk("public", (f) => /\.(js|json|html|txt|svg|vtt)$/.test(f)),
      "index.html",
      "card.html",
      "vercel.json",
    ];
    for (const file of scan) expect(read(file), file).not.toMatch(SECRET);
  });
});

describe("environment and server code", () => {
  it("keeps secret names out of the public (VITE_) namespace", () => {
    const lines = read(".env.example").split("\n");
    for (const line of lines) {
      if (line.startsWith("VITE_")) expect(line.split("=")[0]).not.toMatch(/KEY|SECRET|TOKEN|PASSWORD/);
    }
    expect(read(".gitignore")).toMatch(/^\.env$/m);
  });

  it("makes every endpoint use the shared guard and never log", () => {
    for (const file of ["api/lead.js", "api/chat.js"]) {
      const source = read(file);
      expect(source, file).toMatch(/import \{[^}]*\bguard\b[^}]*\} from "\.\/_security\.js"/);
      expect(source, file).not.toMatch(/console\./);
      expect(source, file).not.toMatch(/\bchild_process\b|\beval\s*\(/);
    }
  });
});
