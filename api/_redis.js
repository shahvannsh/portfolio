// Tiny Upstash/Vercel-KV client over their REST API (no dependency). Used to remember messages for tracking and digests.
// Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL + KV_REST_API_TOKEN from the Vercel Marketplace).

const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

export const redisConfigured = () => Boolean(url() && token());

async function post(path, body) {
  const response = await fetch(`${url().replace(/\/$/, "")}${path}`, {
    method: "POST",
    signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("redis_http");
  return response.json();
}

/** Runs one command, e.g. redis("LLEN", "leads:pending"). */
export async function redis(...command) {
  const out = await post("", command);
  if (out.error) throw new Error("redis_error");
  return out.result;
}

/** Runs several commands in one round trip and returns their results in order. */
export async function pipeline(commands) {
  const out = await post("/pipeline", commands);
  return out.map((entry) => {
    if (entry.error) throw new Error("redis_error");
    return entry.result;
  });
}
