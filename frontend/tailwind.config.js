/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#ffffff",
        danger: "#ef4444",
        success: "#22c55e",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
