import { rgba } from '@totejs/uikit';

export const light = {
  colors: {
    readable: {
      normal: '#1E2026', // Dark Gray
      secondary: '#4C5264', // Gray
      disabled: '#AEB3C0', // Light Gray
      border: '#E6E8EA', // Light Gray
      white: '#FFFFFF', // White
      top: {
        secondary: '#777E92', // Gray
      },
    },
    bg: {
      bottom: '#F7F7F7', // Off-White
      middle: '#FFFFFF', // White
      walletTab: '#F7F7F7', // Off-White
      codebox: '#F2F2F2', // Light Gray
      top: {
        normal: '#FFFFFF', // White
        active: '#F7F7F7', // Off-White
      },
    },
    scene: {
      primary: {
        normal: '#29abe2', // Electric Blue
        active: '#4ca7e3', // Adjusted Active Color (Similar to Electric Blue)
        opacity: 'rgba(41, 171, 226, 0.1)', // Electric Blue with 10% opacity
        semiOpacity: 'rgba(225, 163, 37, 0.15)', // Electric Yellow with 15% opacity
      },
      success: {
        normal: '#02C076', // Green
        active: '#48FFB8', // Green
        opacity: 'rgba(2, 192, 118, 0.1)', // Green with 10% opacity
        progressBar: '#02C076', // Green
      },
      danger: {
        normal: '#D9304E', // Red
        active: '#FF898F', // Red
        opacity: 'rgba(217, 48, 78, 0.1)', // Red with 10% opacity
      },
      warning: {
        normal: '#FF6C2F', // New Warning Color (Orange)
        active: '#FFA05E', // New Warning Color (Orange)
        opacity: 'rgba(255, 108, 47, 0.1)', // New Warning Color (Orange) with 10% opacity
      },
    },
  },
  shadows: {
    normal: '0px 4px 24px rgba(0, 0, 0, 0.08)', // Shadow
  },
};
