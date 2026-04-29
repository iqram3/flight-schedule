/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        runway: "#0f766e",
        lagoon: "#0891b2",
        violet: "#4f46e5",
        amber: "#b45309",
        cloud: "#f5f7fb",
      },
      boxShadow: {
        soft: "0 18px 60px -28px rgba(15, 23, 42, 0.35)",
        lift: "0 20px 45px -28px rgba(15, 23, 42, 0.55)",
      },
    },
  },
  plugins: [],
};
