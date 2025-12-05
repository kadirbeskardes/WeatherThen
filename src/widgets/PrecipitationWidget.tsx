/**
 * Precipitation Widget Component
 * Yağış olasılığı widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetWeatherData, WidgetHourlyData } from '../services/widgetService';
import { getWidgetTheme, WidgetSize } from './types';

interface PrecipitationWidgetProps {
  current: WidgetWeatherData | null;
  hourly: WidgetHourlyData[] | null;
  size: WidgetSize;
  isNight?: boolean;
}

export const PrecipitationWidget: React.FC<PrecipitationWidgetProps> = ({
  current,
  hourly,
  size,
  isNight = false,
}) => {
  if (!current || !hourly) {
    return (
      <View style={[styles.container, styles[size]]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theme = getWidgetTheme(current.conditionCode, isNight);
  
  // Sonraki 12 saatteki maksimum yağış olasılığı
  const next12Hours = hourly.slice(0, 12);
  const maxPrecip = Math.max(...next12Hours.map(h => h.precipitationProbability));
  const avgPrecip = Math.round(next12Hours.reduce((sum, h) => sum + h.precipitationProbability, 0) / next12Hours.length);

  // Yağış durumu
  const getPrecipStatus = (prob: number): { text: string; emoji: string; color: string } => {
    if (prob < 20) return { text: 'Yağış beklenmiyor', emoji: '☀️', color: '#4CAF50' };
    if (prob < 40) return { text: 'Düşük olasılık', emoji: '🌤️', color: '#8BC34A' };
    if (prob < 60) return { text: 'Orta olasılık', emoji: '🌥️', color: '#FFC107' };
    if (prob < 80) return { text: 'Yüksek olasılık', emoji: '🌧️', color: '#FF9800' };
    return { text: 'Yağış bekleniyor', emoji: '⛈️', color: '#F44336' };
  };

  const status = getPrecipStatus(maxPrecip);
  const currentPrecip = current.precipitationProbability;

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
          <Text style={[styles.title, { color: theme.textPrimary }]}>🌧️ Yağış</Text>
          {size !== 'small' && (
            <Text style={[styles.location, { color: theme.textSecondary }]}>{current.location}</Text>
          )}
        </View>

        {/* Ana yağış bilgisi */}
        <View style={styles.mainInfo}>
          <Text style={styles.emoji}>{status.emoji}</Text>
          <View style={styles.percentContainer}>
            <Text style={[styles.percent, { color: theme.textPrimary }]}>
              %{currentPrecip}
            </Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Şu an</Text>
          </View>
        </View>

        {/* Durum */}
        <View style={[styles.statusBadge, { backgroundColor: status.color + '40' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>

        {/* Detaylar (medium ve large için) */}
        {size !== 'small' && (
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>%{maxPrecip}</Text>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>12 saat maks</Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: theme.textSecondary }]} />
            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>%{avgPrecip}</Text>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Ortalama</Text>
            </View>
          </View>
        )}

        {/* Mini grafik (large için) */}
        {size === 'large' && (
          <View style={styles.miniChart}>
            <Text style={[styles.chartTitle, { color: theme.textSecondary }]}>
              Sonraki 12 Saat
            </Text>
            <View style={styles.chartBars}>
              {next12Hours.map((hour, index) => (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={styles.chartBarBg}>
                    <LinearGradient
                      colors={['#4FC3F7', '#0288D1']}
                      style={[
                        styles.chartBarFill,
                        { height: `${hour.precipitationProbability}%` }
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </View>
                  {index % 2 === 0 && (
                    <Text style={[styles.chartBarLabel, { color: theme.textSecondary }]}>
                      {hour.hour.split(':')[0]}
                    </Text>
                  )}
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
    marginVertical: 8,
  },
  emoji: {
    fontSize: 36,
    marginRight: 12,
  },
  percentContainer: {
    alignItems: 'center',
  },
  percent: {
    fontSize: 36,
    fontWeight: '300',
  },
  label: {
    fontSize: 12,
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
  details: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailLabel: {
    fontSize: 10,
  },
  detailDivider: {
    width: 1,
    height: 30,
    opacity: 0.3,
  },
  miniChart: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  chartTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarBg: {
    width: 10,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 5,
  },
  chartBarLabel: {
    fontSize: 9,
    marginTop: 4,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default PrecipitationWidget;
