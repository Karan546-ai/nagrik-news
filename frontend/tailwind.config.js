/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nagrik-red': '#E4002B', // Dainik Bhaskar inspired primary red
        'nagrik-dark': '#0f172a',
      }
    },
  },
  plugins: [],
}
