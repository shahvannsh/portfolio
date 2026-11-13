import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url));

// Serve /card as card.html in dev and preview (Vercel does this via vercel.json).
function cardRoute(): Plugin {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    if (req.url && /^\/card\/?(\?.*)?$/.test(req.url)) req.url = "/card.html";
    next();
  };
  return {
    name: "card-route",
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cardRoute()],
  build: {
    sourcemap: false, // never ship source maps to visitors
    rollupOptions: {
      input: { main: path("./index.html"), card: path("./card.html") },
    },
  },
});
