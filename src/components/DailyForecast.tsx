import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DailyWeather } from '../types/weather';
import { getWeatherIcon, formatDayName, formatTime } from '../utils/weatherUtils';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface DailyForecastProps {
  dailyData: DailyWeather[];
  theme: ThemeColors;
  onDayPress?: (day: DailyWeather) => void;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ 
  dailyData, 
  theme,
  onDayPress,
  settings,
  convertTemperature,
}) => {
  const t = getTranslations(settings.language);
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{t.dailyForecast}</Text>
      {dailyData.map((day, index) => (
        <TouchableOpacity
          key={day.date}
          style={[
            styles.dayCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
          onPress={() => onDayPress?.(day)}
          activeOpacity={0.7}
        >
          <View style={styles.dayInfo}>
            <Text style={[styles.dayName, { color: theme.text }]}>
              {formatDayName(day.date, settings.language)}
            </Text>
            <View style={styles.sunTimes}>
              <Text style={[styles.sunTime, { color: theme.textSecondary }]}>
                🌅 {formatTime(day.sunrise, settings.language, settings.hourFormat24)}
              </Text>
              <Text style={[styles.sunTime, { color: theme.textSecondary }]}>
                🌇 {formatTime(day.sunset, settings.language, settings.hourFormat24)}
              </Text>
            </View>
          </View>

          <View style={styles.weatherInfo}>
            <Text style={styles.icon}>{getWeatherIcon(day.weatherCode, true)}</Text>
            {day.precipitationProbability > 0 && (
              <Text style={[styles.precip, { color: '#64B5F6' }]}>
                💧{day.precipitationProbability}%
              </Text>
            )}
          </View>

          <View style={styles.tempContainer}>
            <Text style={[styles.tempMax, { color: theme.text }]}>
              {convertTemperature(day.temperatureMax)}°
            </Text>
            <View style={[styles.tempBar, { backgroundColor: theme.secondary }]}>
              <View 
                style={[
                  styles.tempBarFill, 
                  { 
                    width: `${((day.temperatureMax - day.temperatureMin) / 40) * 100}%`,
                    backgroundColor: theme.accent 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.tempMin, { color: theme.textSecondary }]}>
              {convertTemperature(day.temperatureMin)}°
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sunTimes: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sunTime: {
    fontSize: 11,
    marginRight: 10,
  },
  weatherInfo: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  icon: {
    fontSize: 32,
  },
  precip: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  tempMax: {
    fontSize: 16,
    fontWeight: '600',
    width: 35,
    textAlign: 'right',
  },
  tempBar: {
    height: 4,
    width: 40,
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  tempBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  tempMin: {
    fontSize: 14,
    width: 35,
  },
});
