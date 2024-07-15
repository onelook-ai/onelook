'use client';

import { Modal, Overlay, Popover, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'dark',
  defaultRadius: 'md',
  components: {
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: {
          transition: 'pop',
        },
        centered: true,
      },
    }),
    // Menu: Menu.extend({
    //   defaultProps: {
    //     withArrow: true,
    //     transitionProps: {
    //       transition: 'pop',
    //     },
    //   },
    // }),
    Overlay: Overlay.extend({
      defaultProps: {
        opacity: 0.8,
        blur: 12,
      },
    }),
    Popover: Popover.extend({
      defaultProps: {
        transitionProps: {
          transition: 'pop',
        },
      },
    }),
  },
});

export default theme;
