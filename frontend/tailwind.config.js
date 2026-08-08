/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #1DB954)', // Emerald Green fallback
        secondary: 'var(--color-secondary, #60A5FA)', // Soft Blue fallback
        background: '#0A0A0A', // Deep Black
        card: 'rgba(255, 255, 255, 0.03)',
        text: '#FFFFFF',
        accent: 'var(--color-accent, #A78BFA)', // Lavender fallback
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-black': 'rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        heading: 'var(--font-heading, serif)',
        body: 'var(--font-body, sans-serif)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'aurora': 'aurora 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'blob': 'blob 10s infinite alternate',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        }
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      })
    })
  ],
}
