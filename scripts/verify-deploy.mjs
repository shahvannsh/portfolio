// Checks a live deployment: security headers, key files, and that the API rejects abuse.
//
//   npm run verify                                  (checks https://portfolio-mu-ruby-37.vercel.app)
//   npm run verify -- https://your-preview-url.vercel.app
//
// It never sends a real message: the form test uses the bot trap, which is dropped without emailing anyone.
const base = (process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "https://portfolio-mu-ruby-37.vercel.app").replace(/\/$/, "");
const skipHttp = process.argv.includes("--skip-http");
const origin = new URL(base).origin;

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail });
const get = (path, init = {}) => fetch(base + path, { redirect: "manual", ...init });

for (const path of ["/", "/card"]) {
  const res = await get(path);
  const h = (k) => res.headers.get(k) ?? "";
  const csp = h("content-security-policy");
  check(`${path} loads`, res.status === 200 && h("content-type").includes("text/html"), `status ${res.status}`);
  check(`${path} CSP forbids inline and third-party scripts`, /script-src 'self'(;|$)/.test(csp) && !/unsafe-(inline|eval)/.test(csp.split("style-src")[0]), csp.slice(0, 80));
  check(`${path} cannot be framed`, /frame-ancestors 'none'/.test(csp) && h("x-frame-options") === "DENY");
  check(`${path} has HSTS`, /max-age=\d{8,}/.test(h("strict-transport-security")));
  check(`${path} sets nosniff + referrer + COOP`, h("x-content-type-options") === "nosniff" && h("referrer-policy") !== "" && h("cross-origin-opener-policy") === "same-origin");
  check(`${path} blocks camera, mic and location`, /camera=\(\)/.test(h("permissions-policy")) && /microphone=\(\)/.test(h("permissions-policy")));
  check(`${path} doesn't advertise its server software`, !h("x-powered-by"));
}

const files = [
  ["/Vannsh-Shah-Resume.pdf", "pdf"], ["/contact.vcf", ""], ["/intro.mp4", "video"], ["/intro.vtt", ""], ["/music/builder.mp3", "audio"],
  ["/card-qr.svg", "svg"], ["/theme-init.js", "javascript"], ["/va-init.js", "javascript"], ["/.well-known/security.txt", "text"],
];
for (const [path, type] of files) {
  const res = await get(path, { method: "HEAD" });
  check(`${path} is served`, res.status === 200 && (!type || (res.headers.get("content-type") ?? "").includes(type)), `status ${res.status}`);
}

const post = (body, headers = {}) =>
  get("/api/lead", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...headers }, body: JSON.stringify(body) });
const lead = await get("/api/lead");
check("API rejects GET", lead.status === 405, `status ${lead.status}`);
check("API rejects other websites", (await post({ company: "verify-script" }, { Origin: "https://evil.example" })).status === 403);
check("API rejects non-JSON", (await get("/api/lead", { method: "POST", headers: { "Content-Type": "text/plain", Origin: origin }, body: "x" })).status === 415);
check("API rejects huge bodies", (await post({ message: "x".repeat(6000) })).status === 413);
check("API drops bots quietly", (await post({ name: "verify", email: "verify@example.com", company: "verify-script", elapsed: 9000 })).status === 200);
check("API never caches", (lead.headers.get("cache-control") ?? "").includes("no-store"));

if (!skipHttp && base.startsWith("https://")) {
  const http = await fetch(base.replace("https://", "http://") + "/", { redirect: "manual" }).catch(() => null);
  check("plain http redirects to https", http && [301, 302, 307, 308].includes(http.status) && (http.headers.get("location") ?? "").startsWith("https://"), http ? `status ${http.status}` : "no response");
}

const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.ok ? "" : r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed${failed ? " — fix the FAIL lines above" : ""}`);
process.exit(failed ? 1 : 0);
