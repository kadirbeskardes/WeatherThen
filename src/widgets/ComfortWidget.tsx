/**
 * Comfort Index Widget Component
 * Konfor indeksi / UV seviyesi widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetComfortData, WidgetWeatherData } from '../services/widgetService';
import { getWidgetTheme, WidgetSize } from './types';

interface ComfortWidgetProps {
  current: WidgetWeatherData | null;
  comfort: WidgetComfortData | null;
  size: WidgetSize;
  isNight?: boolean;
}

export const ComfortWidget: React.FC<ComfortWidgetProps> = ({
  current,
  comfort,
  size,
  isNight = false,
}) => {
  if (!current || !comfort) {
    return (
      <View style={[styles.container, styles[size]]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theme = getWidgetTheme(current.conditionCode, isNight);

  // Konfor durumu
  const getComfortStatus = (index: number): { text: string; emoji: string; color: string } => {
    if (index >= 80) return { text: 'Mükemmel', emoji: '😊', color: '#4CAF50' };
    if (index >= 60) return { text: 'İyi', emoji: '🙂', color: '#8BC34A' };
    if (index >= 40) return { text: 'Orta', emoji: '😐', color: '#FFC107' };
    if (index >= 20) return { text: 'Kötü', emoji: '😕', color: '#FF9800' };
    return { text: 'Çok Kötü', emoji: '😫', color: '#F44336' };
  };

  // UV durumu
  const getUVStatus = (index: number): { color: string; advice: string } => {
    if (index <= 2) return { color: '#4CAF50', advice: 'Güneşin tadını çıkarın' };
    if (index <= 5) return { color: '#FFEB3B', advice: 'Gözlük kullanın' };
    if (index <= 7) return { color: '#FF9800', advice: 'Güneş kremi sürün' };
    if (index <= 10) return { color: '#F44336', advice: 'Gölgede kalın' };
    return { color: '#9C27B0', advice: 'Dışarı çıkmaktan kaçının' };
  };

  const comfortStatus = getComfortStatus(comfort.comfortIndex);
  const uvStatus = getUVStatus(comfort.uvIndex);

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>Konfor</Text>
          {size !== 'small' && (
            <Text style={[styles.location, { color: theme.textSecondary }]}>{current.location}</Text>
          )}
        </View>

        {/* Konfor indeksi */}
        <View style={styles.mainInfo}>
          <Text style={styles.emoji}>{comfortStatus.emoji}</Text>
          <View style={styles.indexContainer}>
            <Text style={[styles.indexValue, { color: theme.textPrimary }]}>
              {comfort.comfortIndex}
            </Text>
            <Text style={[styles.indexLabel, { color: theme.textSecondary }]}>/100</Text>
          </View>
        </View>

        {/* Durum */}
        <View style={[styles.statusBadge, { backgroundColor: comfortStatus.color + '40' }]}>
          <Text style={[styles.statusText, { color: comfortStatus.color }]}>
            {comfortStatus.text}
          </Text>
        </View>

        {/* UV ve Hava Kalitesi (medium ve large için) */}
        {size !== 'small' && (
          <View style={styles.metrics}>
            {/* UV */}
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: uvStatus.color }]}>
                <Text style={styles.metricEmoji}>☀️</Text>
              </View>
              <View style={styles.metricInfo}>
                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
                  UV {comfort.uvIndex}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  {comfort.uvLevel}
                </Text>
              </View>
            </View>

            {/* Hava Kalitesi */}
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: getAQIColor(comfort.airQualityIndex) }]}>
                <Text style={styles.metricEmoji}>🌬️</Text>
              </View>
              <View style={styles.metricInfo}>
                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
                  AQI {comfort.airQualityIndex}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  {comfort.airQualityLevel}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tavsiye (large için) */}
        {size === 'large' && (
          <View style={styles.adviceSection}>
            <Text style={[styles.adviceTitle, { color: theme.textSecondary }]}>Tavsiye</Text>
            <View style={styles.adviceList}>
              <Text style={[styles.adviceItem, { color: theme.textPrimary }]}>
                ☀️ {uvStatus.advice}
              </Text>
              <Text style={[styles.adviceItem, { color: theme.textPrimary }]}>
                🌡️ {getTemperatureAdvice(current.temperature, current.feelsLike)}
              </Text>
              <Text style={[styles.adviceItem, { color: theme.textPrimary }]}>
                💨 {getWindAdvice(current.windSpeed)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

// Yardımcı fonksiyonlar
function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#4CAF50';
  if (aqi <= 100) return '#FFEB3B';
  if (aqi <= 150) return '#FF9800';
  if (aqi <= 200) return '#F44336';
  return '#9C27B0';
}

function getTemperatureAdvice(temp: number, feelsLike: number): string {
  const diff = feelsLike - temp;
  if (temp < 5) return 'Kalın giyinin, çok soğuk';
  if (temp < 15) return 'Mont veya ceket alın';
  if (temp < 25) return 'Hafif kıyafetler ideal';
  if (temp < 35) return 'Bol su için, serinleyin';
  return 'Aşırı sıcak, dikkatli olun';
}

function getWindAdvice(wind: number): string {
  if (wind < 10) return 'Rüzgar sakin';
  if (wind < 20) return 'Hafif esinti var';
  if (wind < 40) return 'Rüzgarlı, şapka tutun';
  return 'Kuvvetli rüzgar, dikkat';
}

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
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 11,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  emoji: {
    fontSize: 36,
    marginRight: 8,
  },
  indexContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  indexValue: {
    fontSize: 40,
    fontWeight: '300',
  },
  indexLabel: {
    fontSize: 16,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  metricEmoji: {
    fontSize: 16,
  },
  metricInfo: {},
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 10,
  },
  adviceSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  adviceTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  adviceList: {
    gap: 6,
  },
  adviceItem: {
    fontSize: 13,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ComfortWidget;
