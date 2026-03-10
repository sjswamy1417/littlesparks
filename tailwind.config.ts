import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0E17",
        surface: {
          DEFAULT: "#1A1A2E",
          sidebar: "#16213E",
        },
        primary: {
          DEFAULT: "#FF6B35",
          foreground: "#FFFBF2",
        },
        secondary: {
          DEFAULT: "#7B2FBE",
          foreground: "#FFFBF2",
        },
        accent: {
          DEFAULT: "#C8F135",
          foreground: "#0F0E17",
        },
        text: {
          DEFAULT: "#FFFBF2",
          muted: "#A0A0B2",
        },
        destructive: {
          DEFAULT: "#FF4444",
          foreground: "#FFFBF2",
        },
        border: "#2A2A3E",
        ring: "#FF6B35",
        input: "#2A2A3E",
        card: {
          DEFAULT: "#1A1A2E",
          foreground: "#FFFBF2",
        },
        popover: {
          DEFAULT: "#1A1A2E",
          foreground: "#FFFBF2",
        },
        muted: {
          DEFAULT: "#1A1A2E",
          foreground: "#A0A0B2",
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', "cursive"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "star-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 107, 53, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.8)" },
        },
      },
      animation: {
        "star-pulse": "star-pulse 2s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
        "count-up": "count-up 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
