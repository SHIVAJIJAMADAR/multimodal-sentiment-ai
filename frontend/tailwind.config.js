/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        positive: "#16a34a",
        negative: "#dc2626",
        neutral: "#eab308",
      },
    },
  },
  plugins: [],
};
