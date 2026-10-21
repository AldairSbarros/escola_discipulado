/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'discipulado-blue': '#1e3a8a',
        'discipulado-purple': '#6b21a8',
      },
    },
  },
  plugins: [],
}