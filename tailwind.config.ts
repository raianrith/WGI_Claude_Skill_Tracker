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
        suede: "#112721",
        antique: "#A86A40",
        orange: "#FF6700",
        "dk-gray": "#272727",
        "md-gray": "#4A4A4A",
        "lt-gray": "#F7F4F3",
        "lt-suede": "#A0A9A6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Black", "Impact", "sans-serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
      },
      borderRadius: {
        brand: "2px",
      },
      keyframes: {
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pip-pop": {
          "0%": { transform: "scale(0.6)" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "ticker-in": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "upvote-bounce": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        "bar-fill": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "vote-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 103, 0, 0.55)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255, 103, 0, 0)" },
        },
      },
      animation: {
        "count-up": "count-up 0.5s ease-out both",
        "pip-pop": "pip-pop 0.45s ease-out both",
        "ticker-in": "ticker-in 0.35s ease-out both",
        "upvote-bounce": "upvote-bounce 0.35s ease-out",
        "bar-fill": "bar-fill 1s ease-out both",
        "vote-glow": "vote-glow 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
