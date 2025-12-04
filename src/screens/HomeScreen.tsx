import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  CurrentWeatherDisplay,
  HourlyForecast,
  WeatherTips,
  WeatherDetailsGrid,
  WeatherAlerts,
  FeelsLikeExplainer,
  ComfortIndex,
  WeatherShare,
} from '../components';
import { WeatherData } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';

interface HomeScreenProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
  refreshing: boolean;
  onRefresh: () => void;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
  getTemperatureSymbol: () => string;
  getWindSpeedSymbol: () => string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  weatherData,
  theme,
  settings,
  refreshing,
  onRefresh,
  convertTemperature,
  convertWindSpeed,
  getTemperatureSymbol,
  getWindSpeedSymbol,
}) => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.text}
          colors={[theme.accent]}
        />
      }
    >
      <CurrentWeatherDisplay
        weather={weatherData.current}
        locationName={weatherData.location.name}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
        convertWindSpeed={convertWindSpeed}
        getTemperatureSymbol={getTemperatureSymbol}
        getWindSpeedSymbol={getWindSpeedSymbol}
      />

      {/* Weather Alerts - Show first if there are any */}
      <WeatherAlerts
        weatherData={weatherData}
        theme={theme}
        settings={settings}
      />

      <HourlyForecast
        hourlyData={weatherData.hourly}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
      />

      <FeelsLikeExplainer
        weatherData={weatherData}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
        getTemperatureSymbol={getTemperatureSymbol}
      />

      <ComfortIndex
        hourlyData={weatherData.hourly}
        theme={theme}
        settings={settings}
      />

      <WeatherTips
        weather={weatherData}
        theme={theme}
        settings={settings}
      />

      <WeatherDetailsGrid
        current={weatherData.current}
        theme={theme}
        settings={settings}
      />

      <WeatherShare
        weatherData={weatherData}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
        getTemperatureSymbol={getTemperatureSymbol}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
});
