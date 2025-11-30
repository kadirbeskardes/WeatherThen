import { WeatherCondition } from '../types/weather';
import { Language } from '../types/settings';

interface WeatherInfo {
  condition: WeatherCondition;
  description: string;
  icon: string;
  nightIcon?: string;
}

const weatherCodeMap: Record<number, WeatherInfo> = {
  0: { condition: 'clear', description: 'Açık', icon: '☀️', nightIcon: '🌙' },
  1: { condition: 'clear', description: 'Çoğunlukla Açık', icon: '🌤️', nightIcon: '🌙' },
  2: { condition: 'partly-cloudy', description: 'Parçalı Bulutlu', icon: '⛅', nightIcon: '☁️' },
  3: { condition: 'cloudy', description: 'Kapalı', icon: '☁️', nightIcon: '☁️' },
  45: { condition: 'fog', description: 'Sisli', icon: '🌫️', nightIcon: '🌫️' },
  48: { condition: 'fog', description: 'Kırağılı Sis', icon: '🌫️', nightIcon: '🌫️' },
  51: { condition: 'drizzle', description: 'Hafif Çisenti', icon: '🌦️', nightIcon: '🌧️' },
  53: { condition: 'drizzle', description: 'Orta Çisenti', icon: '🌦️', nightIcon: '🌧️' },
  55: { condition: 'drizzle', description: 'Yoğun Çisenti', icon: '🌧️', nightIcon: '🌧️' },
  56: { condition: 'drizzle', description: 'Dondurucu Çisenti', icon: '🌧️', nightIcon: '🌧️' },
  57: { condition: 'drizzle', description: 'Yoğun Dondurucu Çisenti', icon: '🌧️', nightIcon: '🌧️' },
  61: { condition: 'rain', description: 'Hafif Yağmur', icon: '🌦️', nightIcon: '🌧️' },
  63: { condition: 'rain', description: 'Orta Yağmur', icon: '🌧️', nightIcon: '🌧️' },
  65: { condition: 'rain', description: 'Şiddetli Yağmur', icon: '🌧️', nightIcon: '🌧️' },
  66: { condition: 'rain', description: 'Dondurucu Yağmur', icon: '🌧️', nightIcon: '🌧️' },
  67: { condition: 'rain', description: 'Yoğun Dondurucu Yağmur', icon: '🌧️', nightIcon: '🌧️' },
  71: { condition: 'snow', description: 'Hafif Kar', icon: '🌨️', nightIcon: '🌨️' },
  73: { condition: 'snow', description: 'Orta Kar', icon: '🌨️', nightIcon: '🌨️' },
  75: { condition: 'snow', description: 'Yoğun Kar', icon: '❄️', nightIcon: '❄️' },
  77: { condition: 'snow', description: 'Kar Taneleri', icon: '❄️', nightIcon: '❄️' },
  80: { condition: 'rain', description: 'Hafif Sağanak', icon: '🌦️', nightIcon: '🌧️' },
  81: { condition: 'rain', description: 'Orta Sağanak', icon: '🌧️', nightIcon: '🌧️' },
  82: { condition: 'rain', description: 'Şiddetli Sağanak', icon: '⛈️', nightIcon: '⛈️' },
  85: { condition: 'snow', description: 'Hafif Kar Sağanağı', icon: '🌨️', nightIcon: '🌨️' },
  86: { condition: 'snow', description: 'Yoğun Kar Sağanağı', icon: '❄️', nightIcon: '❄️' },
  95: { condition: 'thunderstorm', description: 'Gök Gürültülü Fırtına', icon: '⛈️', nightIcon: '⛈️' },
  96: { condition: 'thunderstorm', description: 'Hafif Dolu ile Fırtına', icon: '⛈️', nightIcon: '⛈️' },
  99: { condition: 'thunderstorm', description: 'Yoğun Dolu ile Fırtına', icon: '⛈️', nightIcon: '⛈️' },
};

export function getWeatherInfo(code: number, isDay: boolean = true): WeatherInfo {
  const info = weatherCodeMap[code] || weatherCodeMap[0];
  return {
    ...info,
    icon: isDay ? info.icon : (info.nightIcon || info.icon)
  };
}

export function getWeatherDescription(code: number): string {
  return weatherCodeMap[code]?.description || 'Bilinmiyor';
}

export function getWeatherIcon(code: number, isDay: boolean = true): string {
  const info = weatherCodeMap[code] || weatherCodeMap[0];
  return isDay ? info.icon : (info.nightIcon || info.icon);
}

export function getWeatherCondition(code: number): WeatherCondition {
  return weatherCodeMap[code]?.condition || 'clear';
}

export function getWindDirection(degrees: number): string {
  const directions = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function getUVIndexLevel(index: number, language: Language = 'tr'): { level: string; color: string } {
  const levels = {
    tr: { low: 'Düşük', moderate: 'Orta', high: 'Yüksek', veryHigh: 'Çok Yüksek', extreme: 'Aşırı' },
    en: { low: 'Low', moderate: 'Moderate', high: 'High', veryHigh: 'Very High', extreme: 'Extreme' }
  };
  const l = levels[language];
  
  if (index <= 2) return { level: l.low, color: '#4CAF50' };
  if (index <= 5) return { level: l.moderate, color: '#FFEB3B' };
  if (index <= 7) return { level: l.high, color: '#FF9800' };
  if (index <= 10) return { level: l.veryHigh, color: '#F44336' };
  return { level: l.extreme, color: '#9C27B0' };
}

export function formatTime(isoString: string, language: Language = 'tr', hour24: boolean = true): string {
  const date = new Date(isoString);
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: !hour24
  });
}

export function formatDate(isoString: string, language: Language = 'tr'): string {
  const date = new Date(isoString);
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDayName(isoString: string, language: Language = 'tr'): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return language === 'tr' ? 'Bugün' : 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return language === 'tr' ? 'Yarın' : 'Tomorrow';
  }
  
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

export function formatHour(isoString: string, language: Language = 'tr', hour24: boolean = true): string {
  const date = new Date(isoString);
  const now = new Date();
  
  if (Math.abs(date.getTime() - now.getTime()) < 3600000) {
    return language === 'tr' ? 'Şimdi' : 'Now';
  }
  
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return date.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: !hour24
  });
}
