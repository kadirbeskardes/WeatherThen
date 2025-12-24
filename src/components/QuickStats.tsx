/**
 * Quick Stats Component
 * Hava durumu için hızlı istatistikler gösterir
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeatherData } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface QuickStatsProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
}

const QuickStatsComponent: React.FC<QuickStatsProps> = ({
  weatherData,
  theme,
  settings,
}) => {
  const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
  
  // Bugün yağmur yağacak mı?
  const willRainToday = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    return todayHourlyData.some(hour => hour.precipitationProbability > 50);
  }, [weatherData.hourly]);
  
  // Ortalama nem
  const averageHumidity = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    const humiditySum = todayHourlyData.reduce((accumulator, hour) => accumulator + hour.humidity, 0);
    return Math.round(humiditySum / todayHourlyData.length);
  }, [weatherData.hourly]);
  
  // Günün en yüksek rüzgar hızı
  const maximumWindSpeed = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    return Math.max(...todayHourlyData.map(hour => hour.windSpeed));
  }, [weatherData.hourly]);
  
  // En sıcak saat
  const hottestHourOfDay = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    const maxTemperature = Math.max(...todayHourlyData.map(hour => hour.temperature));
    const hottestHourIndex = todayHourlyData.findIndex(hour => hour.temperature === maxTemperature);
    if (hottestHourIndex >= 0) {
      const hourValue = new Date(todayHourlyData[hottestHourIndex].time).getHours();
      return `${hourValue}:00`;
    }
    return '--:--';
  }, [weatherData.hourly]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        ⚡ {settings.language === 'tr' ? 'Hızlı Bakış' : 'Quick View'}
      </Text>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statEmoji}>{willRainToday ? '🌧️' : '☀️'}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {settings.language === 'tr' ? 'Bugün' : 'Today'}
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {willRainToday 
              ? (settings.language === 'tr' ? 'Yağmur Var' : 'Rain Expected')
              : (settings.language === 'tr' ? 'Yağmur Yok' : 'No Rain')}
          </Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statEmoji}>💧</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {settings.language === 'tr' ? 'Ort. Nem' : 'Avg. Humidity'}
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {averageHumidity}%
          </Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statEmoji}>💨</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {settings.language === 'tr' ? 'Maks. Rüzgar' : 'Max Wind'}
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {maximumWindSpeed} km/h
          </Text>
        </View>
        
        <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            {settings.language === 'tr' ? 'En Sıcak' : 'Hottest'}
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {hottestHourOfDay}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const QuickStats = memo(QuickStatsComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
