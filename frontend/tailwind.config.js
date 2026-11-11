/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        presidency: {
          navy: '#0B1E3D',
          dark: '#071326',
          blue: '#1E40AF',
          accent: '#F59E0B',
          light: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
