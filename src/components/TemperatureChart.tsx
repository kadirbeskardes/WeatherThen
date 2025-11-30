import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { DailyWeather } from '../types/weather';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface TemperatureChartProps {
  daily: DailyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 120;
const PADDING = 20;

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  daily,
  theme,
  settings,
}) => {
  const t = getTranslations(settings.language);
  const data = daily.slice(0, 7);
  
  // Convert temperature based on settings
  const convertTemperature = (celsius: number): number => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round(celsius * 9/5 + 32);
    }
    return Math.round(celsius);
  };
  
  // Find min and max temperatures
  const allTemps = data.flatMap(d => [d.temperatureMax, d.temperatureMin]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp || 1;
  
  // Calculate positions
  const getY = (temp: number) => {
    const normalized = (temp - minTemp) / tempRange;
    return CHART_HEIGHT - PADDING - (normalized * (CHART_HEIGHT - PADDING * 2));
  };
  
  const getX = (index: number) => {
    return PADDING + (index * ((CHART_WIDTH - PADDING * 2) / (data.length - 1)));
  };

  const getDayLabel = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) {
      return settings.language === 'tr' ? 'Bugün' : 'Today';
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return settings.language === 'tr' ? 'Yarın' : 'Tmrw';
    }
    
    const locale = settings.language === 'tr' ? 'tr-TR' : 'en-US';
    return d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 3);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        📈 {settings.language === 'tr' ? '7 Günlük Sıcaklık Grafiği' : '7-Day Temperature Chart'}
      </Text>
      
      <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Grid lines */}
        <View style={[styles.gridLine, { top: PADDING, backgroundColor: theme.secondary }]} />
        <View style={[styles.gridLine, { top: CHART_HEIGHT / 2, backgroundColor: theme.secondary }]} />
        <View style={[styles.gridLine, { top: CHART_HEIGHT - PADDING, backgroundColor: theme.secondary }]} />
        
        {/* Temperature labels */}
        <Text style={[styles.tempLabel, { top: PADDING - 8, color: theme.textSecondary }]}>
          {convertTemperature(Math.round(maxTemp))}°
        </Text>
        <Text style={[styles.tempLabel, { top: CHART_HEIGHT - PADDING - 8, color: theme.textSecondary }]}>
          {convertTemperature(Math.round(minTemp))}°
        </Text>
        
        {/* Data points and lines */}
        {data.map((day, index) => {
          const x = getX(index);
          const yMax = getY(day.temperatureMax);
          const yMin = getY(day.temperatureMin);
          
          return (
            <View key={day.date}>
              {/* Max temperature point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    left: x - 6,
                    top: yMax - 6,
                    backgroundColor: '#FF6B6B',
                  },
                ]}
              />
              <Text
                style={[
                  styles.pointLabel,
                  {
                    left: x - 15,
                    top: yMax - 22,
                    color: '#FF6B6B',
                  },
                ]}
              >
                {convertTemperature(day.temperatureMax)}°
              </Text>
              
              {/* Min temperature point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    left: x - 6,
                    top: yMin - 6,
                    backgroundColor: '#4ECDC4',
                  },
                ]}
              />
              <Text
                style={[
                  styles.pointLabel,
                  {
                    left: x - 15,
                    top: yMin + 10,
                    color: '#4ECDC4',
                  },
                ]}
              >
                {convertTemperature(day.temperatureMin)}°
              </Text>
              
              {/* Connecting line */}
              <View
                style={[
                  styles.connectingLine,
                  {
                    left: x - 1,
                    top: yMax,
                    height: yMin - yMax,
                    backgroundColor: theme.accent,
                  },
                ]}
              />
              
              {/* Day label */}
              <Text
                style={[
                  styles.dayLabel,
                  {
                    left: x - 20,
                    color: theme.textSecondary,
                  },
                ]}
              >
                {getDayLabel(day.date)}
              </Text>
            </View>
          );
        })}
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Maks' : 'Max'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Min' : 'Min'}
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
  chartContainer: {
    height: CHART_HEIGHT + 40,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: PADDING,
    right: PADDING,
    height: 1,
    opacity: 0.3,
  },
  tempLabel: {
    position: 'absolute',
    left: 5,
    fontSize: 10,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  pointLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  connectingLine: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  dayLabel: {
    position: 'absolute',
    bottom: 8,
    fontSize: 11,
    width: 40,
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    top: 8,
    right: 10,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
  },
});
