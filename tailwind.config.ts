import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cairo)", "system-ui", "sans-serif"],
        body: ["var(--font-plex-arabic)", "system-ui", "sans-serif"],
        tech: ["var(--font-space-grotesk)", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
