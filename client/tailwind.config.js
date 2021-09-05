const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

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
        'rc-slider-handle',
        'rc-slider-handle-dragging',
        'rc-slider-disabled',
        'rc-slider-track-1',
      ],
    },
  },
  theme: {
    colors: {
      cyan: '#69ebf4',
      black: colors.black,
      gray: {
        lighter: colors.coolGray[400],
        light: colors.coolGray[600],
        DEFAULT: colors.coolGray[800],
        dark: colors.coolGray[900],
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
    screens: {
      xs: '450px',
      ...defaultTheme.screens,
    },
    extend: {
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
  variants: {
    extend: {
      margin: ['last'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
