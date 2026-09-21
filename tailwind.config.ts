import type { Config } from "tailwindcss";

const miyashiroGreen = {
  50: "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e",
  600: "#16a34a",
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
  950: "#052e16",
  DEFAULT: "#00873E",
  wine: "#082f1a",
  dark: "#041c0f",
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        miyashiro: miyashiroGreen,
        gallo: miyashiroGreen,
        emerald: {
          whatsapp: "#22C55E",
          whatsappHover: "#16A34A"
        }
      },
    },
  },
  plugins: [],
};
export default config;
