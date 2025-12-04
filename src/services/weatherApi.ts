import { WeatherData, CurrentWeather, HourlyWeather, DailyWeather, GeocodingResult } from '../types/weather';
import { cacheManager, CACHE_KEYS, CACHE_DURATION } from '../utils/cache';

const BASE_URL = 'https://api.open-meteo.com/v1';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1';

// Cache key generator for weather data
const getWeatherCacheKey = (lat: number, lon: number): string => {
  // Round coordinates to reduce cache fragmentation
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  return `${CACHE_KEYS.WEATHER}:${roundedLat}:${roundedLon}`;
};

export async function fetchWeatherData(
  latitude: number, 
  longitude: number,
  forceRefresh: boolean = false
): Promise<Omit<WeatherData, 'location'>> {
  const cacheKey = getWeatherCacheKey(latitude, longitude);
  
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await cacheManager.getIfValid<Omit<WeatherData, 'location'>>(
      cacheKey, 
      CACHE_DURATION.WEATHER
    );
    if (cached) {
      console.log('Using cached weather data');
      return cached;
    }
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'weather_code',
      'is_day',
      'precipitation',
      'cloud_cover',
      'pressure_msl',
      'uv_index',
      'visibility'
    ].join(','),
    hourly: [
      'temperature_2m',
      'weather_code',
      'precipitation_probability',
      'wind_speed_10m',
      'relative_humidity_2m',
      'is_day'
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'weather_code',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'sunrise',
      'sunset',
      'uv_index_max'
    ].join(','),
    timezone: 'auto',
    forecast_days: '14'
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${BASE_URL}/forecast?${params}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();
    
    const result = {
      current: parseCurrentWeather(data.current),
      hourly: parseHourlyWeather(data.hourly),
      daily: parseDailyWeather(data.daily)
    };

    // Cache the result
    await cacheManager.set(cacheKey, result);
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // If network fails, try to return stale cache
    const staleCache = await cacheManager.get<Omit<WeatherData, 'location'>>(cacheKey);
    if (staleCache) {
      console.log('Network failed, using stale cache');
      return staleCache;
    }
    
    throw error;
  }
}

function parseCurrentWeather(data: any): CurrentWeather {
  return {
    temperature: Math.round(data.temperature_2m),
    apparentTemperature: Math.round(data.apparent_temperature),
    humidity: data.relative_humidity_2m,
    windSpeed: Math.round(data.wind_speed_10m),
    windDirection: data.wind_direction_10m,
    gustSpeed: Math.round(data.wind_gusts_10m || data.wind_speed_10m),
    weatherCode: data.weather_code,
    isDay: data.is_day === 1,
    precipitation: data.precipitation,
    cloudCover: data.cloud_cover,
    pressure: Math.round(data.pressure_msl),
    uvIndex: Math.round(data.uv_index),
    visibility: Math.round(data.visibility / 1000) // Convert to km
  };
}

function parseHourlyWeather(data: any): HourlyWeather[] {
  const now = new Date();
  const hourlyData: HourlyWeather[] = [];
  
  for (let i = 0; i < data.time.length && hourlyData.length < 48; i++) {
    const time = new Date(data.time[i]);
    if (time >= now || hourlyData.length === 0) {
      hourlyData.push({
        time: data.time[i],
        temperature: Math.round(data.temperature_2m[i]),
        weatherCode: data.weather_code[i],
        precipitationProbability: data.precipitation_probability[i] || 0,
        windSpeed: Math.round(data.wind_speed_10m[i]),
        humidity: data.relative_humidity_2m[i],
        isDay: data.is_day[i] === 1
      });
    }
  }
  
  return hourlyData.slice(0, 48);
}

function parseDailyWeather(data: any): DailyWeather[] {
  return data.time.map((time: string, index: number) => ({
    date: time,
    temperatureMax: Math.round(data.temperature_2m_max[index]),
    temperatureMin: Math.round(data.temperature_2m_min[index]),
    weatherCode: data.weather_code[index],
    precipitationSum: data.precipitation_sum[index],
    precipitationProbability: data.precipitation_probability_max[index] || 0,
    windSpeedMax: Math.round(data.wind_speed_10m_max[index]),
    sunrise: data.sunrise[index],
    sunset: data.sunset[index],
    uvIndexMax: Math.round(data.uv_index_max[index])
  }));
}

export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (query.length < 2) return [];
  
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'tr',
    format: 'json'
  });

  const response = await fetch(`${GEOCODING_URL}/search?${params}`);
  
  if (!response.ok) {
    throw new Error('Location search failed');
  }

  const data = await response.json();
  
  if (!data.results) return [];
  
  return data.results.map((result: any) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
    timezone: result.timezone
  }));
}

// Geocoding cache
const geocodeCache = new Map<string, string>();

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // Round coordinates for cache key
  const cacheKey = `${Math.round(latitude * 100)}:${Math.round(longitude * 100)}`;
  
  // Check memory cache
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const locationName = data.address?.city || 
             data.address?.town || 
             data.address?.village || 
             data.address?.municipality ||
             'Bilinmeyen Konum';
      
      // Cache the result
      geocodeCache.set(cacheKey, locationName);
      return locationName;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('Reverse geocoding failed:', error);
  }
  
  return 'Konumum';
}
