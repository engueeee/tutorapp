/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/app/globals.css"],
  theme: {
    extend: {
      colors: {
        primary: "#050f8b",
        secondary: "#dfb529",
      },
    },
  },
  plugins: [],
};
