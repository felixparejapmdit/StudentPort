/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1821', 
        sidebar: 'rgba(15, 25, 35, 0.65)',
        card: '#192b3a', 
        cardHover: '#1f3547',
        border: 'rgba(255, 255, 255, 0.08)',
        primary: '#2bdcd4', 
        secondary: '#00d0ff',
        textMuted: '#8b9cb0',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(43, 220, 212, 0.3)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
