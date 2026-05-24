import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0b0e11",
          soft: "#131722",
          card: "#171b26",
          hover: "#1f2433",
        },
        border: {
          DEFAULT: "#262b39",
          soft: "#1e2330",
        },
        text: {
          DEFAULT: "#d1d4dc",
          muted: "#787b86",
          bright: "#ffffff",
        },
        up: "#26a69a",
        down: "#ef5350",
        accent: "#2962ff",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
