// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        ink: '#0F1728',
        sub: '#8B93A7', 
        line: '#E7E9F1',
        panel: '#F8F9FC',
        card: '#FFFFFF',
        chip: '#EEF3F8',
        primary: '#8B5CF6',
        primarySoft: '#EDE9FE',
        danger: '#EF4444',
      },
      borderRadius: {
        'xl2': '12px',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}