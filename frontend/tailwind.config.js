/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7FB",
        ink: {
          50: "#F0F3FA",
          100: "#DDE4F0",
          200: "#BCC9E0",
          300: "#94A7C8",
          400: "#6A81AC",
          500: "#4A6090",
          600: "#394B74",
          700: "#2C3A5C",
          800: "#1E2942",
          900: "#101A2E",
          950: "#0A1120",
        },
        acid: {
          200: "#E6F79E",
          300: "#DBF26E",
          400: "#C9F24A",
          500: "#AEE02F",
        },
        "bg-dark": "#0A1120",
      },
      fontFamily: {
        display: [
          '"Space Grotesk"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgb(10 17 32 / 0.06), " +
          "0 4px 16px rgb(10 17 32 / 0.06)",
        "card-hover": "0 2px 4px rgb(10 17 32 / 0.08), " +
          "0 10px 28px rgb(10 17 32 / 0.10)",
      },
    },
  },
  plugins: [],
};
