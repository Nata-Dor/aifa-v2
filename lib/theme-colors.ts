// lib/theme-colors.ts
// Theme color utilities for PWA and UI components

import { appConfig } from '@/config/app-config';

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
}

/**
 * Get CSS variable for a color
 * Falls back to primary color if not available
 */
export function getCSSVariable(variableName: string): string {
  if (typeof window === 'undefined') {
    return 'var(--primary, #3b82f6)';
  }

  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(`--${variableName}`).trim() || 'var(--primary, #3b82f6)';
}

/**
 * Get RGB values for theme color
 * Used for rgba colors in PWA UI
 */
export function getPrimaryColorRGB(): string {
  if (typeof window === 'undefined') {
    return '59, 130, 246'; // Tailwind blue-500 default
  }

  const primary = getCSSVariable('primary');

  // Parse hex to RGB
  if (primary.startsWith('#')) {
    const hex = primary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  return '59, 130, 246'; // Fallback
}

/**
 * Get theme colors for PWA install prompt
 */
export function getThemeColorsForPWA(): ThemeColors {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    primary: getCSSVariable('primary'),
    accent: getCSSVariable('accent'),
    background: isDark ? 'hsl(var(--background-dark, 240 10% 3.9%))' : 'hsl(var(--background, 0 0% 100%))',
    foreground: isDark ? 'hsl(var(--foreground-dark, 0 0% 98%))' : 'hsl(var(--foreground, 0 0% 3.6%))',
  };
}

/**
 * Get PWA theme color from config
 */
export function getPWAThemeColor(isDark: boolean = false): string {
  return isDark ? appConfig.pwa.themeColor : appConfig.pwa.backgroundColor;
}
