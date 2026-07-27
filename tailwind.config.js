/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", ":root:not(.light)"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "rgb(var(--c-void) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        panel2: "rgb(var(--c-panel2) / <alpha-value>)",
        line: "var(--c-line)",
        amber: {
          DEFAULT: "rgb(var(--c-amber) / <alpha-value>)",
          soft: "rgb(var(--c-amber-soft) / <alpha-value>)",
        },
        cyan: {
          DEFAULT: "rgb(var(--c-cyan) / <alpha-value>)",
          soft: "rgb(var(--c-cyan-soft) / <alpha-value>)",
        },
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        mute: "rgb(var(--c-mute) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};



