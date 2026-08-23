import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: "#00453A",
        emerald: "#00856F",
        mint: "#DCE9E2",
        cream: "#FFFAF1",
        ivory: "#F7F9F9",
        sand: "#DCE9E2",
        gold: "#b78a3d",
        ink: "#384633",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,69,58,.12)",
        card: "0 10px 28px rgba(0,69,58,.08), 0 2px 5px rgba(0,69,58,.05)",
        table: "0 14px 34px rgba(0,69,58,.10)",
      },
      // Named breakpoints, layering, and duration aliases — additive only.
      // Colors, spacing, radius, shadows, and type scale are left alone:
      // v3's defaults already match those values, so duplicating them under
      // new names would just be noise.
      screens: {
        mobile: "320px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1440px",
        wide: "1920px",
      },
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "trust-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        rise: "rise 0.65s ease both",
        "trust-scroll": "trust-scroll 38s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
