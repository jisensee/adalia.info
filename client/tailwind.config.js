const colors = require('tailwindcss/colors');

module.exports = {
  purge: {
    content: ['./index.html', './src/css/index.css', './src/**/*.js'],
    options: {
      safelist: [
        'rdt_Table',
        'rdt_TableRow',
        'rdt_TableCol',
        'rdt_TableCol_Sortable',
        'rdt_TableCell',
        'rdt_TableFooter',
        'rdt_TableHead',
        'rdt_TableHeadRow',
        'rdt_TableBody',
        'rdt_TableExpanderRow',
        'rdt_Pagination',
      ],
    },
  },
  theme: {
    colors: {
      cyan: '#69ebf4',
      gray: {
        lighter: colors.coolGray[400],
        light: colors.coolGray[600],
        DEFAULT: colors.coolGray[800],
        dark: colors.coolGray[900],
      },
      red: colors.red[500],
      white: colors.white,
    },
    extend: {
      maxHeight: {
        all: '50rem',
      },
      transitionProperty: {
        'max-h': 'max-height',
        h: 'height',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
