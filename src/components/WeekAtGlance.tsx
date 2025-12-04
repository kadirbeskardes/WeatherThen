import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { DailyWeather } from '../types/weather';
import { getWeatherEmoji } from '../utils/weatherUtils';

interface WeekAtGlanceProps {
  daily: DailyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
  getTemperatureSymbol: () => string;
}

export const WeekAtGlance: React.FC<WeekAtGlanceProps> = ({
  daily,
  theme,
  settings,
  convertTemperature,
  getTemperatureSymbol,
}) => {
  const symbol = getTemperatureSymbol();
  
  // Get min/max for the week
  const weekData = daily.slice(0, 7);
  const minTemp = Math.min(...weekData.map(d => d.temperatureMin));
  const maxTemp = Math.max(...weekData.map(d => d.temperatureMax));
  const tempRange = maxTemp - minTemp || 1;
  
  const formatDay = (dateStr: string, index: number): string => {
    if (index === 0) return settings.language === 'tr' ? 'Bugün' : 'Today';
    if (index === 1) return settings.language === 'tr' ? 'Yarın' : 'Tomorrow';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'short',
    });
  };
  
  // Calculate rainy days
  const rainyDays = weekData.filter(d => d.precipitationProbability > 50).length;
  
  // Calculate average temp
  const avgTemp = Math.round(
    weekData.reduce((sum, d) => sum + (d.temperatureMax + d.temperatureMin) / 2, 0) / weekData.length
  );
  
  // Get trend
  const firstHalfAvg = weekData.slice(0, 3).reduce((sum, d) => sum + d.temperatureMax, 0) / 3;
  const secondHalfAvg = weekData.slice(4, 7).reduce((sum, d) => sum + d.temperatureMax, 0) / 3;
  const trend = secondHalfAvg > firstHalfAvg + 2 ? 'warming' : secondHalfAvg < firstHalfAvg - 2 ? 'cooling' : 'stable';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        📊 {settings.language === 'tr' ? 'Haftalık Bakış' : 'Week at a Glance'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌡️</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {convertTemperature(avgTemp)}{symbol}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Ortalama' : 'Average'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌧️</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {rainyDays}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Yağışlı Gün' : 'Rainy Days'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>
              {trend === 'warming' ? '📈' : trend === 'cooling' ? '📉' : '➡️'}
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {trend === 'warming' 
                ? (settings.language === 'tr' ? 'Isınma' : 'Warming')
                : trend === 'cooling'
                  ? (settings.language === 'tr' ? 'Soğuma' : 'Cooling')
                  : (settings.language === 'tr' ? 'Stabil' : 'Stable')
              }
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Trend' : 'Trend'}
            </Text>
          </View>
        </View>
        
        {/* Temperature visualization */}
        <View style={styles.tempVisualization}>
          {weekData.map((day, index) => {
            const lowPercent = ((day.temperatureMin - minTemp) / tempRange) * 100;
            const highPercent = ((day.temperatureMax - minTemp) / tempRange) * 100;
            const barWidth = highPercent - lowPercent;
            
            return (
              <View key={index} style={styles.dayRow}>
                <Text style={[styles.dayLabel, { color: theme.text }]}>
                  {formatDay(day.date, index)}
                </Text>
                
                <Text style={styles.weatherEmoji}>{getWeatherEmoji(day.weatherCode, true)}</Text>
                
                <View style={styles.tempBarContainer}>
                  <Text style={[styles.tempMin, { color: theme.textSecondary }]}>
                    {convertTemperature(day.temperatureMin)}°
                  </Text>
                  
                  <View style={[styles.tempBarTrack, { backgroundColor: theme.secondary }]}>
                    <View 
                      style={[
                        styles.tempBar,
                        {
                          left: `${lowPercent}%`,
                          width: `${Math.max(barWidth, 5)}%`,
                          backgroundColor: getBarColor(day.temperatureMax),
                        }
                      ]}
                    />
                  </View>
                  
                  <Text style={[styles.tempMax, { color: theme.text }]}>
                    {convertTemperature(day.temperatureMax)}°
                  </Text>
                </View>
                
                {day.precipitationProbability > 30 && (
                  <Text style={[styles.rainChance, { color: '#64B5F6' }]}>
                    💧{day.precipitationProbability}%
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const getBarColor = (temp: number): string => {
  if (temp >= 35) return '#F44336';
  if (temp >= 30) return '#FF5722';
  if (temp >= 25) return '#FF9800';
  if (temp >= 20) return '#FFC107';
  if (temp >= 15) return '#8BC34A';
  if (temp >= 10) return '#4CAF50';
  if (temp >= 5) return '#00BCD4';
  if (temp >= 0) return '#03A9F4';
  return '#2196F3';
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  tempVisualization: {
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  },
  dayLabel: {
    width: 55,
    fontSize: 13,
    fontWeight: '500',
  },
  weatherEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  tempBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  tempMin: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
    marginRight: 6,
  },
  tempBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tempBar: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  tempMax: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  rainChance: {
    fontSize: 11,
    width: 45,
    textAlign: 'right',
  },
});
