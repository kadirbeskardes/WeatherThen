/**
 * Hourly Chart Widget Component
 * Saatlik sıcaklık mini grafik widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetHourlyData, WidgetWeatherData } from '../services/widgetService';
import { getWidgetTheme, WidgetSize } from './types';

interface HourlyChartWidgetProps {
  current: WidgetWeatherData | null;
  hourly: WidgetHourlyData[] | null;
  size: WidgetSize;
  isNight?: boolean;
}

export const HourlyChartWidget: React.FC<HourlyChartWidgetProps> = ({
  current,
  hourly,
  size,
  isNight = false,
}) => {
  if (!current || !hourly || hourly.length === 0) {
    return (
      <View style={[styles.container, styles[size]]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theme = getWidgetTheme(current.conditionCode, isNight);
  
  // Gösterilecek saat sayısı boyuta göre
  const hoursToShow = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  const displayHours = hourly.slice(0, hoursToShow);
  
  // Min ve max sıcaklık
  const temps = displayHours.map(h => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  // Bar yüksekliği hesapla
  const getBarHeight = (temp: number): number => {
    const baseHeight = size === 'small' ? 30 : 50;
    const maxHeight = size === 'small' ? 50 : 80;
    return baseHeight + ((temp - minTemp) / tempRange) * (maxHeight - baseHeight);
  };

  const getWeatherEmoji = (code: number, hour: number): string => {
    const isNightHour = hour >= 21 || hour < 6;
    if (isNightHour && code <= 2) return '🌙';
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
          <Text style={[styles.title, { color: theme.textPrimary }]}>Saatlik</Text>
          {size !== 'small' && (
            <Text style={[styles.location, { color: theme.textSecondary }]}>{current.location}</Text>
          )}
        </View>

        {/* Grafik */}
        <View style={styles.chart}>
          {displayHours.map((hour, index) => {
            const hourNum = parseInt(hour.hour.split(':')[0]);
            return (
              <View key={index} style={styles.barContainer}>
                {/* Emoji */}
                <Text style={[styles.barEmoji, size === 'small' && styles.barEmojiSmall]}>
                  {getWeatherEmoji(hour.conditionCode, hourNum)}
                </Text>
                
                {/* Sıcaklık */}
                <Text style={[styles.barTemp, { color: theme.textPrimary }, size === 'small' && styles.barTempSmall]}>
                  {hour.temperature}°
                </Text>
                
                {/* Bar */}
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={[theme.accent, 'rgba(255,255,255,0.3)']}
                    style={[
                      styles.bar,
                      { height: getBarHeight(hour.temperature) }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </View>
                
                {/* Saat */}
                <Text style={[styles.barTime, { color: theme.textSecondary }, size === 'small' && styles.barTimeSmall]}>
                  {hour.hour}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Yağış olasılığı (large için) */}
        {size === 'large' && (
          <View style={styles.precipInfo}>
            <Text style={[styles.precipTitle, { color: theme.textSecondary }]}>
              Yağış Olasılığı
            </Text>
            <View style={styles.precipBars}>
              {displayHours.map((hour, index) => (
                <View key={index} style={styles.precipBarContainer}>
                  <View style={styles.precipBarBg}>
                    <View 
                      style={[
                        styles.precipBarFill, 
                        { 
                          height: `${hour.precipitationProbability}%`,
                          backgroundColor: theme.accent 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.precipText, { color: theme.textSecondary }]}>
                    {hour.precipitationProbability}%
                  </Text>
                </View>
              ))}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 11,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  barEmojiSmall: {
    fontSize: 12,
  },
  barTemp: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTempSmall: {
    fontSize: 10,
  },
  barWrapper: {
    width: 20,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 10,
  },
  barTime: {
    fontSize: 10,
    marginTop: 4,
  },
  barTimeSmall: {
    fontSize: 8,
  },
  precipInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  precipTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  precipBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  precipBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  precipBarBg: {
    width: 12,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  precipBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  precipText: {
    fontSize: 9,
    marginTop: 2,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default HourlyChartWidget;
