'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0c6b63',
      dark: '#084941',
      light: '#3c9b92',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e07a3d',
      dark: '#b85b24',
      contrastText: '#ffffff',
    },
    background: {
      default: '#eef3f2',
      paper: '#ffffff',
    },
    text: {
      primary: '#14221f',
      secondary: '#5c6e69',
    },
    divider: '#d5e2de',
    success: { main: '#2e7d4f' },
    warning: { main: '#b86e00' },
    error: { main: '#c44536' },
  },
  typography: {
    fontFamily: 'var(--font-body), "Segoe UI", sans-serif',
    h1: { fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600 },
    h4: {
      fontFamily: 'var(--font-display), Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.03em',
    },
    h5: { fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600 },
    h6: { fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, backgroundColor: '#fff' },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        colorPrimary: { backgroundColor: '#084941' },
      },
    },
  },
});

export default theme;
