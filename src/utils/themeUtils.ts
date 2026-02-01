import { WeatherCondition } from '../types/weather';

export interface ThemeColors {
  primary: string[];
  secondary: string;
  text: string;
  textSecondary: string;
  card: string;
  cardBorder: string;
  accent: string;
  isDark?: boolean;
  cardGlass?: string;
  glowColor?: string;
}

const themes: Record<string, Record<'day' | 'night', ThemeColors>> = {
  clear: {
    day: {
      primary: ['#3B82F6', '#60A5FA', '#93C5FD'],
      secondary: 'rgba(255, 255, 255, 0.25)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.18)',
      cardBorder: 'rgba(255, 255, 255, 0.3)',
      accent: '#FBBF24',
      cardGlass: 'rgba(255, 255, 255, 0.12)',
      glowColor: 'rgba(251, 191, 36, 0.4)',
    },
    night: {
      primary: ['#0F172A', '#1E293B', '#334155'],
      secondary: 'rgba(255, 255, 255, 0.15)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.75)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#E2E8F0',
      cardGlass: 'rgba(255, 255, 255, 0.05)',
      glowColor: 'rgba(226, 232, 240, 0.3)',
    },
  },
  'partly-cloudy': {
    day: {
      primary: ['#4F86C6', '#64B5F6', '#90CAF9'],
      secondary: 'rgba(255, 255, 255, 0.25)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.18)',
      cardBorder: 'rgba(255, 255, 255, 0.28)',
      accent: '#FCD34D',
      cardGlass: 'rgba(255, 255, 255, 0.12)',
      glowColor: 'rgba(252, 211, 77, 0.4)',
    },
    night: {
      primary: ['#1E3A5F', '#2D4A6F', '#1E293B'],
      secondary: 'rgba(255, 255, 255, 0.15)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.75)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.18)',
      accent: '#CBD5E1',
      cardGlass: 'rgba(255, 255, 255, 0.06)',
      glowColor: 'rgba(203, 213, 225, 0.3)',
    },
  },
  cloudy: {
    day: {
      primary: ['#64748B', '#94A3B8', '#CBD5E1'],
      secondary: 'rgba(0, 0, 0, 0.08)',
      text: '#1E293B',
      textSecondary: 'rgba(30, 41, 59, 0.75)',
      card: 'rgba(255, 255, 255, 0.55)',
      cardBorder: 'rgba(255, 255, 255, 0.65)',
      accent: '#64748B',
      cardGlass: 'rgba(255, 255, 255, 0.35)',
      glowColor: 'rgba(100, 116, 139, 0.3)',
    },
    night: {
      primary: ['#334155', '#475569', '#1E293B'],
      secondary: 'rgba(255, 255, 255, 0.12)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.75)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.18)',
      accent: '#94A3B8',
      cardGlass: 'rgba(255, 255, 255, 0.06)',
      glowColor: 'rgba(148, 163, 184, 0.3)',
    },
  },
  fog: {
    day: {
      primary: ['#78909C', '#B0BEC5', '#ECEFF1'],
      secondary: 'rgba(0, 0, 0, 0.08)',
      text: '#37474F',
      textSecondary: 'rgba(55, 71, 79, 0.75)',
      card: 'rgba(255, 255, 255, 0.6)',
      cardBorder: 'rgba(255, 255, 255, 0.7)',
      accent: '#546E7A',
      cardGlass: 'rgba(255, 255, 255, 0.4)',
      glowColor: 'rgba(84, 110, 122, 0.3)',
    },
    night: {
      primary: ['#263238', '#37474F', '#1E293B'],
      secondary: 'rgba(255, 255, 255, 0.12)',
      text: '#ECEFF1',
      textSecondary: 'rgba(236, 239, 241, 0.75)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#78909C',
      cardGlass: 'rgba(255, 255, 255, 0.05)',
      glowColor: 'rgba(120, 144, 156, 0.3)',
    },
  },
  drizzle: {
    day: {
      primary: ['#5C6BC0', '#7986CB', '#9FA8DA'],
      secondary: 'rgba(255, 255, 255, 0.2)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.18)',
      cardBorder: 'rgba(255, 255, 255, 0.28)',
      accent: '#81D4FA',
      cardGlass: 'rgba(255, 255, 255, 0.12)',
      glowColor: 'rgba(129, 212, 250, 0.4)',
    },
    night: {
      primary: ['#1A237E', '#283593', '#1E293B'],
      secondary: 'rgba(255, 255, 255, 0.12)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.75)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#4FC3F7',
      cardGlass: 'rgba(255, 255, 255, 0.05)',
      glowColor: 'rgba(79, 195, 247, 0.35)',
    },
  },
  rain: {
    day: {
      primary: ['#37474F', '#546E7A', '#78909C'],
      secondary: 'rgba(255, 255, 255, 0.18)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.15)',
      cardBorder: 'rgba(255, 255, 255, 0.22)',
      accent: '#4FC3F7',
      cardGlass: 'rgba(255, 255, 255, 0.1)',
      glowColor: 'rgba(79, 195, 247, 0.4)',
    },
    night: {
      primary: ['#0D47A1', '#1565C0', '#0F172A'],
      secondary: 'rgba(255, 255, 255, 0.12)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.75)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#42A5F5',
      cardGlass: 'rgba(255, 255, 255, 0.05)',
      glowColor: 'rgba(66, 165, 245, 0.35)',
    },
  },
  snow: {
    day: {
      primary: ['#B3E5FC', '#81D4FA', '#4FC3F7'],
      secondary: 'rgba(0, 0, 0, 0.08)',
      text: '#263238',
      textSecondary: 'rgba(38, 50, 56, 0.8)',
      card: 'rgba(255, 255, 255, 0.45)',
      cardBorder: 'rgba(255, 255, 255, 0.55)',
      accent: '#0288D1',
      cardGlass: 'rgba(255, 255, 255, 0.3)',
      glowColor: 'rgba(2, 136, 209, 0.3)',
    },
    night: {
      primary: ['#1E3A5F', '#34567A', '#0F172A'],
      secondary: 'rgba(255, 255, 255, 0.12)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.8)',
      card: 'rgba(255, 255, 255, 0.12)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#81D4FA',
      cardGlass: 'rgba(255, 255, 255, 0.08)',
      glowColor: 'rgba(129, 212, 250, 0.35)',
    },
  },
  thunderstorm: {
    day: {
      primary: ['#1A1A2E', '#16213E', '#0F3460'],
      secondary: 'rgba(255, 255, 255, 0.12)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.12)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#FFC107',
      cardGlass: 'rgba(255, 255, 255, 0.08)',
      glowColor: 'rgba(255, 193, 7, 0.5)',
    },
    night: {
      primary: ['#0D0221', '#190A33', '#120458'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.8)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#FFD54F',
      cardGlass: 'rgba(255, 255, 255, 0.05)',
      glowColor: 'rgba(255, 213, 79, 0.45)',
    },
  },
};

export function getThemeColors(condition: WeatherCondition, isDay: boolean): ThemeColors {
  const theme = themes[condition] || themes.clear;
  const themeColors = theme[isDay ? 'day' : 'night'];
  return {
    ...themeColors,
    isDark: !isDay,
  };
}

export function getGradientColors(condition: WeatherCondition, isDay: boolean): string[] {
  return getThemeColors(condition, isDay).primary;
}

