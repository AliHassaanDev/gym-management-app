// GYM PAGLU — Professional Design System Tokens
// Faithful match to the 12-screen design mockup:
// Crisp light surfaces (#F8FAFC / #FFFFFF) with slate-900 accents (#0F172A),
// rich athletic gold (#F59E0B / #FFD600), and dedicated sleek dark mode for attendance & splash.

export const Colors = {
  // Light Theme (Main Application)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#F1F5F9',
  surfaceDark: '#111827', // for dark stat cards on dashboard
  surfaceDarkCard: '#1E293B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Brand Accents
  primary: '#F59E0B',       // athletic gold / warm amber
  primaryHover: '#D97706',
  primaryLight: '#FEF3C7',
  primaryText: '#0F172A',   // dark readable text on yellow badges/buttons

  // Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',
  textLightMuted: '#94A3B8',

  // Status & Badges (Soft Pills matching mockup)
  success: '#16A34A',
  successBg: '#DCFCE7',
  successText: '#15803D',

  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningText: '#B45309',

  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  dangerText: '#B91C1C',

  info: '#2563EB',
  infoBg: '#DBEAFE',
  infoText: '#1D4ED8',

  // Dark Theme Tokens (for Biometric Attendance & Splash)
  darkBackground: '#0B0F15',
  darkSurface: '#161F2E',
  darkSurfaceElevated: '#1F2937',
  darkBorder: '#1F2937',
  darkNeonGreen: '#10B981',
  darkNeonGreenBg: '#064E3B33',
};

export const Fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  darkCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
};
