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
}

const themes: Record<string, Record<'day' | 'night', ThemeColors>> = {
  clear: {
    day: {
      primary: ['#4A90E2', '#67B8DE', '#87CEEB'],
      secondary: 'rgba(255, 255, 255, 0.2)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      card: 'rgba(255, 255, 255, 0.15)',
      cardBorder: 'rgba(255, 255, 255, 0.25)',
      accent: '#FFD700',
    },
    night: {
      primary: ['#1a1a2e', '#16213e', '#0f3460'],
      secondary: 'rgba(255, 255, 255, 0.15)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#E8E8E8',
    },
  },
  'partly-cloudy': {
    day: {
      primary: ['#5B86E5', '#36D1DC', '#87CEEB'],
      secondary: 'rgba(255, 255, 255, 0.2)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      card: 'rgba(255, 255, 255, 0.15)',
      cardBorder: 'rgba(255, 255, 255, 0.25)',
      accent: '#FFE082',
    },
    night: {
      primary: ['#2C3E50', '#3498DB', '#1a1a2e'],
      secondary: 'rgba(255, 255, 255, 0.15)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#BDBDBD',
    },
  },
  cloudy: {
    day: {
      primary: ['#757F9A', '#D7DDE8', '#B8C6DB'],
      secondary: 'rgba(0, 0, 0, 0.1)',
      text: '#2C3E50',
      textSecondary: 'rgba(44, 62, 80, 0.7)',
      card: 'rgba(255, 255, 255, 0.4)',
      cardBorder: 'rgba(255, 255, 255, 0.5)',
      accent: '#78909C',
    },
    night: {
      primary: ['#373B44', '#4286f4', '#2C3E50'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#90A4AE',
    },
  },
  fog: {
    day: {
      primary: ['#8E9EAB', '#EEF2F3', '#CFD9DF'],
      secondary: 'rgba(0, 0, 0, 0.1)',
      text: '#37474F',
      textSecondary: 'rgba(55, 71, 79, 0.7)',
      card: 'rgba(255, 255, 255, 0.5)',
      cardBorder: 'rgba(255, 255, 255, 0.6)',
      accent: '#607D8B',
    },
    night: {
      primary: ['#2C3E50', '#4A5568', '#1a202c'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#E2E8F0',
      textSecondary: 'rgba(226, 232, 240, 0.7)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#718096',
    },
  },
  drizzle: {
    day: {
      primary: ['#606c88', '#3f4c6b', '#667db6'],
      secondary: 'rgba(255, 255, 255, 0.15)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      card: 'rgba(255, 255, 255, 0.15)',
      cardBorder: 'rgba(255, 255, 255, 0.25)',
      accent: '#81D4FA',
    },
    night: {
      primary: ['#232526', '#414345', '#1a1a2e'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#4FC3F7',
    },
  },
  rain: {
    day: {
      primary: ['#485563', '#29323c', '#636FA4'],
      secondary: 'rgba(255, 255, 255, 0.15)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      card: 'rgba(255, 255, 255, 0.12)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#64B5F6',
    },
    night: {
      primary: ['#141E30', '#243B55', '#0f2027'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#42A5F5',
    },
  },
  snow: {
    day: {
      primary: ['#E6DADA', '#274046', '#83a4d4'],
      secondary: 'rgba(0, 0, 0, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.25)',
      cardBorder: 'rgba(255, 255, 255, 0.35)',
      accent: '#B3E5FC',
    },
    night: {
      primary: ['#2C3E50', '#4CA1AF', '#1a1a2e'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#81D4FA',
    },
  },
  thunderstorm: {
    day: {
      primary: ['#232526', '#414345', '#1f1c2c'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      card: 'rgba(255, 255, 255, 0.1)',
      cardBorder: 'rgba(255, 255, 255, 0.2)',
      accent: '#FFEB3B',
    },
    night: {
      primary: ['#0f0c29', '#302b63', '#24243e'],
      secondary: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.15)',
      accent: '#FFC107',
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
