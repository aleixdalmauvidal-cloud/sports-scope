import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#090a0e",
          raised: "#0e1016",
          card: "#12151c",
          border: "#1e2430",
          line: "rgba(255, 255, 255, 0.06)",
        },
        accent: {
          DEFAULT: "#2ee4a8",
          muted: "#26b884",
          dim: "rgba(46, 228, 168, 0.1)",
        },
        gold: "#d4a853",
        silver: "#9ca3af",
        bronze: "#b45309",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(46, 228, 168, 0.3)",
        panel:
          "0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -12px rgba(0,0,0,0.55)",
        "panel-inset": "inset 0 1px 0 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
