import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { DailyWeather } from '../types/weather';
import { AppSettings } from '../types/settings';
import { getWeatherIcon } from '../utils/weatherUtils';

interface WeeklySummaryProps {
  daily: DailyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  daily,
  theme,
  settings,
}) => {
  const weekData = daily.slice(0, 7);
  
  // Calculate averages and stats
  const avgHighTemp = Math.round(weekData.reduce((sum, d) => sum + d.temperatureMax, 0) / weekData.length);
  const avgLowTemp = Math.round(weekData.reduce((sum, d) => sum + d.temperatureMin, 0) / weekData.length);
  const totalPrecip = weekData.reduce((sum, d) => sum + d.precipitationSum, 0);
  const rainyDays = weekData.filter(d => d.precipitationProbability >= 50).length;
  const sunnyDays = weekData.filter(d => d.weatherCode <= 2).length;
  const maxTemp = Math.max(...weekData.map(d => d.temperatureMax));
  const minTemp = Math.min(...weekData.map(d => d.temperatureMin));
  
  // Convert temperature
  const convertTemp = (celsius: number): number => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round(celsius * 9/5 + 32);
    }
    return Math.round(celsius);
  };
  
  const tempSymbol = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  
  // Most common weather
  const weatherCounts: Record<number, number> = {};
  weekData.forEach(d => {
    const code = d.weatherCode;
    weatherCounts[code] = (weatherCounts[code] || 0) + 1;
  });
  const dominantWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantIcon = getWeatherIcon(parseInt(dominantWeather[0]), true);
  
  const getWeekdayName = (index: number): string => {
    const weekdays = settings.language === 'tr'
      ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const date = new Date(weekData[index].date);
    return weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        📊 {settings.language === 'tr' ? 'Haftalık Özet' : 'Weekly Summary'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🌡️</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {convertTemp(avgHighTemp)}/{convertTemp(avgLowTemp)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Ort. Sıcaklık' : 'Avg Temp'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>☀️</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{sunnyDays}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Güneşli Gün' : 'Sunny Days'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🌧️</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{rainyDays}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Yağışlı Gün' : 'Rainy Days'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💧</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{totalPrecip.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>mm</Text>
          </View>
        </View>
        
        {/* Mini Week View */}
        <View style={styles.weekView}>
          {weekData.map((day, index) => {
            const tempRange = maxTemp - minTemp || 1;
            const barBottom = ((day.temperatureMin - minTemp) / tempRange) * 30;
            const barHeight = ((day.temperatureMax - day.temperatureMin) / tempRange) * 30 + 10;
            
            return (
              <View key={index} style={styles.dayColumn}>
                <Text style={[styles.dayTemp, { color: theme.text }]}>
                  {convertTemp(day.temperatureMax)}°
                </Text>
                <View style={styles.tempBarContainer}>
                  <View 
                    style={[
                      styles.tempBar,
                      {
                        height: barHeight,
                        marginBottom: barBottom,
                        backgroundColor: theme.accent,
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.dayTemp, { color: theme.textSecondary }]}>
                  {convertTemp(day.temperatureMin)}°
                </Text>
                <Text style={styles.dayIcon}>{getWeatherIcon(day.weatherCode, true)}</Text>
                <Text style={[styles.dayName, { color: theme.textSecondary }]}>
                  {getWeekdayName(index)}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Summary Text */}
        <View style={[styles.summaryBox, { backgroundColor: theme.secondary }]}>
          <Text style={styles.summaryEmoji}>{dominantIcon}</Text>
          <Text style={[styles.summaryText, { color: theme.text }]}>
            {settings.language === 'tr'
              ? `Bu hafta çoğunlukla ${sunnyDays >= rainyDays ? 'güneşli' : 'yağışlı'} geçecek. En yüksek sıcaklık ${convertTemp(maxTemp)}${tempSymbol}, en düşük ${convertTemp(minTemp)}${tempSymbol} olacak.`
              : `This week will be mostly ${sunnyDays >= rainyDays ? 'sunny' : 'rainy'}. High of ${convertTemp(maxTemp)}${tempSymbol}, low of ${convertTemp(minTemp)}${tempSymbol}.`
            }
          </Text>
        </View>
      </View>
    </View>
  );
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  weekView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayTemp: {
    fontSize: 10,
    fontWeight: '600',
  },
  tempBarContainer: {
    height: 50,
    justifyContent: 'flex-end',
    marginVertical: 4,
  },
  tempBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 10,
  },
  dayIcon: {
    fontSize: 16,
    marginVertical: 2,
  },
  dayName: {
    fontSize: 9,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  summaryEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
