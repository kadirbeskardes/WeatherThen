import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
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

interface DayCardProps {
  day: DailyWeather;
  theme: ThemeColors;
  settings: AppSettings;
  onPress?: () => void;
  convertTemperature: (celsius: number) => number;
}

const DayCard = memo<DayCardProps>(({ day, theme, settings, onPress, convertTemperature }) => {
  const formattedDayName = useMemo(() => formatDayName(day.date, settings.language), [day.date, settings.language]);
  const formattedSunrise = useMemo(() => formatTime(day.sunrise, settings.language, settings.hourFormat24), [day.sunrise, settings.language, settings.hourFormat24]);
  const formattedSunset = useMemo(() => formatTime(day.sunset, settings.language, settings.hourFormat24), [day.sunset, settings.language, settings.hourFormat24]);
  const weatherIcon = useMemo(() => getWeatherIcon(day.weatherCode, true), [day.weatherCode]);
  const displayMaxTemperature = useMemo(() => convertTemperature(day.temperatureMax), [day.temperatureMax, convertTemperature]);
  const displayMinTemperature = useMemo(() => convertTemperature(day.temperatureMin), [day.temperatureMin, convertTemperature]);
  const temperatureRangeBarWidth = useMemo(() => `${((day.temperatureMax - day.temperatureMin) / 40) * 100}%`, [day.temperatureMax, day.temperatureMin]);

  return (
    <TouchableOpacity
      style={[styles.dayCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dayInfo}>
        <Text style={[styles.dayName, { color: theme.text }]}>{formattedDayName}</Text>
        <View style={styles.sunTimes}>
          <Text style={[styles.sunTime, { color: theme.textSecondary }]}>🌅 {formattedSunrise}</Text>
          <Text style={[styles.sunTime, { color: theme.textSecondary }]}>🌇 {formattedSunset}</Text>
        </View>
      </View>

      <View style={styles.weatherInfo}>
        <Text style={styles.icon}>{weatherIcon}</Text>
        {day.precipitationProbability > 0 && (
          <Text style={[styles.precip, { color: '#64B5F6' }]}>
            💧{day.precipitationProbability}%
          </Text>
        )}
      </View>

      <View style={styles.tempContainer}>
        <Text style={[styles.tempMax, { color: theme.text }]}>{displayMaxTemperature}°</Text>
        <View style={[styles.tempBar, { backgroundColor: theme.secondary }]}>
          <View style={[styles.tempBarFill, { width: temperatureRangeBarWidth, backgroundColor: theme.accent }]} />
        </View>
        <Text style={[styles.tempMin, { color: theme.textSecondary }]}>{displayMinTemperature}°</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.day.date === nextProps.day.date &&
    prevProps.day.temperatureMax === nextProps.day.temperatureMax &&
    prevProps.day.temperatureMin === nextProps.day.temperatureMin &&
    prevProps.day.weatherCode === nextProps.day.weatherCode &&
    prevProps.settings.language === nextProps.settings.language &&
    prevProps.settings.temperatureUnit === nextProps.settings.temperatureUnit
  );
});

const DailyForecastComponent: React.FC<DailyForecastProps> = ({ 
  dailyData, 
  theme,
  onDayPress,
  settings,
  convertTemperature,
}) => {
  const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
  
  const renderItem = useCallback(({ item }: { item: DailyWeather }) => (
    <DayCard
      day={item}
      theme={theme}
      settings={settings}
      onPress={() => onDayPress?.(item)}
      convertTemperature={convertTemperature}
    />
  ), [theme, settings, onDayPress, convertTemperature]);

  const keyExtractor = useCallback((item: DailyWeather) => item.date, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{translations.dailyForecast}</Text>
      <FlatList
        data={dailyData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        initialNumToRender={7}
        maxToRenderPerBatch={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export const DailyForecast = memo(DailyForecastComponent);

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
