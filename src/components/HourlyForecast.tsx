import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HourlyWeather } from '../types/weather';
import { getWeatherIcon, formatHour } from '../utils/weatherUtils';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface HourlyForecastProps {
  hourlyData: HourlyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ 
  hourlyData, 
  theme,
  settings,
  convertTemperature,
}) => {
  const t = getTranslations(settings.language);
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{t.hourlyForecast}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyData.slice(0, 24).map((hour, index) => (
          <View
            key={hour.time + index}
            style={[
              styles.hourCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {formatHour(hour.time, settings.language, settings.hourFormat24)}
            </Text>
            <Text style={styles.icon}>{getWeatherIcon(hour.weatherCode, hour.isDay)}</Text>
            <Text style={[styles.temp, { color: theme.text }]}>{convertTemperature(hour.temperature)}°</Text>
            {hour.precipitationProbability > 0 && (
              <View style={styles.precipContainer}>
                <Text style={styles.precipIcon}>💧</Text>
                <Text style={[styles.precip, { color: '#64B5F6' }]}>
                  {hour.precipitationProbability}%
                </Text>
              </View>
            )}
            <View style={styles.windContainer}>
              <Text style={[styles.wind, { color: theme.textSecondary }]}>
                💨 {hour.windSpeed}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingLeft: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 20,
  },
  hourCard: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 80,
    borderWidth: 1,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  temp: {
    fontSize: 18,
    fontWeight: '600',
  },
  precipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  precipIcon: {
    fontSize: 10,
  },
  precip: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
  windContainer: {
    marginTop: 4,
  },
  wind: {
    fontSize: 11,
  },
});
