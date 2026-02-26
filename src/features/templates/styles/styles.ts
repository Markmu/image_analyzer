/**
 * Template Feature Styles
 *
 * Epic 7 - Story 7.2: Template Library
 * Reusable style constants for template components
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Glassmorphism Card Style
 *
 * Reusable style object for glass-effect cards.
 * Usage:
 * ```tsx
 * <Card className="ia-glass-card ia-glass-card--static" sx={{ ...GLASS_CARD_SX, p: 3 }}>
 *   {/* content *\/}
 * </Card>
 * ```
 */
export const GLASS_CARD_SX: SxProps<Theme> = {
  background: 'var(--glass-bg-dark)',
  backgroundImage: 'none',
  border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(var(--glass-blur))',
  WebkitBackdropFilter: 'blur(var(--glass-blur))',
  boxShadow: 'var(--glass-shadow)',
} as const;

/**
 * Glassmorphism Card Style (Light variant)
 *
 * Lighter version of the glass card style for secondary content.
 */
export const GLASS_CARD_LIGHT_SX: SxProps<Theme> = {
  background: 'var(--glass-bg-light)',
  backgroundImage: 'none',
  border: '1px solid var(--glass-border-white-light)',
  backdropFilter: 'blur(var(--glass-blur))',
  WebkitBackdropFilter: 'blur(var(--glass-blur))',
  boxShadow: 'var(--glass-shadow)',
} as const;

/**
 * Text color constants for glass cards
 */
export const GLASS_TEXT_COLORS = {
  /** Primary white text for headings */
  whiteHeavy: 'var(--glass-text-white-heavy)',
  /** Medium white text for body */
  whiteMedium: 'var(--glass-text-white-medium)',
  /** Primary text color */
  primary: 'var(--glass-text-primary)',
  /** Secondary gray text for labels */
  grayMedium: 'var(--glass-text-gray-medium)',
  /** Light gray text for subtle content */
  grayLight: 'var(--glass-text-gray-light)',
} as const;

/**
 * Background color constants
 */
export const GLASS_BACKGROUND_COLORS = {
  /** Dark background for main cards */
  dark: 'var(--glass-bg-dark)',
  /** Light background for secondary areas */
  darkLight: 'var(--glass-bg-dark-light)',
  /** Light background for accents */
  light: 'var(--glass-bg-light)',
  /** Blue medium for badges */
  blueMedium: 'var(--glass-bg-blue-medium)',
} as const;

/**
 * Border color constants
 */
export const GLASS_BORDER_COLORS = {
  /** Default border */
  border: 'var(--glass-border)',
  /** Light border for inner elements */
  whiteLight: 'var(--glass-border-white-light)',
  /** Active border for focus states */
  active: 'var(--glass-border-active)',
} as const;

/**
 * Helper function to create glass card style with custom padding
 */
export function createGlassCardStyle(padding: number | { xs?: number; sm?: number; md?: number }): SxProps<Theme> {
  return {
    ...GLASS_CARD_SX,
    p: padding,
  };
}

/**
 * Helper function to merge glass card style with additional styles
 */
export function mergeGlassCardStyle(...styles: SxProps<Theme>[]): SxProps<Theme> {
  return Object.assign({}, GLASS_CARD_SX, ...styles) as SxProps<Theme>;
}
