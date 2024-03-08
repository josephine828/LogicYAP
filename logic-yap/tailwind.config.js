const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9e8e8',
          100: '#f2c6c7',
          200: '#eaa3a4',
          300: '#e38081',
          400: '#da5552',
          500: '#cc444b',
          600: '#b23c43',
          700: '#942f36',
          800: '#74242a',
          900: '#5d1d23',
        },
        secondary: {
          50: '#fdf0f0',
          100: '#fad7d8',
          200: '#f7bfbf',
          300: '#f4a6a8',
          400: '#f17e7e',
          500: '#eeb7b4',
          600: '#eb8e8f',
          700: '#e56768',
          800: '#e14345',
          900: '#da5552',
        },
      },
    },
    screens: {
      xs: "480px",
      sm: "768px",
      md: "1060px",
    },
  },
  plugins: [require("tailwindcss-animated")],
});
