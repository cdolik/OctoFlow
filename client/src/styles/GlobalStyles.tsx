import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const GlobalStyles = () => {
  const theme = useTheme();
  
  return (
    <MuiGlobalStyles
      styles={{
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
        },
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          height: '100%',
          width: '100%',
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body1.fontSize,
          lineHeight: 1.5,
          overflowY: 'auto',
          transition: theme.transitions.create(['background-color', 'color'], {
            duration: theme.transitions.duration.standard,
          }),
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
        a: {
          textDecoration: 'none',
          color: theme.palette.primary.main,
          '&:hover': {
            color: theme.palette.primary.dark,
            textDecoration: 'underline',
          },
        },
        input: {
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
            WebkitTextFillColor: theme.palette.text.primary,
          },
        },
        'input, textarea, select, button': {
          fontFamily: theme.typography.fontFamily,
        },
        'img, video': {
          maxWidth: '100%',
          height: 'auto',
        },
        '::selection': {
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
        },
        '::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '::-webkit-scrollbar-track': {
          background: theme.palette.background.default,
        },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'light' 
            ? theme.palette.grey[300] 
            : theme.palette.grey[700],
          borderRadius: '5px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.mode === 'light' 
            ? theme.palette.grey[400] 
            : theme.palette.grey[600],
        },
        '.MuiCard-root': {
          borderRadius: theme.shape.borderRadius * 1.5,
          boxShadow: theme.shadows[2],
          transition: theme.transitions.create(['box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        },
        '.card-hover-effect': {
          transition: 'transform 0.15s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
        '.animate-ripple': {
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: '""',
            display: 'block',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            backgroundImage: `radial-gradient(circle, ${theme.palette.primary.light} 10%, transparent 10.01%)`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '50%',
            transform: 'scale(10, 10)',
            opacity: 0,
            transition: 'transform .5s, opacity 1s',
          },
          '&:active:after': {
            transform: 'scale(0, 0)',
            opacity: 0.3,
            transition: '0s',
          },
        },
        '.light-divider': {
          borderColor: theme.palette.mode === 'light' 
            ? 'rgba(0, 0, 0, 0.08)' 
            : 'rgba(255, 255, 255, 0.08)',
        },
        '.code-block': {
          fontFamily: 'monospace',
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[100] 
            : theme.palette.grey[900],
          padding: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
          overflow: 'auto',
        },
        '.chip-success': {
          backgroundColor: theme.palette.success.lighter,
          color: theme.palette.success.dark,
        },
        '.chip-warning': {
          backgroundColor: theme.palette.warning.lighter,
          color: theme.palette.warning.dark,
        },
        '.chip-error': {
          backgroundColor: theme.palette.danger.lighter,
          color: theme.palette.danger.dark,
        },
        '.chip-info': {
          backgroundColor: theme.palette.info.lighter,
          color: theme.palette.info.dark,
        },
        '.chip-neutral': {
          backgroundColor: theme.palette.neutral.lighter,
          color: theme.palette.neutral.dark,
        },
        '.loading-skeleton': {
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(0, 0, 0, 0.11)' 
            : 'rgba(255, 255, 255, 0.11)',
          animation: 'pulse 1.5s ease-in-out 0.5s infinite',
        },
        '@keyframes pulse': {
          '0%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
          '100%': {
            opacity: 1,
          },
        },
        '.fade-in': {
          animation: 'fadeIn 0.3s ease-in',
        },
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
        '.slide-up': {
          animation: 'slideUp 0.4s ease-out',
        },
        '@keyframes slideUp': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      }}
    />
  );
};

export default GlobalStyles; 