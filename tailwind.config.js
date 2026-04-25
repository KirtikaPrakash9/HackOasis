/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './actions/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hack-black': '#0A0A0A',
        'hack-cream': '#F5F0E8',
        'hack-yellow': '#E8FF00',
        'hack-orange': '#FF4D00',
        'hack-concrete': '#C8C4BC',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        sans: ['"Instrument Sans"', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px #0A0A0A',
        'brutal-lg': '6px 6px 0px #0A0A0A',
        'brutal-active': '0px 0px 0px #0A0A0A',
      },
    },
  },
  plugins: [],
}
