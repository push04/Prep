/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00D3A7",   // teal-mint accent
        ink: "#0F172A",       // slate-900
        panel: "#0B1220",     // dark panel
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.25)",
      },
      borderRadius: {
        xl2: "1rem",
      }
    },
  },
  plugins: [],
}
