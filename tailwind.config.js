/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1D9E75',
          light: '#E1F5EE',
          dark: '#085041',
        },
        accent: {
          mobilBg: '#E6F1FB',
          mobilText: '#185FA5',
          motorBg: '#FAEEDA',
          motorText: '#854F0B',
          trukBg: '#FAECE7',
          trukText: '#993C1D',
          warningBg: '#FEF3C7',
          warningText: '#92400E',
        },
        pageBg: '#F8F8F6',
      }
    },
  },
  plugins: [],
}
