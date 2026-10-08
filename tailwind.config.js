/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace'],
        cyber: ['"Rajdhani"', 'sans-serif'],
      },
      colors: {
        cyber: {
          950: '#040711',
          900: '#070c1b',
          850: '#0b1329',
          800: '#0f1b38',
          700: '#172852',
          blue: '#00d2ff',
          neon: '#00f5a0',
          red: '#ff0055',
          amber: '#ffaa00',
          purple: '#a855f7',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(6,182,212,0.2))' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'radar': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
