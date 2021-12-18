const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss/tailwind-config').TailwindTheme} */
module.exports = {
  content: [
    './index.html',
    // './src/css/index.css',
    './src/**/*.js',
    './node_modules/@vechaiui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      xs: '450px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        current: 'currentColor',
        transparent: 'transparent',
        cyan: '#69ebf4',
        black: colors.black,
        gray: {
          lighter: colors.gray[400],
          light: colors.gray[600],
          DEFAULT: colors.gray[800],
          dark: colors.gray[900],
        },
        blue: {
          DEFAULT: colors.blue[300],
          dark: colors.blue[500],
        },
        red: colors.red[500],
        white: colors.white,
        purple: colors.purple[500],
        yellow: colors.yellow[400],
        orange: colors.orange[400],
      },
      maxHeight: {
        all: '100rem',
      },
      backgroundColor: {
        transparent: 'transparent',
      },
      opacity: {
        disabled: '.3',
      },
      zIndex: {
        '-10': '-10',
      },
      transitionProperty: {
        'max-h': 'max-height',
        p: 'padding',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@vechaiui/core')],
};
