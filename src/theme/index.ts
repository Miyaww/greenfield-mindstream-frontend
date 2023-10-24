import { Theme } from '@totejs/uikit';

import { colors } from './colors';

export const theme: Theme = {
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark',
    storageKey: 'mindstream-color-mode',
  },

  ...colors,

  styles: {
    global: {
      body: {
        bg: 'bg.bottom',
        color: 'readable.normal',
        lineHeight: 'normal',
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
};
