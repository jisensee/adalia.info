import { colors, extendTheme } from '@vechaiui/react';

export const defaultColorScheme = 'theme';

const colorScheme = {
  id: defaultColorScheme,
  type: 'dark',
  colors: {
    bg: {
      base: colors.blueGray['900'],
      fill: colors.blueGray['800'],
    },
    text: {
      foreground: colors.gray['100'],
      muted: colors.gray['500'],
    },
    primary: colors.cyan,
    neutral: colors.coolGray,
  },
};

export const theme = extendTheme({
  cursor: 'pointer',
  rounded: '1rem',
  colorSchemes: {
    [defaultColorScheme]: colorScheme,
  },
});
