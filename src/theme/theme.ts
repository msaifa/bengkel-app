import React from 'react';
import { createTheme, alpha } from '@mui/material/styles';

// ─── Design Token Palette ────────────────────────────────────────────────────
// Mirrors the design.md color system exactly.
// Use these constants when you need raw hex values outside of MUI theme access.
export const colors = {
  // Brand & Accent
  primary: '#e60023',
  primaryPressed: '#cc001f',

  // Surface
  canvas: '#ffffff',
  surfaceSoft: '#fbfbf9',
  surfaceCard: '#f6f6f3',
  secondaryBg: '#e5e5e0',
  secondaryPressed: '#c8c8c1',
  surfaceDark: '#262622',
  hairline: '#dadad3',
  hairlineSoft: '#e5e5e0',

  // Text
  ink: '#000000',
  inkSoft: '#211922',
  body: '#33332e',
  charcoal: '#262622',
  mute: '#62625b',
  ash: '#91918c',
  stone: '#c8c8c1',
  onDark: '#ffffff',

  // Semantic
  error: '#9e0a0a',
  errorDeep: '#cc001f',
  successDeep: '#103c25',
  successPale: '#c7f0da',
  focusOuter: '#435ee5',
  focusInner: '#ffffff',
} as const;

// ─── Font Stack ──────────────────────────────────────────────────────────────
// Inter is the closest open-source substitute for Pin Sans.
const fontStack = [
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

// ─── Theme ───────────────────────────────────────────────────────────────────
const theme = createTheme({
  // ── Palette ────────────────────────────────────────────────────────────────
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryPressed,
      contrastText: colors.onDark,
    },
    secondary: {
      main: colors.secondaryBg,
      dark: colors.secondaryPressed,
      contrastText: colors.ink,
    },
    background: {
      default: colors.surfaceSoft,
      paper: colors.canvas,
    },
    text: {
      primary: colors.body,
      secondary: colors.mute,
      disabled: colors.ash,
    },
    divider: colors.hairline,
    error: {
      main: colors.error,
      dark: colors.errorDeep,
    },
    success: {
      main: colors.successDeep,
      light: colors.successPale,
    },
  },

  // ── Typography ─────────────────────────────────────────────────────────────
  // Mirrors the design.md type scale.
  typography: {
    fontFamily: fontStack,
    // display-xl → h1
    h1: {
      fontSize: '4.375rem',   // 70px
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '-1.2px',
    },
    // display-lg → h2
    h2: {
      fontSize: '2.75rem',    // 44px
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.8px',
    },
    // heading-xl → h3
    h3: {
      fontSize: '1.75rem',    // 28px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-1.2px',
    },
    // heading-lg → h4
    h4: {
      fontSize: '1.375rem',   // 22px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: 0,
    },
    // heading-md → h5
    h5: {
      fontSize: '1.125rem',   // 18px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    // body-strong → h6 (used for card titles, nav links)
    h6: {
      fontSize: '1rem',       // 16px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    // body-md
    body1: {
      fontSize: '1rem',       // 16px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    // body-sm
    body2: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    // caption-md
    caption: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    // button-md
    button: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: 0,
      textTransform: 'none' as const,
    },
    overline: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
  },

  // ── Shape ──────────────────────────────────────────────────────────────────
  // rounded.md = 16px is the dominant radius.
  // MUI's borderRadius multiplier: shape.borderRadius × n.
  // We set base to 4 so borderRadius={4} = 16px, borderRadius={8} = 32px.
  shape: {
    borderRadius: 4,
  },

  // ── Component Overrides ────────────────────────────────────────────────────
  components: {
    // ── Button ──────────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,           // rounded.md
          padding: '6px 14px',
          minHeight: 40,
          fontWeight: 700,
          fontSize: '0.875rem',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '&:active': { boxShadow: 'none' },
        },
        contained: {
          backgroundColor: colors.primary,
          color: colors.onDark,
          '&:hover': { backgroundColor: colors.primaryPressed },
          '&:active': { backgroundColor: colors.primaryPressed },
          '&.Mui-disabled': {
            backgroundColor: colors.surfaceCard,
            color: colors.ash,
          },
        },
        outlined: {
          borderColor: colors.hairline,
          color: colors.ink,
          backgroundColor: colors.secondaryBg,
          '&:hover': { backgroundColor: colors.secondaryPressed, borderColor: colors.hairline },
        },
        text: {
          color: colors.ink,
          '&:hover': { backgroundColor: alpha(colors.ink, 0.05) },
        },
        sizeLarge: {
          padding: '10px 20px',
          minHeight: 48,
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '4px 10px',
          minHeight: 32,
          fontSize: '0.75rem',
        },
      },
    },

    // ── IconButton ───────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '50%',        // rounded.full
          color: colors.ink,
          '&:hover': { backgroundColor: alpha(colors.ink, 0.06) },
        },
      },
    },

    // ── TextField / Input ────────────────────────────────────────────────────
    // Select-all on focus for all text inputs
    MuiInputBase: {
      defaultProps: {
        onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          e.target.select();
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,           // rounded.md
          backgroundColor: colors.canvas,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.ash,
            borderWidth: 1,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.charcoal,
          },
        },
        input: {
          padding: '11px 15px',
          fontSize: '1rem',
          color: colors.ink,
          '&::placeholder': { color: colors.ash, opacity: 1 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.mute,
          fontSize: '1rem',
        },
      },
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,           // rounded.md
          backgroundColor: colors.canvas,
          boxShadow: 'none',
          border: `1px solid ${colors.hairline}`,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': { paddingBottom: 24 },
        },
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
        elevation1: {
          border: `1px solid ${colors.hairline}`,
        },
        elevation2: {
          border: `1px solid ${colors.hairline}`,
        },
        elevation3: {
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
          border: 'none',
        },
      },
    },

    // ── AppBar ───────────────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.canvas,
          color: colors.ink,
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.hairline}`,
        },
      },
    },

    // ── Drawer / Sidebar ─────────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.canvas,
          borderRight: `1px solid ${colors.hairline}`,
          boxShadow: 'none',
        },
      },
    },

    // ── List / Nav items ─────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,           // rounded.md
          margin: '2px 8px',
          padding: '8px 12px',
          color: colors.mute,
          '&:hover': {
            backgroundColor: colors.surfaceCard,
            color: colors.ink,
          },
          '&.Mui-selected': {
            backgroundColor: colors.surfaceCard,
            color: colors.ink,
            fontWeight: 600,
            '&:hover': { backgroundColor: colors.secondaryBg },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: 36,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 'inherit',
        },
      },
    },

    // ── Divider ──────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.hairline,
        },
      },
    },

    // ── Chip ─────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,         // rounded.full
          fontWeight: 700,
          fontSize: '0.75rem',
          backgroundColor: colors.surfaceCard,
          color: colors.ink,
          border: 'none',
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: colors.ink,
            color: colors.onDark,
          },
        },
      },
    },

    // ── Alert ────────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontSize: '0.875rem',
        },
      },
    },

    // ── Tooltip ──────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: colors.charcoal,
          fontSize: '0.75rem',
        },
      },
    },

    // ── CssBaseline ──────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        html: { height: '100%' },
        body: {
          minHeight: '100%',
          backgroundColor: colors.surfaceSoft,
          color: colors.body,
          fontFamily: fontStack,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        a: { color: 'inherit', textDecoration: 'none' },
      },
    },
  },
});

export default theme;
