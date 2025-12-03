import { Language } from '../types/settings';

interface Translations {
  // General
  appName: string;
  settings: string;
  save: string;
  cancel: string;
  
  // Weather
  feelsLike: string;
  humidity: string;
  wind: string;
  pressure: string;
  visibility: string;
  uvIndex: string;
  cloudCover: string;
  precipitation: string;
  
  // Time
  now: string;
  today: string;
  tomorrow: string;
  
  // Forecast
  hourlyForecast: string;
  dailyForecast: string;
  
  // Location
  searchLocation: string;
  searchPlaceholder: string;
  popularCities: string;
  myLocation: string;
  unknownLocation: string;
  
  // Settings
  temperatureUnit: string;
  windSpeedUnit: string;
  language: string;
  theme: string;
  notifications: string;
  hourFormat: string;
  hour24: string;
  hour12: string;
  
  // Theme modes
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  
  // Units
  celsius: string;
  fahrenheit: string;
  kmh: string;
  mph: string;
  ms: string;
  
  // UV Levels
  uvLow: string;
  uvModerate: string;
  uvHigh: string;
  uvVeryHigh: string;
  uvExtreme: string;
  
  // Wind directions
  windN: string;
  windNE: string;
  windE: string;
  windSE: string;
  windS: string;
  windSW: string;
  windW: string;
  windNW: string;
  
  // Weather conditions
  clear: string;
  mostlyClear: string;
  partlyCloudy: string;
  overcast: string;
  fog: string;
  rimeFog: string;
  lightDrizzle: string;
  moderateDrizzle: string;
  denseDrizzle: string;
  freezingDrizzle: string;
  heavyFreezingDrizzle: string;
  lightRain: string;
  moderateRain: string;
  heavyRain: string;
  freezingRain: string;
  heavyFreezingRain: string;
  lightSnow: string;
  moderateSnow: string;
  heavySnow: string;
  snowGrains: string;
  lightShowers: string;
  moderateShowers: string;
  heavyShowers: string;
  lightSnowShowers: string;
  heavySnowShowers: string;
  thunderstorm: string;
  thunderstormLightHail: string;
  thunderstormHeavyHail: string;
  
  // Warnings
  uvWarning: string;
  rainWarning: string;
  windWarning: string;
  
  // Day details
  sunrise: string;
  sunset: string;
  precipProbability: string;
  totalPrecipitation: string;
  maxWind: string;
  
  // Errors
  errorTitle: string;
  errorWeatherFetch: string;
  errorLocation: string;
  retry: string;
  
  // Loading
  loading: string;
  updatedNow: string;
  updatedMinutesAgo: string;

  // Navigation
  home: string;
  forecast: string;
  favorites: string;
  
  // Favorites Screen
  favoriteLocations: string;
  noFavorites: string;
  addCurrentLocation: string;
  tapToAddFavorite: string;
  
  // Settings descriptions
  appInfo: string;
  poweredBy: string;
}

const tr: Translations = {
  appName: 'WeatherThen',
  settings: 'Ayarlar',
  save: 'Kaydet',
  cancel: 'İptal',
  
  feelsLike: 'Hissedilen',
  humidity: 'Nem',
  wind: 'Rüzgar',
  pressure: 'Basınç',
  visibility: 'Görüş',
  uvIndex: 'UV İndeks',
  cloudCover: 'Bulut',
  precipitation: 'Yağış',
  
  now: 'Şimdi',
  today: 'Bugün',
  tomorrow: 'Yarın',
  
  hourlyForecast: '⏰ Saatlik Tahmin',
  dailyForecast: '📅 14 Günlük Tahmin',
  
  searchLocation: '📍 Konum Ara',
  searchPlaceholder: 'Şehir ara...',
  popularCities: 'Popüler Şehirler',
  myLocation: 'Konumum',
  unknownLocation: 'Bilinmeyen Konum',
  
  temperatureUnit: 'Sıcaklık Birimi',
  windSpeedUnit: 'Rüzgar Hızı Birimi',
  language: 'Dil',
  theme: 'Tema',
  notifications: 'Bildirimler',
  hourFormat: 'Saat Formatı',
  hour24: '24 saat',
  hour12: '12 saat',
  
  themeAuto: 'Otomatik',
  themeLight: 'Açık',
  themeDark: 'Koyu',
  
  celsius: 'Celsius (°C)',
  fahrenheit: 'Fahrenheit (°F)',
  kmh: 'km/s',
  mph: 'mph',
  ms: 'm/s',
  
  uvLow: 'Düşük',
  uvModerate: 'Orta',
  uvHigh: 'Yüksek',
  uvVeryHigh: 'Çok Yüksek',
  uvExtreme: 'Aşırı',
  
  windN: 'K',
  windNE: 'KD',
  windE: 'D',
  windSE: 'GD',
  windS: 'G',
  windSW: 'GB',
  windW: 'B',
  windNW: 'KB',
  
  clear: 'Açık',
  mostlyClear: 'Çoğunlukla Açık',
  partlyCloudy: 'Parçalı Bulutlu',
  overcast: 'Kapalı',
  fog: 'Sisli',
  rimeFog: 'Kırağılı Sis',
  lightDrizzle: 'Hafif Çisenti',
  moderateDrizzle: 'Orta Çisenti',
  denseDrizzle: 'Yoğun Çisenti',
  freezingDrizzle: 'Dondurucu Çisenti',
  heavyFreezingDrizzle: 'Yoğun Dondurucu Çisenti',
  lightRain: 'Hafif Yağmur',
  moderateRain: 'Orta Yağmur',
  heavyRain: 'Şiddetli Yağmur',
  freezingRain: 'Dondurucu Yağmur',
  heavyFreezingRain: 'Yoğun Dondurucu Yağmur',
  lightSnow: 'Hafif Kar',
  moderateSnow: 'Orta Kar',
  heavySnow: 'Yoğun Kar',
  snowGrains: 'Kar Taneleri',
  lightShowers: 'Hafif Sağanak',
  moderateShowers: 'Orta Sağanak',
  heavyShowers: 'Şiddetli Sağanak',
  lightSnowShowers: 'Hafif Kar Sağanağı',
  heavySnowShowers: 'Yoğun Kar Sağanağı',
  thunderstorm: 'Gök Gürültülü Fırtına',
  thunderstormLightHail: 'Hafif Dolu ile Fırtına',
  thunderstormHeavyHail: 'Yoğun Dolu ile Fırtına',
  
  uvWarning: 'UV endeksi yüksek! Güneş kremi kullanmayı unutmayın.',
  rainWarning: 'Yağmur olasılığı yüksek, şemsiye almayı düşünün.',
  windWarning: 'Güçlü rüzgar bekleniyor, dikkatli olun.',
  
  sunrise: 'Gün Doğumu',
  sunset: 'Gün Batımı',
  precipProbability: 'Yağış Olasılığı',
  totalPrecipitation: 'Toplam Yağış',
  maxWind: 'Maks. Rüzgar',
  
  errorTitle: 'Bir Sorun Oluştu',
  errorWeatherFetch: 'Hava durumu verileri alınamadı. Lütfen tekrar deneyin.',
  errorLocation: 'Konum alınamadı. Lütfen konum izni verin veya bir şehir arayın.',
  retry: '🔄 Tekrar Dene',
  
  loading: 'Hava durumu yükleniyor...',
  updatedNow: 'Şimdi güncellendi',
  updatedMinutesAgo: 'dakika önce',

  // Navigation
  home: 'Ana Sayfa',
  forecast: 'Tahmin',
  favorites: 'Favoriler',
  
  // Favorites Screen
  favoriteLocations: 'Favori Konumlar',
  noFavorites: 'Henüz favori konum eklemediniz',
  addCurrentLocation: 'Mevcut konumu ekle',
  tapToAddFavorite: 'Mevcut konumunuzu favorilere eklemek için yukarıdaki butona dokunun',
  
  // Settings descriptions
  appInfo: 'Uygulama Bilgisi',
  poweredBy: 'Open-Meteo API ile desteklenmektedir',
};

const en: Translations = {
  appName: 'WeatherThen',
  settings: 'Settings',
  save: 'Save',
  cancel: 'Cancel',
  
  feelsLike: 'Feels like',
  humidity: 'Humidity',
  wind: 'Wind',
  pressure: 'Pressure',
  visibility: 'Visibility',
  uvIndex: 'UV Index',
  cloudCover: 'Cloud',
  precipitation: 'Precipitation',
  
  now: 'Now',
  today: 'Today',
  tomorrow: 'Tomorrow',
  
  hourlyForecast: '⏰ Hourly Forecast',
  dailyForecast: '📅 14-Day Forecast',
  
  searchLocation: '📍 Search Location',
  searchPlaceholder: 'Search city...',
  popularCities: 'Popular Cities',
  myLocation: 'My Location',
  unknownLocation: 'Unknown Location',
  
  temperatureUnit: 'Temperature Unit',
  windSpeedUnit: 'Wind Speed Unit',
  language: 'Language',
  theme: 'Theme',
  notifications: 'Notifications',
  hourFormat: 'Time Format',
  hour24: '24 hour',
  hour12: '12 hour',
  
  themeAuto: 'Auto',
  themeLight: 'Light',
  themeDark: 'Dark',
  
  celsius: 'Celsius (°C)',
  fahrenheit: 'Fahrenheit (°F)',
  kmh: 'km/h',
  mph: 'mph',
  ms: 'm/s',
  
  uvLow: 'Low',
  uvModerate: 'Moderate',
  uvHigh: 'High',
  uvVeryHigh: 'Very High',
  uvExtreme: 'Extreme',
  
  windN: 'N',
  windNE: 'NE',
  windE: 'E',
  windSE: 'SE',
  windS: 'S',
  windSW: 'SW',
  windW: 'W',
  windNW: 'NW',
  
  clear: 'Clear',
  mostlyClear: 'Mostly Clear',
  partlyCloudy: 'Partly Cloudy',
  overcast: 'Overcast',
  fog: 'Foggy',
  rimeFog: 'Rime Fog',
  lightDrizzle: 'Light Drizzle',
  moderateDrizzle: 'Moderate Drizzle',
  denseDrizzle: 'Dense Drizzle',
  freezingDrizzle: 'Freezing Drizzle',
  heavyFreezingDrizzle: 'Heavy Freezing Drizzle',
  lightRain: 'Light Rain',
  moderateRain: 'Moderate Rain',
  heavyRain: 'Heavy Rain',
  freezingRain: 'Freezing Rain',
  heavyFreezingRain: 'Heavy Freezing Rain',
  lightSnow: 'Light Snow',
  moderateSnow: 'Moderate Snow',
  heavySnow: 'Heavy Snow',
  snowGrains: 'Snow Grains',
  lightShowers: 'Light Showers',
  moderateShowers: 'Moderate Showers',
  heavyShowers: 'Heavy Showers',
  lightSnowShowers: 'Light Snow Showers',
  heavySnowShowers: 'Heavy Snow Showers',
  thunderstorm: 'Thunderstorm',
  thunderstormLightHail: 'Thunderstorm with Light Hail',
  thunderstormHeavyHail: 'Thunderstorm with Heavy Hail',
  
  uvWarning: 'UV index is high! Don\'t forget to use sunscreen.',
  rainWarning: 'High chance of rain, consider taking an umbrella.',
  windWarning: 'Strong wind expected, be careful.',
  
  sunrise: 'Sunrise',
  sunset: 'Sunset',
  precipProbability: 'Precipitation Probability',
  totalPrecipitation: 'Total Precipitation',
  maxWind: 'Max Wind',
  
  errorTitle: 'Something Went Wrong',
  errorWeatherFetch: 'Failed to fetch weather data. Please try again.',
  errorLocation: 'Could not get location. Please enable location access or search for a city.',
  retry: '🔄 Retry',
  
  loading: 'Loading weather...',
  updatedNow: 'Updated now',
  updatedMinutesAgo: 'minutes ago',

  // Navigation
  home: 'Home',
  forecast: 'Forecast',
  favorites: 'Favorites',
  
  // Favorites Screen
  favoriteLocations: 'Favorite Locations',
  noFavorites: 'No favorite locations yet',
  addCurrentLocation: 'Add current location',
  tapToAddFavorite: 'Tap the button above to add your current location to favorites',
  
  // Settings descriptions
  appInfo: 'App Info',
  poweredBy: 'Powered by Open-Meteo API',
};

const translations: Record<Language, Translations> = {
  tr,
  en,
};

export function getTranslations(language: Language): Translations {
  return translations[language];
}

export function t(key: keyof Translations, language: Language): string {
  return translations[language][key];
}
