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
        // Monochromatic dark theme - space-like aesthetic
        void: {
          DEFAULT: "#1a1f2e", // Primary background
          dark: "#0f1218",    // Darker variant
          light: "#252b3d",   // Lighter variant
        },
        slate: {
          DEFAULT: "#94a3b8",
          dark: "#64748b",
          light: "#cbd5e1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
