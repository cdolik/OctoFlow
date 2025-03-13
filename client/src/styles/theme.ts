import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    danger: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
    danger: PaletteOptions['primary'];
  }

  interface TypeBackground {
    card: string;
    darker: string;
  }

  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}

// GitHub-inspired color palette
const basePalette = {
  primary: {
    main: '#2188ff',
    light: '#79b8ff',
    dark: '#0366d6',
    lighter: '#c8e1ff',
    darker: '#044289',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#6f42c1',
    light: '#8a63d2',
    dark: '#5a32a3',
    lighter: '#d1bcf9',
    darker: '#3a1f71',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2da44e',
    light: '#57ab5a',
    dark: '#1a7f37',
    lighter: '#aff5b4',
    darker: '#033a16',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#d29922',
    light: '#dfa14e',
    dark: '#9e6a03',
    lighter: '#fff0b3',
    darker: '#3b2300',
    contrastText: '#ffffff',
  },
  danger: {
    main: '#cf222e',
    light: '#e24c4c',
    dark: '#a40e26',
    lighter: '#ffd7d5',
    darker: '#620018',
    contrastText: '#ffffff',
  },
  info: {
    main: '#58a6ff',
    light: '#85c0ff',
    dark: '#1f7bd4',
    lighter: '#d2eaff',
    darker: '#033d8a',
    contrastText: '#ffffff',
  },
  neutral: {
    main: '#6e7781',
    light: '#8c959f',
    dark: '#424a53',
    lighter: '#e6e8e8',
    darker: '#22272e',
    contrastText: '#ffffff',
  },
};

// Create theme for light mode
export const lightTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'light',
      primary: basePalette.primary,
      secondary: basePalette.secondary,
      success: basePalette.success,
      warning: basePalette.warning,
      danger: basePalette.danger,
      info: basePalette.info,
      neutral: basePalette.neutral,
      background: {
        default: '#f6f8fa',
        paper: '#ffffff',
        card: '#ffffff',
        darker: '#f0f2f4',
      },
      text: {
        primary: '#24292f',
        secondary: '#57606a',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1.125rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 6,
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
      '0px 3px 1px -2px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.03),0px 1px 5px 0px rgba(0,0,0,0.05)',
      '0px 3px 3px -2px rgba(0,0,0,0.05),0px 3px 4px 0px rgba(0,0,0,0.03),0px 1px 8px 0px rgba(0,0,0,0.05)',
      '0px 2px 4px -1px rgba(0,0,0,0.05),0px 4px 5px 0px rgba(0,0,0,0.03),0px 1px 10px 0px rgba(0,0,0,0.05)',
      '0px 3px 5px -1px rgba(0,0,0,0.05),0px 5px 8px 0px rgba(0,0,0,0.03),0px 1px 14px 0px rgba(0,0,0,0.05)',
      '0px 3px 5px -1px rgba(0,0,0,0.05),0px 6px 10px 0px rgba(0,0,0,0.03),0px 1px 18px 0px rgba(0,0,0,0.05)',
      '0px 4px 5px -2px rgba(0,0,0,0.05),0px 7px 10px 1px rgba(0,0,0,0.03),0px 2px 16px 1px rgba(0,0,0,0.05)',
      '0px 5px 5px -3px rgba(0,0,0,0.05),0px 8px 10px 1px rgba(0,0,0,0.03),0px 3px 14px 2px rgba(0,0,0,0.05)',
      '0px 5px 6px -3px rgba(0,0,0,0.05),0px 9px 12px 1px rgba(0,0,0,0.03),0px 3px 16px 2px rgba(0,0,0,0.05)',
      '0px 6px 6px -3px rgba(0,0,0,0.05),0px 10px 14px 1px rgba(0,0,0,0.03),0px 4px 18px 3px rgba(0,0,0,0.05)',
      '0px 6px 7px -4px rgba(0,0,0,0.05),0px 11px 15px 1px rgba(0,0,0,0.03),0px 4px 20px 3px rgba(0,0,0,0.05)',
      '0px 7px 8px -4px rgba(0,0,0,0.05),0px 12px 17px 2px rgba(0,0,0,0.03),0px 5px 22px 4px rgba(0,0,0,0.05)',
      '0px 7px 8px -4px rgba(0,0,0,0.05),0px 13px 19px 2px rgba(0,0,0,0.03),0px 5px 24px 4px rgba(0,0,0,0.05)',
      '0px 7px 9px -4px rgba(0,0,0,0.05),0px 14px 21px 2px rgba(0,0,0,0.03),0px 5px 26px 4px rgba(0,0,0,0.05)',
      '0px 8px 9px -5px rgba(0,0,0,0.05),0px 15px 22px 2px rgba(0,0,0,0.03),0px 6px 28px 5px rgba(0,0,0,0.05)',
      '0px 8px 10px -5px rgba(0,0,0,0.05),0px 16px 24px 2px rgba(0,0,0,0.03),0px 6px 30px 5px rgba(0,0,0,0.05)',
      '0px 8px 11px -5px rgba(0,0,0,0.05),0px 17px 26px 2px rgba(0,0,0,0.03),0px 6px 32px 5px rgba(0,0,0,0.05)',
      '0px 9px 11px -5px rgba(0,0,0,0.05),0px 18px 28px 2px rgba(0,0,0,0.03),0px 7px 34px 6px rgba(0,0,0,0.05)',
      '0px 9px 12px -6px rgba(0,0,0,0.05),0px 19px 29px 2px rgba(0,0,0,0.03),0px 7px 36px 6px rgba(0,0,0,0.05)',
      '0px 10px 13px -6px rgba(0,0,0,0.05),0px 20px 31px 3px rgba(0,0,0,0.03),0px 8px 38px 7px rgba(0,0,0,0.05)',
      '0px 10px 13px -6px rgba(0,0,0,0.05),0px 21px 33px 3px rgba(0,0,0,0.03),0px 8px 40px 7px rgba(0,0,0,0.05)',
      '0px 10px 14px -6px rgba(0,0,0,0.05),0px 22px 35px 3px rgba(0,0,0,0.03),0px 8px 42px 7px rgba(0,0,0,0.05)',
      '0px 11px 14px -7px rgba(0,0,0,0.05),0px 23px 36px 3px rgba(0,0,0,0.03),0px 9px 44px 8px rgba(0,0,0,0.05)',
      '0px 11px 15px -7px rgba(0,0,0,0.05),0px 24px 38px 3px rgba(0,0,0,0.03),0px 9px 46px 8px rgba(0,0,0,0.05)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            padding: '8px 16px',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 8,
          },
        },
      },
    },
  })
);

// Create theme for dark mode
export const darkTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#58a6ff',
        light: '#85c0ff',
        dark: '#1f7bd4',
        lighter: '#d2eaff',
        darker: '#033d8a',
        contrastText: '#000000',
      },
      secondary: {
        main: '#bc8cff',
        light: '#dcbdff',
        dark: '#8957e5',
        lighter: '#eddeff',
        darker: '#4e2a89',
        contrastText: '#000000',
      },
      success: {
        main: '#57ab5a',
        light: '#7dc482',
        dark: '#2ea043',
        lighter: '#aff5b4',
        darker: '#033a16',
        contrastText: '#000000',
      },
      warning: {
        main: '#e3b341',
        light: '#ffdf5d',
        dark: '#bb8009',
        lighter: '#fff8c5',
        darker: '#3b2e00',
        contrastText: '#000000',
      },
      danger: {
        main: '#f85149',
        light: '#ff938a',
        dark: '#da3633',
        lighter: '#ffb8b0',
        darker: '#691e12',
        contrastText: '#000000',
      },
      info: {
        main: '#79c0ff',
        light: '#addaff',
        dark: '#56a0e5',
        lighter: '#d8ebff',
        darker: '#0a2e4a',
        contrastText: '#000000',
      },
      neutral: {
        main: '#8b949e',
        light: '#acb6c0',
        dark: '#6e7681',
        lighter: '#eaeef2',
        darker: '#272b33',
        contrastText: '#000000',
      },
      background: {
        default: '#0d1117',
        paper: '#161b22',
        card: '#161b22',
        darker: '#0d1117',
      },
      text: {
        primary: '#f0f6fc',
        secondary: '#8b949e',
      },
      divider: 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1.125rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 6,
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
      '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
      '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
      '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
      '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
      '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
      '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
      '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
      '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
      '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
      '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
      '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            padding: '8px 16px',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)',
            borderRadius: 8,
            backgroundColor: '#1a2233',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 8,
          },
        },
      },
    },
  })
);

export default lightTheme; 