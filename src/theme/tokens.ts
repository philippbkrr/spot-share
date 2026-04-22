// =============================================
// SpotShare Design Tokens
// =============================================

export const colors = {
  // Primary - Forest Green (trust, local, organic)
  primary: {
    50: '#f0f7f4',
    100: '#d4e9de',
    200: '#a9d3bd',
    300: '#7ebd9c',
    400: '#53a77b',
    500: '#2d8a5e', // main primary
    600: '#236e48',
    700: '#1a5232',
    800: '#11361c',
    900: '#081b06',
  },

  // Accent - Terracotta/Warm Coral (personal, warm, inviting)
  accent: {
    50: '#fdf6f4',
    100: '#fbe8e2',
    200: '#f6d1c5',
    300: '#f0b9a8',
    400: '#ea9c85',
    500: '#e47f62', // main accent
    600: '#c5623f',
    700: '#964a30',
    800: '#673221',
    900: '#371a12',
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutrals - Warm Gray (not cold, approachable)
  neutral: {
    0: '#ffffff',
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // Background (light mode)
  background: '#fafaf9',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',

  // Text
  textPrimary: '#1c1917',
  textSecondary: '#57534e',
  textMuted: '#a8a29e',
  textOnPrimary: '#ffffff',
  textOnAccent: '#ffffff',
};

export const typography = {
  // Font families - system fonts for performance
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Size scale (8px baseline)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  // 8px base unit
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12,
  },
};