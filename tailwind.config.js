/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lilac: {
          50: '#F6F4FB',
          100: '#EDE9F7',
          200: '#DDD6F0',
          300: '#C4B9E5',
          400: '#AE9FD8',
          500: '#9A90CC',
          DEFAULT: '#9A90CC',
          600: '#7C6FB8',
          700: '#64589F',
          800: '#4E4380',
          900: '#3C3365',
          950: '#251F42'
        },
        periwinkle: {
          DEFAULT: '#9DB5DC',
          light: '#B6C9E8',
          dark: '#7995C7'
        }
      },
      fontFamily: {
        brand: ["'Bodoni Moda'", "'Playfair Display'", "'Cormorant Garamond'", 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
};
