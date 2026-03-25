import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd8ff",
          300: "#90beff",
          400: "#5f9bff",
          500: "#2f79f7",
          600: "#1f5fd5",
          700: "#1d4ca9",
          800: "#1f4389",
          900: "#1f3b73"
        }
      },
      boxShadow: {
        soft: "0 20px 40px -24px rgba(18, 60, 120, 0.35)"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at 10% 10%, rgba(47,121,247,0.25), transparent 35%), radial-gradient(circle at 90% 20%, rgba(255,255,255,0.2), transparent 35%), linear-gradient(135deg, #0f2d66, #16408e 60%, #2f79f7)",
        "light-mesh": "radial-gradient(circle at 1px 1px, rgba(47,121,247,0.18) 1px, transparent 0)"
      }
    }
  },
  darkMode: "class",
  plugins: []
};

export default config;
