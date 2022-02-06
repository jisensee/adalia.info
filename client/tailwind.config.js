const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.js',
    './node_modules/@vechaiui/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '450px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        current: 'currentColor',
        transparent: 'transparent',
        black: colors.black,
        'primary-std': colors.cyan['300'],
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
