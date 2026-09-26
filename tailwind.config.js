/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ark: {
          dark: '#0e1117',
          darker: '#080a0e',
          card: '#161b22',
          border: '#2a313d',
          accent: '#00b4d8',
          yellow: '#f39c12',
          red: '#ef4444',
          green: '#10b981',
          gold: '#fbbf24',
          tier1: '#9ca3af',
          tier2: '#a3e635',
          tier3: '#38bdf8',
          tier4: '#c084fc',
          tier5: '#fbbf24',
        }
      }
    },
  },
  plugins: [],
}
