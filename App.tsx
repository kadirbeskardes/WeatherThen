import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  LocationSearch,
  Header,
  LoadingScreen,
  ErrorScreen,
  WeatherAnimation,
} from './src/components';

import { TabNavigator } from './src/navigation';
import { useFavorites } from './src/context/FavoritesContext';
import { WeatherData, GeocodingResult, LocationData } from './src/types/weather';
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

  // Calculate theme values - all hooks must be called unconditionally
  const condition = useMemo(() => {
    if (!weatherData) return 'clear' as const;
    return getWeatherCondition(weatherData.current.weatherCode);
  }, [weatherData]);
  
  const isDay = useMemo(() => {
    if (settings.themeMode === 'light') return true;
    if (settings.themeMode === 'dark') return false;
    return weatherData?.current.isDay ?? true;
  }, [settings.themeMode, weatherData?.current?.isDay]);
  
  const theme = useMemo(() => getThemeColors(condition, isDay), [condition, isDay]);
  const gradientColors = useMemo(() => getGradientColors(condition, isDay), [condition, isDay]);

  const loadWeatherForLocation = useCallback(async (location: LocationData) => {
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
  }, [t.errorWeatherFetch]);

  const loadCurrentLocation = useCallback(async () => {
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
  }, [loadWeatherForLocation, t.errorLocation]);

  const initializeApp = useCallback(async () => {
    setLoading(true);
    await loadCurrentLocation();
    setLoading(false);
  }, [loadCurrentLocation]);

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
  }, [weatherData?.location, loadWeatherForLocation, loadCurrentLocation]);

  const handleLocationSelect = useCallback(async (location: GeocodingResult | LocationData) => {
    setLoading(true);
    await loadWeatherForLocation({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      admin1: location.admin1,
    });
    setLoading(false);
  }, [loadWeatherForLocation]);

  const handleLocationButtonPress = useCallback(async () => {
    setLoading(true);
    await loadCurrentLocation();
    setLoading(false);
  }, [loadCurrentLocation]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !weatherData) {
    return <ErrorScreen message={error} onRetry={initializeApp} />;
  }

  if (!weatherData) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
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
            theme={theme}
            lastUpdated={lastUpdated}
            language={settings.language}
          />

          <TabNavigator
            weatherData={weatherData}
            theme={theme}
            settings={settings}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onLocationSelect={handleLocationSelect}
            convertTemperature={convertTemperature}
            convertWindSpeed={convertWindSpeed}
            getTemperatureSymbol={getTemperatureSymbol}
            getWindSpeedSymbol={getWindSpeedSymbol}
          />
        </View>

        <LocationSearch
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
          onLocationSelect={handleLocationSelect}
          theme={theme}
          language={settings.language}
        />
      </LinearGradient>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <WeatherApp />
        </FavoritesProvider>
      </SettingsProvider>
    </SafeAreaProvider>
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
});
