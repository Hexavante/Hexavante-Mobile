import { Platform } from 'react-native';

export const Colors = {
  light: {
    tint: '#0f766e',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    notification: '#ef4444',
    highlight: '#0891b2',
  },
  dark: {
    tint: '#22d3ee',
    background: '#06080f',
    card: '#0f172a',
    text: '#f8fafc',
    border: 'rgba(255,255,255,0.1)',
    notification: '#ef4444',
    highlight: '#22d3ee',
  },
};

export const Palette = {
  bg: '#06080f',
  surface: 'rgba(15,23,42,0.78)',
  surfaceStrong: 'rgba(15,23,42,0.96)',
  card: '#0f172a',
  border: 'rgba(255,255,255,0.1)',
  text: '#f8fafc',
  textMuted: 'rgba(248,250,252,0.6)',
  textSubtle: 'rgba(248,250,252,0.45)',
  highlight: '#22d3ee',
  highlightSoft: 'rgba(34,211,238,0.12)',
  highlightBorder: 'rgba(34,211,238,0.28)',
  cyan: '#22d3ee',
  sky: '#38bdf8',
  violet: '#a78bfa',
  amber: '#fbbf24',
  orange: '#fb923c',
  emerald: '#34d399',
  red: '#ef4444',
  gold: '#fcd34d',
  white: '#ffffff',
  skeleton: 'rgba(255,255,255,0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  android: {
    elevation: 6,
  },
  default: {},
});