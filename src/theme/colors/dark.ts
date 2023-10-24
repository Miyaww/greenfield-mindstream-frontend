import { rgba } from '@totejs/uikit';

export const dark = {
  colors: {
    readable: {
      normal: '#E6E8EA', // Light Gray
      secondary: '#cccccc', // Light Gray
      disabled: '#999999', // Light Gray
      border: '#2E323A', // Dark Gray
      white: '#FFFFFF', // White
      top: {
        secondary: '#929AA5', // Light Gray
      },
    },
    bg: {
      bottom: '#14151A', // Dark Gray
      middle: '#404040', // Dark Gray
      walletTab: '#F7F7F7', // Off-White
      codebox: '#262D37', // Dark Gray
      top: {
        normal: '#2B2F36', // Dark Gray
        active: '#2E323A', // Dark Gray
      },
    },
    scene: {
      primary: {
        normal: '#29abe2', // Electric Blue
        active: '#4ca7e3', // Electric Yellow
        opacity: rgba(184, 69, 255, 0.1), // Electric Blue with 10% opacity
        semiOpacity: rgba(225, 163, 37, 0.15), // Electric Yellow with 15% opacity
      },
      success: {
        normal: '#02C076', // Green
        active: '#48FFB8', // Green
        opacity: rgba(46, 209, 145, 0.1), // Green with 10% opacity
        progressBar: '#02C076', // Green
      },
      danger: {
        normal: '#D9304E', // Red
        active: '#FF898F', // Red
        opacity: rgba(252, 110, 117, 0.1), // Red with 10% opacity
      },
      warning: {
        normal: '#FF6C2F', // New Warning Color (Orange)
        active: '#FFA05E', // New Warning Color (Orange)
        opacity: rgba(255, 108, 47, 0.1), // New Warning Color (Orange) with 10% opacity
      },
    },
  },
  shadows: {
    normal: '0px 4px 24px rgba(0, 0, 0, 0.08)', // Shadow
  },
};
