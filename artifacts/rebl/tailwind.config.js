/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F0F1A',
        accent: '#E63946',
        cream: '#F1FAEE',
        muted: '#8D99AE',
        gold: '#FFB703',
        card: '#16162A',
      },
    },
  },
  plugins: [],
}
