import React, { useState } from 'react';
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
  PremiumFeatureWrapper,
  PremiumPaywall,
  QuickStats,
  DayNightCycle,
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
  const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);

  const handleUpgradePress = () => {
    setShowPremiumPaywall(true);
  };

  return (
    <>
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
        yesterdayTemp={weatherData.daily[1]?.temperatureMax}
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
      
      <QuickStats
        weatherData={weatherData}
        theme={theme}
        settings={settings}
      />
      
      <DayNightCycle
        sunrise={weatherData.daily[0].sunrise}
        sunset={weatherData.daily[0].sunset}
        currentTime={new Date()}
        theme={theme}
        language={settings.language}
      />

      <FeelsLikeExplainer
        weatherData={weatherData}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
        getTemperatureSymbol={getTemperatureSymbol}
      />

      {/* Premium: Comfort Index */}
      <PremiumFeatureWrapper 
        feature="comfort_index" 
        theme={theme} 
        language={settings.language}
        onUpgradePress={handleUpgradePress}
      >
        <ComfortIndex
          hourlyData={weatherData.hourly}
          theme={theme}
          settings={settings}
        />
      </PremiumFeatureWrapper>

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

      {/* Premium: Weather Share */}
      <PremiumFeatureWrapper 
        feature="weather_share" 
        theme={theme} 
        language={settings.language}
        onUpgradePress={handleUpgradePress}
      >
        <WeatherShare
          weatherData={weatherData}
          theme={theme}
          settings={settings}
          convertTemperature={convertTemperature}
          getTemperatureSymbol={getTemperatureSymbol}
        />
      </PremiumFeatureWrapper>
    </ScrollView>

    {/* Premium Paywall */}
    <PremiumPaywall
      visible={showPremiumPaywall}
      onClose={() => setShowPremiumPaywall(false)}
      theme={theme}
      language={settings.language}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
});
