/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#0b132b',
        dusk: '#1c2541',
        accent: '#ff4d4d',
        fog: '#e6e8ec',
        mist: '#f5f6fa',
      },
      boxShadow: {
        card: '0 15px 45px rgba(12, 18, 41, 0.12)',
      },
    },
  },
  plugins: [],
}
