/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 50:'#fdfaf3', 100:'#f9f0d9', 200:'#f0dca8', 400:'#D4A853', 500:'#C49A3C', 600:'#A07B2E', 700:'#7A5E22' },
        brand: { dark:'#1A1A1A', gray:'#6B6256', light:'#F5F2EC', border:'#E8E0D4' },
        cls: { green:'#2A6B4A', amber:'#B07D3A', red:'#A04848' },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
