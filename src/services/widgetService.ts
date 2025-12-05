/**
 * Widget Data Service
 * Widget'lar için hava durumu verilerini hazırlar ve yönetir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeatherData } from './weatherApi';
import { WeatherData, CurrentWeather, HourlyWeather, DailyWeather } from '../types/weather';

// Widget veri tipleri
export interface WidgetWeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  precipitationProbability: number;
  location: string;
  updatedAt: string;
  sunrise: string;
  sunset: string;
}

export interface WidgetHourlyData {
  time: string;
  hour: string;
  temperature: number;
  precipitationProbability: number;
  conditionCode: number;
}

export interface WidgetDailyData {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  conditionCode: number;
  precipitationProbability: number;
}

export interface WidgetComfortData {
  comfortIndex: number;
  uvIndex: number;
  uvLevel: string;
  airQualityIndex: number;
  airQualityLevel: string;
}

export interface WidgetMoonData {
  phase: string;
  phaseName: string;
  illumination: number;
  emoji: string;
}

export interface CompleteWidgetData {
  current: WidgetWeatherData;
  hourly: WidgetHourlyData[];
  daily: WidgetDailyData[];
  comfort: WidgetComfortData;
  moon: WidgetMoonData;
}

const WIDGET_DATA_KEY = '@widget_weather_data';
const WIDGET_LOCATIONS_KEY = '@widget_locations';

// Gün isimleri
const DAY_NAMES_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Ay fazı hesaplama
function getMoonPhase(date: Date): WidgetMoonData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.5305882;
  const phaseIndex = Math.floor((phase - Math.floor(phase)) * 8);
  
  const phases = [
    { phase: 'new', name: 'Yeni Ay', emoji: '🌑' },
    { phase: 'waxing_crescent', name: 'Hilal', emoji: '🌒' },
    { phase: 'first_quarter', name: 'İlk Dördün', emoji: '🌓' },
    { phase: 'waxing_gibbous', name: 'Şişkin Ay', emoji: '🌔' },
    { phase: 'full', name: 'Dolunay', emoji: '🌕' },
    { phase: 'waning_gibbous', name: 'Küçülen Ay', emoji: '🌖' },
    { phase: 'last_quarter', name: 'Son Dördün', emoji: '🌗' },
    { phase: 'waning_crescent', name: 'Hilal', emoji: '🌘' },
  ];
  
  const currentPhase = phases[phaseIndex];
  const illumination = Math.abs(Math.cos((phase - Math.floor(phase)) * 2 * Math.PI)) * 100;
  
  return {
    phase: currentPhase.phase,
    phaseName: currentPhase.name,
    illumination: Math.round(illumination),
    emoji: currentPhase.emoji,
  };
}

// Hava durumu açıklaması
function getWeatherCondition(code: number, language: string = 'tr'): string {
  const conditions: { [key: number]: { tr: string; en: string } } = {
    0: { tr: 'Açık', en: 'Clear' },
    1: { tr: 'Çoğunlukla açık', en: 'Mainly clear' },
    2: { tr: 'Parçalı bulutlu', en: 'Partly cloudy' },
    3: { tr: 'Bulutlu', en: 'Overcast' },
    45: { tr: 'Sisli', en: 'Foggy' },
    48: { tr: 'Kırağılı sis', en: 'Rime fog' },
    51: { tr: 'Hafif çisenti', en: 'Light drizzle' },
    53: { tr: 'Orta çisenti', en: 'Moderate drizzle' },
    55: { tr: 'Yoğun çisenti', en: 'Dense drizzle' },
    61: { tr: 'Hafif yağmur', en: 'Light rain' },
    63: { tr: 'Orta yağmur', en: 'Moderate rain' },
    65: { tr: 'Yoğun yağmur', en: 'Heavy rain' },
    66: { tr: 'Dondurucu yağmur', en: 'Freezing rain' },
    67: { tr: 'Yoğun dondurucu yağmur', en: 'Heavy freezing rain' },
    71: { tr: 'Hafif kar', en: 'Light snow' },
    73: { tr: 'Orta kar', en: 'Moderate snow' },
    75: { tr: 'Yoğun kar', en: 'Heavy snow' },
    77: { tr: 'Kar taneleri', en: 'Snow grains' },
    80: { tr: 'Hafif sağanak', en: 'Light showers' },
    81: { tr: 'Orta sağanak', en: 'Moderate showers' },
    82: { tr: 'Şiddetli sağanak', en: 'Violent showers' },
    85: { tr: 'Hafif kar sağanağı', en: 'Light snow showers' },
    86: { tr: 'Yoğun kar sağanağı', en: 'Heavy snow showers' },
    95: { tr: 'Gök gürültülü fırtına', en: 'Thunderstorm' },
    96: { tr: 'Hafif dolu', en: 'Thunderstorm with light hail' },
    99: { tr: 'Şiddetli dolu', en: 'Thunderstorm with heavy hail' },
  };
  
  return conditions[code]?.[language as 'tr' | 'en'] || conditions[0][language as 'tr' | 'en'];
}

// UV seviyesi
function getUVLevel(uvIndex: number, language: string = 'tr'): string {
  if (uvIndex <= 2) return language === 'tr' ? 'Düşük' : 'Low';
  if (uvIndex <= 5) return language === 'tr' ? 'Orta' : 'Moderate';
  if (uvIndex <= 7) return language === 'tr' ? 'Yüksek' : 'High';
  if (uvIndex <= 10) return language === 'tr' ? 'Çok Yüksek' : 'Very High';
  return language === 'tr' ? 'Aşırı' : 'Extreme';
}

// Hava kalitesi seviyesi
function getAirQualityLevel(aqi: number, language: string = 'tr'): string {
  if (aqi <= 50) return language === 'tr' ? 'İyi' : 'Good';
  if (aqi <= 100) return language === 'tr' ? 'Orta' : 'Moderate';
  if (aqi <= 150) return language === 'tr' ? 'Hassas Gruplar İçin Sağlıksız' : 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return language === 'tr' ? 'Sağlıksız' : 'Unhealthy';
  if (aqi <= 300) return language === 'tr' ? 'Çok Sağlıksız' : 'Very Unhealthy';
  return language === 'tr' ? 'Tehlikeli' : 'Hazardous';
}

// Konfor indeksi hesaplama
function calculateComfortIndex(temp: number, humidity: number, windSpeed: number, uvIndex: number): number {
  let score = 100;
  
  // Sıcaklık (18-24°C ideal)
  if (temp < 18) score -= Math.abs(temp - 18) * 3;
  else if (temp > 24) score -= (temp - 24) * 4;
  
  // Nem (40-60% ideal)
  if (humidity < 40) score -= (40 - humidity) * 0.5;
  else if (humidity > 60) score -= (humidity - 60) * 0.8;
  
  // Rüzgar (0-15 km/h ideal)
  if (windSpeed > 15) score -= (windSpeed - 15) * 0.8;
  
  // UV
  if (uvIndex > 6) score -= (uvIndex - 6) * 3;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Widget verilerini hazırla
export async function prepareWidgetData(
  latitude: number,
  longitude: number,
  locationName: string,
  language: string = 'tr'
): Promise<CompleteWidgetData> {
  const weatherData = await fetchWeatherData(latitude, longitude);
  
  const now = new Date();
  const dayNames = language === 'tr' ? DAY_NAMES_TR : DAY_NAMES_EN;
  
  // Mevcut saat için index bul
  const currentHourIndex = weatherData.hourly.findIndex(
    (h: HourlyWeather) => new Date(h.time) >= now
  );
  const currentHour = weatherData.hourly[Math.max(0, currentHourIndex)];
  
  // Mevcut hava durumu
  const current: WidgetWeatherData = {
    temperature: weatherData.current.temperature,
    feelsLike: weatherData.current.apparentTemperature,
    condition: getWeatherCondition(weatherData.current.weatherCode, language),
    conditionCode: weatherData.current.weatherCode,
    humidity: weatherData.current.humidity,
    windSpeed: weatherData.current.windSpeed,
    uvIndex: weatherData.current.uvIndex,
    precipitationProbability: currentHour?.precipitationProbability || 0,
    location: locationName,
    updatedAt: now.toISOString(),
    sunrise: weatherData.daily[0]?.sunrise || '',
    sunset: weatherData.daily[0]?.sunset || '',
  };
  
  // Saatlik veriler (sonraki 24 saat)
  const hourly: WidgetHourlyData[] = weatherData.hourly
    .slice(Math.max(0, currentHourIndex), Math.max(0, currentHourIndex) + 24)
    .map((h: HourlyWeather) => {
      const time = new Date(h.time);
      return {
        time: h.time,
        hour: time.getHours().toString().padStart(2, '0') + ':00',
        temperature: h.temperature,
        precipitationProbability: h.precipitationProbability,
        conditionCode: h.weatherCode,
      };
    });
  
  // Günlük veriler (7 gün)
  const daily: WidgetDailyData[] = weatherData.daily.map((d: DailyWeather) => {
    const date = new Date(d.date);
    return {
      date: d.date,
      dayName: dayNames[date.getDay()],
      tempMin: d.temperatureMin,
      tempMax: d.temperatureMax,
      conditionCode: d.weatherCode,
      precipitationProbability: d.precipitationProbability,
    };
  });
  
  // Konfor verileri
  const comfort: WidgetComfortData = {
    comfortIndex: calculateComfortIndex(
      current.temperature,
      current.humidity,
      current.windSpeed,
      current.uvIndex
    ),
    uvIndex: current.uvIndex,
    uvLevel: getUVLevel(current.uvIndex, language),
    airQualityIndex: 0, // Air quality API ayrı çağrılabilir
    airQualityLevel: getAirQualityLevel(0, language),
  };
  
  // Ay fazı
  const moon = getMoonPhase(now);
  
  return {
    current,
    hourly,
    daily,
    comfort,
    moon,
  };
}

// Widget verilerini kaydet
export async function saveWidgetData(data: CompleteWidgetData): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Widget verisi kaydedilemedi:', e);
  }
}

// Widget verilerini oku
export async function getWidgetData(): Promise<CompleteWidgetData | null> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Widget verisi okunamadı:', e);
    return null;
  }
}

// Widget konumlarını kaydet
export async function saveWidgetLocations(locations: Array<{ name: string; latitude: number; longitude: number }>): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (e) {
    console.error('Widget konumları kaydedilemedi:', e);
  }
}

// Widget konumlarını oku
export async function getWidgetLocations(): Promise<Array<{ name: string; latitude: number; longitude: number }>> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_LOCATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Widget konumları okunamadı:', e);
    return [];
  }
}

// Widget'ları güncelle (background task için)
export async function updateWidgets(
  latitude: number,
  longitude: number,
  locationName: string,
  language: string = 'tr'
): Promise<void> {
  try {
    const data = await prepareWidgetData(latitude, longitude, locationName, language);
    await saveWidgetData(data);
    
    // Native widget'ları güncelle (platform spesifik kod burada çağrılacak)
    // Bu kısım react-native-android-widget veya iOS WidgetKit ile entegre edilecek
  } catch (e) {
    console.error('Widget güncellenemedi:', e);
  }
}

// Hava durumu emoji'si
export function getWeatherEmoji(code: number): string {
  const emojis: { [key: number]: string } = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌧️',
    53: '🌧️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    66: '🌨️',
    67: '🌨️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    77: '❄️',
    80: '🌦️',
    81: '🌦️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  
  return emojis[code] || '☀️';
}
