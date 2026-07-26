/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0B0D",
        panel: "#101319",
        panel2: "#0D0F14",
        line: "rgba(255,122,51,0.16)",
        amber: {
          DEFAULT: "#FF7A33",
          soft: "#FFB073",
        },
        cyan: {
          DEFAULT: "#4FD1C5",
          soft: "#9CE8DF",
        },
        ink: "#E7E9EC",
        mute: "#8A8F98",
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


