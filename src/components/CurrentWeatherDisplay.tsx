import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CurrentWeather } from '../types/weather';
import { getWeatherInfo, getUVIndexLevel } from '../utils/weatherUtils';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface CurrentWeatherDisplayProps {
  weather: CurrentWeather;
  locationName: string;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
  getTemperatureSymbol: () => string;
  getWindSpeedSymbol: () => string;
  yesterdayTemp?: number;
}

const CurrentWeatherDisplayComponent: React.FC<CurrentWeatherDisplayProps> = ({
  weather,
  locationName,
  theme,
  settings,
  convertTemperature,
  convertWindSpeed,
  getTemperatureSymbol,
  getWindSpeedSymbol,
  yesterdayTemp,
}) => {
  const t = useMemo(() => getTranslations(settings.language), [settings.language]);
  const weatherInfo = useMemo(() => getWeatherInfo(weather.weatherCode, weather.isDay), [weather.weatherCode, weather.isDay]);
  const uvInfo = useMemo(() => getUVIndexLevel(weather.uvIndex, settings.language), [weather.uvIndex, settings.language]);
  
  // Temperature comparison with yesterday
  const tempComparison = useMemo(() => {
    if (!yesterdayTemp) return null;
    const diff = weather.temperature - yesterdayTemp;
    if (Math.abs(diff) < 1) {
      return { text: t.sameAsYesterday, icon: '➡️', color: theme.textSecondary };
    } else if (diff > 0) {
      return { text: `${t.warmerThanYesterday} (+${Math.round(diff)}°)`, icon: '🔥', color: '#FF6B6B' };
    } else {
      return { text: `${t.colderThanYesterday} (${Math.round(diff)}°)`, icon: '❄️', color: '#4ECDC4' };
    }
  }, [weather.temperature, yesterdayTemp, t, theme.textSecondary]);
  
  const windDir = useMemo(() => {
    const windDirections = [t.windN, t.windNE, t.windE, t.windSE, t.windS, t.windSW, t.windW, t.windNW];
    return windDirections[Math.round(weather.windDirection / 45) % 8];
  }, [weather.windDirection, t]);

  // Get weather description based on language
  const weatherDescription = useMemo(() => {
    const descMap: Record<number, keyof typeof t> = {
      0: 'clear', 1: 'mostlyClear', 2: 'partlyCloudy', 3: 'overcast',
      45: 'fog', 48: 'rimeFog',
      51: 'lightDrizzle', 53: 'moderateDrizzle', 55: 'denseDrizzle',
      56: 'freezingDrizzle', 57: 'heavyFreezingDrizzle',
      61: 'lightRain', 63: 'moderateRain', 65: 'heavyRain',
      66: 'freezingRain', 67: 'heavyFreezingRain',
      71: 'lightSnow', 73: 'moderateSnow', 75: 'heavySnow', 77: 'snowGrains',
      80: 'lightShowers', 81: 'moderateShowers', 82: 'heavyShowers',
      85: 'lightSnowShowers', 86: 'heavySnowShowers',
      95: 'thunderstorm', 96: 'thunderstormLightHail', 99: 'thunderstormHeavyHail',
    };
    const key = descMap[weather.weatherCode] || 'clear';
    return t[key];
  }, [weather.weatherCode, t]);

  // Memoize converted values
  const displayTemp = useMemo(() => convertTemperature(weather.temperature), [weather.temperature, convertTemperature]);
  const displayFeelsLike = useMemo(() => convertTemperature(weather.apparentTemperature), [weather.apparentTemperature, convertTemperature]);
  const displayWind = useMemo(() => convertWindSpeed(weather.windSpeed), [weather.windSpeed, convertWindSpeed]);
  const windSymbol = useMemo(() => getWindSpeedSymbol(), [getWindSpeedSymbol]);

  return (
    <View style={styles.container}>
      <Text style={[styles.location, { color: theme.text }]}>{locationName}</Text>
      
      <View style={styles.mainInfo}>
        <Text style={styles.icon}>{weatherInfo.icon}</Text>
        <Text style={[styles.temperature, { color: theme.text }]}>
          {displayTemp}°
        </Text>
      </View>
      
      <Text style={[styles.description, { color: theme.text }]}>
        {weatherDescription}
      </Text>
      
      <Text style={[styles.feelsLike, { color: theme.textSecondary }]}>
        {t.feelsLike}: {displayFeelsLike}°
      </Text>
      
      {tempComparison && (
        <View style={[styles.comparisonBadge, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.comparisonIcon}>{tempComparison.icon}</Text>
          <Text style={[styles.comparisonText, { color: tempComparison.color }]}>
            {tempComparison.text}
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statIcon}>💨</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{displayWind} {windSymbol}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {t.wind} {windDir}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statIcon}>💧</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.humidity}%</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.humidity}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statIcon}>☀️</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.uvIndex}</Text>
          <Text style={[styles.statLabel, { color: uvInfo.color }]}>{uvInfo.level}</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{weather.visibility} km</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t.visibility}</Text>
        </View>
      </View>

      <View style={styles.extraStatsContainer}>
        <View style={[styles.extraStatCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.extraStatRow}>
            <Text style={styles.extraStatIcon}>🌡️</Text>
            <View style={styles.extraStatInfo}>
              <Text style={[styles.extraStatLabel, { color: theme.textSecondary }]}>{t.pressure}</Text>
              <Text style={[styles.extraStatValue, { color: theme.text }]}>{weather.pressure} hPa</Text>
            </View>
          </View>
        </View>

        <View style={[styles.extraStatCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.extraStatRow}>
            <Text style={styles.extraStatIcon}>☁️</Text>
            <View style={styles.extraStatInfo}>
              <Text style={[styles.extraStatLabel, { color: theme.textSecondary }]}>{t.cloudCover}</Text>
              <Text style={[styles.extraStatValue, { color: theme.text }]}>{weather.cloudCover}%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Use React.memo with custom comparison for better performance
export const CurrentWeatherDisplay = memo(CurrentWeatherDisplayComponent, (prevProps, nextProps) => {
  return (
    prevProps.weather.temperature === nextProps.weather.temperature &&
    prevProps.weather.weatherCode === nextProps.weather.weatherCode &&
    prevProps.weather.humidity === nextProps.weather.humidity &&
    prevProps.weather.windSpeed === nextProps.weather.windSpeed &&
    prevProps.weather.uvIndex === nextProps.weather.uvIndex &&
    prevProps.locationName === nextProps.locationName &&
    prevProps.settings.language === nextProps.settings.language &&
    prevProps.settings.temperatureUnit === nextProps.settings.temperatureUnit &&
    prevProps.settings.windSpeedUnit === nextProps.settings.windSpeedUnit
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  location: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 5,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  icon: {
    fontSize: 80,
    marginRight: 10,
  },
  temperature: {
    fontSize: 90,
    fontWeight: '200',
  },
  description: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 5,
  },
  feelsLike: {
    fontSize: 16,
    marginBottom: 8,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  comparisonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  comparisonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  extraStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  extraStatCard: {
    width: '48%',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
  },
  extraStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraStatIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  extraStatInfo: {
    flex: 1,
  },
  extraStatLabel: {
    fontSize: 12,
  },
  extraStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});
