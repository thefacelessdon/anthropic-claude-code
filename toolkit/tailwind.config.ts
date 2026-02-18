import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0F0F0F",
        card: "#1A1A1A",
        border: "#2A2A2A",
        text: "#E8E8E8",
        muted: "#999999",
        dim: "#666666",
        accent: "#C4A67A",
        "accent-dim": "#8B7355",
        status: {
          green: "#5B8C5A",
          red: "#C45B5B",
          blue: "#5B7FC4",
          orange: "#C4885B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
