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
        'rdt_ExpanderRow',
        'rdt_Pagination',
        'rdt_TableHeader',
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
      blue: colors.blue[300],
      red: colors.red[500],
      white: colors.white,
      purple: colors.purple[500],
      yellow: colors.yellow[400],
      orange: colors.orange[400],
    },
    extend: {
      maxHeight: {
        all: '100rem',
      },
      zIndex: {
        '-10': '-10',
      },
      transitionProperty: {
        'max-h': 'max-height',
      },
    },
  },
  variants: {
    extend: {
      margin: ['last'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
