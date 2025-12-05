/**
 * Widget Types
 * Widget'lar için tip tanımlamaları
 */

export type WidgetType = 
  | 'temperature'      // Sıcaklık + Hissedilen
  | 'daily_summary'    // Günlük özet
  | 'hourly_chart'     // Saatlik mini grafik
  | 'precipitation'    // Yağış olasılığı
  | 'comfort'          // Konfor indeksi / UV
  | 'moon_phase'       // Ay fazı
  | 'location_switcher'; // Konum değiştirici

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  locationId?: string;
  customLocation?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

export interface WidgetTheme {
  background: string;
  backgroundGradient?: readonly [string, string, ...string[]];
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

// Widget boyutları (iOS ve Android için farklı)
export const WIDGET_DIMENSIONS = {
  ios: {
    small: { width: 169, height: 169 },
    medium: { width: 360, height: 169 },
    large: { width: 360, height: 379 },
  },
  android: {
    small: { width: 110, height: 110 },
    medium: { width: 250, height: 110 },
    large: { width: 250, height: 250 },
  },
};

// Widget tema renkleri (hava durumuna göre)
export const WIDGET_THEMES: { [key: string]: WidgetTheme } = {
  sunny: {
    background: '#4A90E2',
    backgroundGradient: ['#4A90E2', '#87CEEB'] as const,
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    accent: '#FFD700',
  },
  cloudy: {
    background: '#708090',
    backgroundGradient: ['#708090', '#A9A9A9'] as const,
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    accent: '#E0E0E0',
  },
  rainy: {
    background: '#4682B4',
    backgroundGradient: ['#4682B4', '#5F9EA0'] as const,
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    accent: '#87CEFA',
  },
  snowy: {
    background: '#B0C4DE',
    backgroundGradient: ['#B0C4DE', '#E0FFFF'] as const,
    textPrimary: '#2C3E50',
    textSecondary: 'rgba(44, 62, 80, 0.8)',
    accent: '#FFFFFF',
  },
  night: {
    background: '#1A1A2E',
    backgroundGradient: ['#1A1A2E', '#16213E'] as const,
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    accent: '#FFD700',
  },
  stormy: {
    background: '#2C3E50',
    backgroundGradient: ['#2C3E50', '#34495E'] as const,
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    accent: '#F1C40F',
  },
};

// Hava kodundan tema belirleme
export function getWidgetTheme(weatherCode: number, isNight: boolean = false): WidgetTheme {
  if (isNight) return WIDGET_THEMES.night;
  
  if (weatherCode === 0 || weatherCode === 1) return WIDGET_THEMES.sunny;
  if (weatherCode === 2 || weatherCode === 3) return WIDGET_THEMES.cloudy;
  if (weatherCode >= 45 && weatherCode <= 48) return WIDGET_THEMES.cloudy;
  if (weatherCode >= 51 && weatherCode <= 67) return WIDGET_THEMES.rainy;
  if (weatherCode >= 71 && weatherCode <= 86) return WIDGET_THEMES.snowy;
  if (weatherCode >= 95) return WIDGET_THEMES.stormy;
  
  return WIDGET_THEMES.sunny;
}
