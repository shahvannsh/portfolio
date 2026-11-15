// Sends ONE real test message through your live form so you can check it reaches your inbox / WhatsApp.
//
//   npm run test-lead                      (uses https://portfolio-mu-ruby-37.vercel.app)
//   npm run test-lead -- https://your-url.vercel.app
//
// A visitor can only send 4 messages an hour, so don't run it more than that.
const base = (process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "https://portfolio-mu-ruby-37.vercel.app").replace(/\/$/, "");

const response = await fetch(`${base}/api/lead`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: new URL(base).origin },
  body: JSON.stringify({
    name: "Setup test",
    email: "setup-test@example.com",
    message: "[TEST] Checking that portfolio messages reach my inbox. Please ignore this one.",
    company: "",
    elapsed: 6000,
  }),
}).catch((error) => ({ status: 0, json: async () => ({ error: error.message }) }));

const body = await response.json().catch(() => ({}));
const hints = {
  200: "Sent. Check your email (and WhatsApp if you set it up). If a Redis database is connected, it is also saved for tracking.",
  400: "The server rejected the test data (this shouldn't happen: tell Claude).",
  403: "The server refused the request's origin. Redeploy with the latest code, or set ALLOWED_ORIGINS to your site address.",
  429: "Too many tries from this connection. Wait an hour and try again.",
  501: "Nothing is switched on yet: add RESEND_API_KEY (email) and/or the Redis variables in Vercel, then redeploy. See MESSAGES-SETUP.md.",
  502: "The message could not be delivered: check RESEND_API_KEY and the Vercel function logs.",
  0: "Could not reach the site. Check the address.",
};
console.log(`Status ${response.status}: ${hints[response.status] ?? JSON.stringify(body)}`);
process.exit(response.status === 200 ? 0 : 1);
