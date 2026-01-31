import React, { memo, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
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
  const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
  const weatherInfo = useMemo(() => getWeatherInfo(weather.weatherCode, weather.isDay), [weather.weatherCode, weather.isDay]);
  const uvInfo = useMemo(() => getUVIndexLevel(weather.uvIndex, settings.language), [weather.uvIndex, settings.language]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating icon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, floatAnim, glowAnim]);

  // Temperature comparison with yesterday
  const tempComparison = useMemo(() => {
    if (!yesterdayTemp) return null;
    const temperatureDifference = weather.temperature - yesterdayTemp;
    if (Math.abs(temperatureDifference) < 1) {
      return { text: translations.sameAsYesterday, icon: '➡️', color: theme.textSecondary, glowColor: 'rgba(255,255,255,0.3)' };
    } else if (temperatureDifference > 0) {
      return { text: `${translations.warmerThanYesterday} (+${Math.round(temperatureDifference)}°)`, icon: '🔥', color: '#FF6B6B', glowColor: 'rgba(255,107,107,0.4)' };
    } else {
      return { text: `${translations.colderThanYesterday} (${Math.round(temperatureDifference)}°)`, icon: '❄️', color: '#4ECDC4', glowColor: 'rgba(78,205,196,0.4)' };
    }
  }, [weather.temperature, yesterdayTemp, translations, theme.textSecondary]);

  const windDirectionLabel = useMemo(() => {
    const windDirections = [translations.windN, translations.windNE, translations.windE, translations.windSE, translations.windS, translations.windSW, translations.windW, translations.windNW];
    return windDirections[Math.round(weather.windDirection / 45) % 8];
  }, [weather.windDirection, translations]);

  // Get weather description based on language
  const weatherDescription = useMemo(() => {
    const weatherCodeToDescriptionKey: Record<number, keyof typeof translations> = {
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
    const descriptionKey = weatherCodeToDescriptionKey[weather.weatherCode] || 'clear';
    return translations[descriptionKey];
  }, [weather.weatherCode, translations]);

  // Memoize converted values
  const displayTemperature = useMemo(() => convertTemperature(weather.temperature), [weather.temperature, convertTemperature]);
  const displayFeelsLikeTemperature = useMemo(() => convertTemperature(weather.apparentTemperature), [weather.apparentTemperature, convertTemperature]);
  const displayWindSpeed = useMemo(() => convertWindSpeed(weather.windSpeed), [weather.windSpeed, convertWindSpeed]);
  const windSpeedUnitSymbol = useMemo(() => getWindSpeedSymbol(), [getWindSpeedSymbol]);

  const handleStatPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const StatCard = ({ icon, value, label, valueColor, labelColor }: any) => (
    <TouchableOpacity onPress={handleStatPress} activeOpacity={0.8}>
      <BlurView intensity={40} tint={theme.isDark ? 'dark' : 'light'} style={styles.statCardBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={[styles.statCard, { borderColor: theme.cardBorder }]}
        >
          <Text style={styles.statIcon}>{icon}</Text>
          <Text style={[styles.statValue, { color: valueColor || theme.text }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: labelColor || theme.textSecondary }]}>{label}</Text>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={[styles.location, { color: theme.text }]}>{locationName}</Text>

      <View style={styles.mainInfo}>
        <Animated.Text style={[styles.icon, { transform: [{ translateY: floatAnim }] }]}>
          {weatherInfo.icon}
        </Animated.Text>
        <Text style={[styles.temperature, { color: theme.text }]}>
          {displayTemperature}°
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.text }]}>
        {weatherDescription}
      </Text>

      <Text style={[styles.feelsLike, { color: theme.textSecondary }]}>
        {translations.feelsLike}: {displayFeelsLikeTemperature}°
      </Text>

      {tempComparison && (
        <Animated.View style={[
          styles.comparisonBadge,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
            shadowColor: tempComparison.glowColor,
            shadowOpacity: glowOpacity as any,
          }
        ]}>
          <Text style={styles.comparisonIcon}>{tempComparison.icon}</Text>
          <Text style={[styles.comparisonText, { color: tempComparison.color }]}>
            {tempComparison.text}
          </Text>
        </Animated.View>
      )}

      <View style={styles.statsContainer}>
        <StatCard
          icon="💨"
          value={`${displayWindSpeed} ${windSpeedUnitSymbol}`}
          label={`${translations.wind} ${windDirectionLabel}`}
        />
        <StatCard
          icon="💧"
          value={`${weather.humidity}%`}
          label={translations.humidity}
        />
        <StatCard
          icon="☀️"
          value={weather.uvIndex}
          label={uvInfo.level}
          labelColor={uvInfo.color}
        />
        <StatCard
          icon="👁️"
          value={`${weather.visibility} km`}
          label={translations.visibility}
        />
      </View>

      <View style={styles.extraStatsContainer}>
        <BlurView intensity={40} tint={theme.isDark ? 'dark' : 'light'} style={styles.extraStatBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
            style={[styles.extraStatCard, { borderColor: theme.cardBorder }]}
          >
            <View style={styles.extraStatRow}>
              <Text style={styles.extraStatIcon}>🌡️</Text>
              <View style={styles.extraStatInfo}>
                <Text style={[styles.extraStatLabel, { color: theme.textSecondary }]}>{translations.pressure}</Text>
                <Text style={[styles.extraStatValue, { color: theme.text }]}>{weather.pressure} hPa</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>

        <BlurView intensity={40} tint={theme.isDark ? 'dark' : 'light'} style={styles.extraStatBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
            style={[styles.extraStatCard, { borderColor: theme.cardBorder }]}
          >
            <View style={styles.extraStatRow}>
              <Text style={styles.extraStatIcon}>☁️</Text>
              <View style={styles.extraStatInfo}>
                <Text style={[styles.extraStatLabel, { color: theme.textSecondary }]}>{translations.cloudCover}</Text>
                <Text style={[styles.extraStatValue, { color: theme.text }]}>{weather.cloudCover}%</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </Animated.View>
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
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
  statCardBlur: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  statCard: {
    width: '100%',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '500',
  },
  extraStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  extraStatBlur: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  extraStatCard: {
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
