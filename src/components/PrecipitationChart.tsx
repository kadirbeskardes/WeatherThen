import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { HourlyWeather } from '../types/weather';
import { AppSettings } from '../types/settings';
import { getWeatherIcon, formatHour } from '../utils/weatherUtils';

interface PrecipitationChartProps {
  hourly: HourlyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
}

const { width } = Dimensions.get('window');
const CHART_HOURS = 12;
const BAR_WIDTH = (width - 60) / CHART_HOURS;

export const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
  hourly,
  theme,
  settings,
}) => {
  const displayData = hourly.slice(0, CHART_HOURS);
  const maxProbability = Math.max(...displayData.map(h => h.precipitationProbability), 20);
  
  const getBarColor = (probability: number): string => {
    if (probability >= 70) return '#4FC3F7';
    if (probability >= 40) return '#81D4FA';
    return '#B3E5FC';
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🌧️ {settings.language === 'tr' ? 'Yağış İhtimali' : 'Precipitation Chance'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Chart */}
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={[styles.yLabel, { color: theme.textSecondary }]}>100%</Text>
            <Text style={[styles.yLabel, { color: theme.textSecondary }]}>50%</Text>
            <Text style={[styles.yLabel, { color: theme.textSecondary }]}>0%</Text>
          </View>
          
          {/* Bars */}
          <View style={styles.barsContainer}>
            {/* Grid lines */}
            <View style={[styles.gridLine, styles.gridTop, { borderColor: theme.cardBorder }]} />
            <View style={[styles.gridLine, styles.gridMid, { borderColor: theme.cardBorder }]} />
            <View style={[styles.gridLine, styles.gridBottom, { borderColor: theme.cardBorder }]} />
            
            {displayData.map((hour, index) => {
              const barHeight = (hour.precipitationProbability / 100) * 80;
              
              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barColumn}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 2),
                          backgroundColor: getBarColor(hour.precipitationProbability),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                    {formatHour(hour.time, settings.language, settings.hourFormat24)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#B3E5FC' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Düşük' : 'Low'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#81D4FA' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Orta' : 'Medium'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4FC3F7' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Yüksek' : 'High'}
            </Text>
          </View>
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
    padding: 15,
  },
  chart: {
    flexDirection: 'row',
    height: 120,
  },
  yAxis: {
    width: 35,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  yLabel: {
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 5,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    position: 'relative',
    paddingBottom: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  gridTop: {
    top: 5,
  },
  gridMid: {
    top: '50%',
  },
  gridBottom: {
    bottom: 20,
  },
  barWrapper: {
    alignItems: 'center',
    width: BAR_WIDTH - 4,
  },
  barColumn: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 8,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
  },
});
