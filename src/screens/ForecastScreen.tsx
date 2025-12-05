import React, { useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import {
  DailyForecast,
  DayDetailModal,
  TemperatureChart,
  PrecipitationChart,
  WeeklySummary,
  SunPath,
  MoonPhase,
  WeekAtGlance,
  AirQualityCard,
  PremiumFeatureWrapper,
  PremiumPaywall,
} from '../components';
import { WeatherData, DailyWeather } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';

interface ForecastScreenProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
  refreshing: boolean;
  onRefresh: () => void;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
  getTemperatureSymbol: () => string;
}

export const ForecastScreen: React.FC<ForecastScreenProps> = ({
  weatherData,
  theme,
  settings,
  refreshing,
  onRefresh,
  convertTemperature,
  convertWindSpeed,
  getTemperatureSymbol,
}) => {
  const [selectedDay, setSelectedDay] = useState<DailyWeather | null>(null);
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
        <WeekAtGlance
          daily={weatherData.daily}
          theme={theme}
          settings={settings}
          convertTemperature={convertTemperature}
          getTemperatureSymbol={getTemperatureSymbol}
        />

        <WeeklySummary
          daily={weatherData.daily}
          theme={theme}
          settings={settings}
        />

        {/* Premium: Temperature Chart */}
        <PremiumFeatureWrapper 
          feature="temperature_chart" 
          theme={theme} 
          language={settings.language}
          onUpgradePress={handleUpgradePress}
        >
          <TemperatureChart
            daily={weatherData.daily}
            theme={theme}
            settings={settings}
          />
        </PremiumFeatureWrapper>

        <SunPath
          daily={weatherData.daily[0]}
          theme={theme}
          settings={settings}
        />

        {/* Premium: Moon Phase */}
        <PremiumFeatureWrapper 
          feature="moon_phase" 
          theme={theme} 
          language={settings.language}
          onUpgradePress={handleUpgradePress}
        >
          <MoonPhase
            theme={theme}
            settings={settings}
          />
        </PremiumFeatureWrapper>

        {/* Premium: Air Quality */}
        <PremiumFeatureWrapper 
          feature="air_quality" 
          theme={theme} 
          language={settings.language}
          onUpgradePress={handleUpgradePress}
        >
          <AirQualityCard
            theme={theme}
            settings={settings}
            latitude={weatherData.location.latitude}
            longitude={weatherData.location.longitude}
          />
        </PremiumFeatureWrapper>

        {/* Premium: Precipitation Chart */}
        <PremiumFeatureWrapper 
          feature="precipitation_chart" 
          theme={theme} 
          language={settings.language}
          onUpgradePress={handleUpgradePress}
        >
          <PrecipitationChart
            hourly={weatherData.hourly}
            theme={theme}
            settings={settings}
          />
        </PremiumFeatureWrapper>

        <DailyForecast
          dailyData={weatherData.daily}
          theme={theme}
          settings={settings}
          convertTemperature={convertTemperature}
          onDayPress={(day) => setSelectedDay(day)}
        />
      </ScrollView>

      <DayDetailModal
        visible={!!selectedDay}
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
        convertWindSpeed={convertWindSpeed}
      />

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
