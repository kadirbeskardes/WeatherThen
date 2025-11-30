import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CurrentWeatherDisplay,
  HourlyForecast,
  DailyForecast,
  LocationSearch,
  DayDetailModal,
  Header,
  LoadingScreen,
  ErrorScreen,
  SettingsModal,
  WeatherAnimation,
  TemperatureChart,
  SunPath,
  WindCompass,
  WeatherDetailsGrid,
  WeatherTips,
  PrecipitationChart,
  AirQualityCard,
  WeeklySummary,
  ClothingSuggestion,
  FavoritesModal,
  WeatherComparison,
} from './src/components';

import { WeatherData, DailyWeather, GeocodingResult, LocationData } from './src/types/weather';
import { fetchWeatherData, reverseGeocode } from './src/services/weatherApi';
import { getWeatherCondition } from './src/utils/weatherUtils';
import { getThemeColors, getGradientColors } from './src/utils/themeUtils';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { getTranslations } from './src/utils/translations';

const STORAGE_KEY = '@WeatherThen:lastLocation';

function WeatherApp() {
  const { settings, convertTemperature, convertWindSpeed, getTemperatureSymbol, getWindSpeedSymbol } = useSettings();
  const t = getTranslations(settings.language);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();

  const [searchVisible, setSearchVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [favoritesVisible, setFavoritesVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyWeather | null>(null);
  const [dayDetailVisible, setDayDetailVisible] = useState(false);

  const loadWeatherForLocation = async (location: LocationData) => {
    try {
      const data = await fetchWeatherData(location.latitude, location.longitude);
      setWeatherData({
        ...data,
        location,
      });
      setLastUpdated(new Date());
      setError(null);

      // Save location to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(t.errorWeatherFetch);
    }
  };

  const loadCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Try to load saved location
        const savedLocation = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          await loadWeatherForLocation(location);
        } else {
          // Default to Istanbul
          await loadWeatherForLocation({
            name: 'İstanbul',
            latitude: 41.0082,
            longitude: 28.9784,
            country: 'Türkiye',
          });
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationName = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      await loadWeatherForLocation({
        name: locationName,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      console.error('Location error:', err);
      // Try to load saved location on error
      const savedLocation = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        await loadWeatherForLocation(location);
      } else {
        setError(t.errorLocation);
      }
    }
  };

  const initializeApp = async () => {
    setLoading(true);
    await loadCurrentLocation();
    setLoading(false);
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (weatherData?.location) {
      await loadWeatherForLocation(weatherData.location);
    } else {
      await loadCurrentLocation();
    }
    setRefreshing(false);
  }, [weatherData?.location]);

  const handleLocationSelect = async (location: GeocodingResult | LocationData) => {
    setLoading(true);
    await loadWeatherForLocation({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      admin1: location.admin1,
    });
    setLoading(false);
  };

  const handleDayPress = (day: DailyWeather) => {
    setSelectedDay(day);
    setDayDetailVisible(true);
  };

  const handleLocationButtonPress = async () => {
    setLoading(true);
    await loadCurrentLocation();
    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !weatherData) {
    return <ErrorScreen message={error} onRetry={initializeApp} />;
  }

  if (!weatherData) {
    return <LoadingScreen />;
  }

  const condition = getWeatherCondition(weatherData.current.weatherCode);
  
  // Determine if it's day based on settings
  let isDay = weatherData.current.isDay;
  if (settings.themeMode === 'light') {
    isDay = true;
  } else if (settings.themeMode === 'dark') {
    isDay = false;
  }
  
  const theme = getThemeColors(condition, isDay);
  const gradientColors = getGradientColors(condition, isDay);

  return (
    <LinearGradient colors={gradientColors as any} style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Animated weather background */}
      <WeatherAnimation condition={condition} isDay={isDay} />
      
      <View style={styles.safeArea}>
        <Header
          onSearchPress={() => setSearchVisible(true)}
          onLocationPress={handleLocationButtonPress}
          onSettingsPress={() => setSettingsVisible(true)}
          onFavoritesPress={() => setFavoritesVisible(true)}
          theme={theme}
          lastUpdated={lastUpdated}
          language={settings.language}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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

          {/* Weather Tips */}
          <WeatherTips
            weather={weatherData}
            theme={theme}
            settings={settings}
          />

          {/* Clothing Suggestion */}
          <ClothingSuggestion
            current={weatherData.current}
            daily={weatherData.daily[0]}
            theme={theme}
            settings={settings}
          />

          <HourlyForecast
            hourlyData={weatherData.hourly}
            theme={theme}
            settings={settings}
            convertTemperature={convertTemperature}
          />

          {/* Precipitation Chart */}
          <PrecipitationChart
            hourly={weatherData.hourly}
            theme={theme}
            settings={settings}
          />

          {/* Temperature Chart for 7 days */}
          <TemperatureChart
            daily={weatherData.daily}
            theme={theme}
            settings={settings}
          />

          <DailyForecast
            dailyData={weatherData.daily}
            theme={theme}
            onDayPress={handleDayPress}
            settings={settings}
            convertTemperature={convertTemperature}
          />

          {/* Weather Details Grid */}
          <WeatherDetailsGrid
            current={weatherData.current}
            theme={theme}
            settings={settings}
          />

          {/* Sun Path */}
          <SunPath
            daily={weatherData.daily[0]}
            theme={theme}
            settings={settings}
          />

          {/* Wind Compass */}
          <WindCompass
            current={weatherData.current}
            theme={theme}
            settings={settings}
          />

          {/* Air Quality */}
          <AirQualityCard
            theme={theme}
            settings={settings}
            latitude={weatherData.location.latitude}
            longitude={weatherData.location.longitude}
          />

          {/* Weekly Summary */}
          <WeeklySummary
            daily={weatherData.daily}
            theme={theme}
            settings={settings}
          />

          {/* Weather Comparison */}
          <WeatherComparison
            currentLocation={weatherData.location}
            currentDaily={weatherData.daily}
            theme={theme}
            settings={settings}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      <LocationSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onLocationSelect={handleLocationSelect}
        theme={theme}
        language={settings.language}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        theme={theme}
      />

      <FavoritesModal
        visible={favoritesVisible}
        onClose={() => setFavoritesVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={weatherData.location}
        theme={theme}
        settings={settings}
      />

      <DayDetailModal
        visible={dayDetailVisible}
        day={selectedDay}
        onClose={() => setDayDetailVisible(false)}
        theme={theme}
        settings={settings}
        convertTemperature={convertTemperature}
        convertWindSpeed={convertWindSpeed}
      />
    </LinearGradient>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <FavoritesProvider>
        <WeatherApp />
      </FavoritesProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  bottomPadding: {
    height: 50,
  },
});
