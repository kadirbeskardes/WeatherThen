/**
 * Daily Summary Widget Component
 * Günlük özet widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetWeatherData, WidgetDailyData } from '../services/widgetService';
import { getWidgetTheme, WidgetSize } from './types';

interface DailySummaryWidgetProps {
  current: WidgetWeatherData | null;
  daily: WidgetDailyData[] | null;
  size: WidgetSize;
  isNight?: boolean;
}

export const DailySummaryWidget: React.FC<DailySummaryWidgetProps> = ({
  current,
  daily,
  size,
  isNight = false,
}) => {
  if (!current || !daily || daily.length === 0) {
    return (
      <View style={[styles.container, styles[size]]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theme = getWidgetTheme(current.conditionCode, isNight);
  const today = daily[0];

  const getWeatherEmoji = (code: number): string => {
    const emojis: { [key: number]: string } = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌧️', 53: '🌧️', 55: '🌧️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '❄️', 73: '❄️', 75: '❄️',
      80: '🌦️', 81: '🌦️', 82: '⛈️',
      95: '⛈️', 96: '⛈️', 99: '⛈️',
    };
    return emojis[code] || '☀️';
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Bugün</Text>
          <Text style={[styles.location, { color: theme.textSecondary }]}>{current.location}</Text>
        </View>

        {/* Ana bilgi */}
        <View style={styles.mainInfo}>
          <Text style={styles.emoji}>{getWeatherEmoji(current.conditionCode)}</Text>
          <View style={styles.tempRange}>
            <Text style={[styles.condition, { color: theme.textPrimary }]}>{current.condition}</Text>
            <Text style={[styles.temps, { color: theme.textSecondary }]}>
              ↑ {today.tempMax}° / ↓ {today.tempMin}°
            </Text>
          </View>
        </View>

        {/* Detaylar */}
        {size !== 'small' && (
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailIcon]}>🌡️</Text>
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Hissedilen {current.feelsLike}°
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailIcon]}>🌧️</Text>
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Yağış %{current.precipitationProbability}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailIcon]}>💨</Text>
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Rüzgar {current.windSpeed} km/h
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailIcon]}>💧</Text>
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Nem %{current.humidity}
              </Text>
            </View>
          </View>
        )}

        {/* Güneş bilgisi */}
        {size === 'large' && (
          <View style={styles.sunInfo}>
            <View style={styles.sunItem}>
              <Text style={styles.sunEmoji}>🌅</Text>
              <Text style={[styles.sunText, { color: theme.textSecondary }]}>
                {formatTime(current.sunrise)}
              </Text>
            </View>
            <View style={styles.sunItem}>
              <Text style={styles.sunEmoji}>🌇</Text>
              <Text style={[styles.sunText, { color: theme.textSecondary }]}>
                {formatTime(current.sunset)}
              </Text>
            </View>
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
    padding: 14,
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    fontSize: 12,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 44,
    marginRight: 12,
  },
  tempRange: {
    flex: 1,
  },
  condition: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 2,
  },
  temps: {
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
  },
  sunInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  sunItem: {
    alignItems: 'center',
  },
  sunEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  sunText: {
    fontSize: 14,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DailySummaryWidget;
