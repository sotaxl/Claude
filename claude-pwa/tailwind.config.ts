import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        claude: {
          bg: "#1a1a1a",
          surface: "#2a2a2a",
          border: "#3a3a3a",
          accent: "#d97757",
          "accent-hover": "#c86644",
          user: "#2d4a3e",
          text: "#e8e3d8",
          muted: "#888",
        },
      },
      fontFamily: { sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "sans-serif"] },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseDot: { "0%,80%,100%": { transform: "scale(0.6)", opacity: "0.4" }, "40%": { transform: "scale(1)", opacity: "1" } },
      },
    },
  },
  plugins: [],
}

export default config
