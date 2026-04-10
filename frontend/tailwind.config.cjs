/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nw: {
          50:  '#f3f1ff',
          100: '#ebe8fe',
          200: '#d9d4fd',
          300: '#c4bcfb',
          400: '#a89af8',
          600: '#6941C6',
          700: '#5730a8',
          800: '#3C3489',
          900: '#26215C',
        },
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'badge-pop': {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.4s ease-out forwards',
        'badge-pop': 'badge-pop 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
