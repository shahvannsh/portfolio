/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    // Only this project's own tests (not old copies such as portfolio/ or .kilo/).
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
  },
});
