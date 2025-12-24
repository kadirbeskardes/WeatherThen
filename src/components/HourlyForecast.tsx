import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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

interface HourCardProps {
  hour: HourlyWeather;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
}

// Memoized hour card component
const HourCard = memo<HourCardProps>(({ hour, theme, settings, convertTemperature }) => {
  const displayTemperature = useMemo(() => convertTemperature(hour.temperature), [hour.temperature, convertTemperature]);
  const weatherIcon = useMemo(() => getWeatherIcon(hour.weatherCode, hour.isDay), [hour.weatherCode, hour.isDay]);
  const formattedTime = useMemo(() => formatHour(hour.time, settings.language, settings.hourFormat24), [hour.time, settings.language, settings.hourFormat24]);

  return (
    <View style={[styles.hourCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.time, { color: theme.textSecondary }]}>{formattedTime}</Text>
      <Text style={styles.icon}>{weatherIcon}</Text>
      <Text style={[styles.temp, { color: theme.text }]}>{displayTemperature}°</Text>
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
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.hour.time === nextProps.hour.time &&
    prevProps.hour.temperature === nextProps.hour.temperature &&
    prevProps.hour.weatherCode === nextProps.hour.weatherCode &&
    prevProps.settings.language === nextProps.settings.language &&
    prevProps.settings.temperatureUnit === nextProps.settings.temperatureUnit
  );
});

const HourlyForecastComponent: React.FC<HourlyForecastProps> = ({ 
  hourlyData, 
  theme,
  settings,
  convertTemperature,
}) => {
  const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
  
  // Limit data to 24 hours
  const displayData = useMemo(() => hourlyData.slice(0, 24), [hourlyData]);
  
  const renderItem = useCallback(({ item }: { item: HourlyWeather }) => (
    <HourCard 
      hour={item} 
      theme={theme} 
      settings={settings} 
      convertTemperature={convertTemperature}
    />
  ), [theme, settings, convertTemperature]);

  const keyExtractor = useCallback((item: HourlyWeather, index: number) => 
    `${item.time}-${index}`, []
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{translations.hourlyForecast}</Text>
      <FlatList
        horizontal
        data={displayData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: 90,
          offset: 90 * index,
          index,
        })}
      />
    </View>
  );
};

export const HourlyForecast = memo(HourlyForecastComponent);

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
