// Colors
export const COLORS = {
  // Primary
  primary: '#FF6B35',
  primary_dark: '#E85A1F',
  primary_light: '#FF8C42',

  // Secondary
  secondary: '#004E89',
  secondary_dark: '#003366',
  secondary_light: '#0066B2',

  // Accent
  accent: '#F7931E',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F8F8',
  surface_variant: '#EEEEEE',

  // Text
  text_primary: '#212121',
  text_secondary: '#757575',
  text_tertiary: '#BDBDBD',

  // Semantic
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Borders
  border: '#E0E0E0',
};

// Dark mode colors
export const DARK_COLORS = {
  primary: '#FF8C42',
  secondary: '#87CEEB',
  accent: '#FFB347',
  background: '#121212',
  surface: '#1E1E1E',
  surface_variant: '#272727',
  text_primary: '#FFFFFF',
  text_secondary: '#B0B0B0',
  border: '#404040',
  success: '#81C784',
  warning: '#FFD54F',
  error: '#E57373',
  info: '#64B5F6',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const TYPOGRAPHY = {
  headline_large: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  headline_medium: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  headline_small: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  title_large: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  title_medium: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  title_small: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body_large: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body_medium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  body_small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label_large: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  label_medium: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
