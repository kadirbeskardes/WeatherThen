/**
 * Temperature Widget Component
 * Sıcaklık + Hissedilen sıcaklık widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetWeatherData } from '../services/widgetService';
import { getWidgetTheme, WidgetSize } from './types';

interface TemperatureWidgetProps {
  data: WidgetWeatherData | null;
  size: WidgetSize;
  isNight?: boolean;
}

export const TemperatureWidget: React.FC<TemperatureWidgetProps> = ({ 
  data, 
  size,
  isNight = false 
}) => {
  if (!data) {
    return (
      <View style={[styles.container, styles[size]]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theme = getWidgetTheme(data.conditionCode, isNight);
  const isSmall = size === 'small';

  const getWeatherEmoji = (code: number): string => {
    if (isNight && code <= 2) return '🌙';
    const emojis: { [key: number]: string } = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌧️', 53: '🌧️', 55: '🌧️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      66: '🌨️', 67: '🌨️',
      71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
      80: '🌦️', 81: '🌦️', 82: '⛈️',
      85: '🌨️', 86: '🌨️',
      95: '⛈️', 96: '⛈️', 99: '⛈️',
    };
    return emojis[code] || '☀️';
  };

  const defaultGradient: [string, string] = [theme.background, theme.background];
  const gradientColors = theme.backgroundGradient ?? defaultGradient;

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, styles[size]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Konum */}
        <Text style={[styles.location, { color: theme.textSecondary }]} numberOfLines={1}>
          📍 {data.location}
        </Text>
        
        {/* Ana sıcaklık */}
        <View style={styles.mainTemp}>
          <Text style={[styles.emoji, isSmall && styles.emojiSmall]}>
            {getWeatherEmoji(data.conditionCode)}
          </Text>
          <Text style={[styles.temperature, { color: theme.textPrimary }, isSmall && styles.temperatureSmall]}>
            {data.temperature}°
          </Text>
        </View>
        
        {/* Hissedilen */}
        {!isSmall && (
          <Text style={[styles.feelsLike, { color: theme.textSecondary }]}>
            Hissedilen: {data.feelsLike}°
          </Text>
        )}
        
        {/* Durum */}
        <Text style={[styles.condition, { color: theme.textPrimary }]} numberOfLines={1}>
          {data.condition}
        </Text>
        
        {/* Ek bilgiler (medium ve large için) */}
        {size !== 'small' && (
          <View style={styles.extraInfo}>
            <Text style={[styles.extraText, { color: theme.textSecondary }]}>
              💧 {data.humidity}%
            </Text>
            <Text style={[styles.extraText, { color: theme.textSecondary }]}>
              💨 {data.windSpeed} km/h
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 12,
  },
  small: {
    width: 155,
    height: 155,
  },
  medium: {
    width: 330,
    height: 155,
  },
  large: {
    width: 330,
    height: 330,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  location: {
    fontSize: 12,
    fontWeight: '500',
  },
  mainTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
    marginRight: 8,
  },
  emojiSmall: {
    fontSize: 28,
  },
  temperature: {
    fontSize: 52,
    fontWeight: '200',
  },
  temperatureSmall: {
    fontSize: 40,
  },
  feelsLike: {
    fontSize: 13,
    textAlign: 'center',
  },
  condition: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  extraInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  extraText: {
    fontSize: 12,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default TemperatureWidget;
