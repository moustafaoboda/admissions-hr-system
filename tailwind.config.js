/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aastmt: {
          navy: '#002244',
          'navy-dark': '#00162e',
          'navy-light': '#0d3868',
          gold: '#c59b27',
          'gold-light': '#dfb743',
          'gold-soft': 'rgba(197, 155, 39, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        brand: ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}
