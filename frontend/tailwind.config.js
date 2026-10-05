/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#050814",
          card: "rgba(11, 19, 43, 0.72)",
          border: "rgba(56, 189, 248, 0.25)",
          cyan: "#00f0ff",
          neon: "#00ff9d",
          amber: "#ffaa00",
          pink: "#ff0077",
          purple: "#9d4edd",
          accent: "#38bdf8",
        }
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 240, 255, 0.35)",
        "neon-green": "0 0 20px rgba(0, 255, 157, 0.35)",
        "neon-amber": "0 0 20px rgba(255, 170, 0, 0.35)",
        "neon-pink": "0 0 20px rgba(255, 0, 119, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "from": { filter: "drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))" },
          "to": { filter: "drop-shadow(0 0 16px rgba(0, 240, 255, 0.8))" },
        }
      }
    },
  },
  plugins: [],
}
