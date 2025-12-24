import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Platform,
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Header,
  LoadingScreen,
  ErrorScreen,
} from './src/components';

import { TabNavigator } from './src/navigation';
import { WeatherData, GeocodingResult, LocationData } from './src/types/weather';
import { fetchWeatherData, reverseGeocode } from './src/services/weatherApi';
import { getWeatherCondition } from './src/utils/weatherUtils';
import { getThemeColors, getGradientColors } from './src/utils/themeUtils';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { getTranslations } from './src/utils/translations';
import { cacheManager } from './src/utils/cache';

const STORAGE_KEY = '@WeatherThen:lastLocation';

// Lazy load heavy components
const LocationSearch = lazy(() => 
  import('./src/components/LocationSearch').then(module => ({ default: module.LocationSearch }))
);
const WeatherAnimation = lazy(() => 
  import('./src/components/WeatherAnimation').then(module => ({ default: module.WeatherAnimation }))
);

function WeatherApp() {
  const { settings, convertTemperature, convertWindSpeed, getTemperatureSymbol, getWindSpeedSymbol } = useSettings();
  const translations = getTranslations(settings.language);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | undefined>();
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // Calculate theme values - all hooks must be called unconditionally
  const weatherCondition = useMemo(() => {
    if (!weatherData) return 'clear' as const;
    return getWeatherCondition(weatherData.current.weatherCode);
  }, [weatherData]);
  
  const isDaytime = useMemo(() => {
    if (settings.themeMode === 'light') return true;
    if (settings.themeMode === 'dark') return false;
    return weatherData?.current.isDay ?? true;
  }, [settings.themeMode, weatherData?.current?.isDay]);
  
  const currentTheme = useMemo(() => getThemeColors(weatherCondition, isDaytime), [weatherCondition, isDaytime]);
  const backgroundGradientColors = useMemo(() => getGradientColors(weatherCondition, isDaytime), [weatherCondition, isDaytime]);

  const loadWeatherForLocation = useCallback(async (location: LocationData, forceRefresh = false) => {
    try {
      const fetchedWeatherData = await fetchWeatherData(location.latitude, location.longitude, forceRefresh);
      setWeatherData({
        ...fetchedWeatherData,
        location,
      });
      setLastUpdatedTime(new Date());
      setErrorMessage(null);

      // Save location to storage (don't await - fire and forget)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location)).catch(() => {});
    } catch (err) {
      console.error('Weather fetch error:', err);
      setErrorMessage(translations.errorWeatherFetch);
    }
  }, [translations.errorWeatherFetch]);

  const loadCurrentLocation = useCallback(async () => {
    try {
      // Start location permission request
      const locationPermissionPromise = Location.requestForegroundPermissionsAsync();
      
      // Preload cache in parallel
      const cachePreloadPromise = cacheManager.preload();
      
      // Load saved location in parallel
      const savedLocationDataPromise = AsyncStorage.getItem(STORAGE_KEY);
      
      // Wait for permission
      const { status: permissionStatus } = await locationPermissionPromise;
      await cachePreloadPromise;
      
      if (permissionStatus !== 'granted') {
        const savedLocationData = await savedLocationDataPromise;
        if (savedLocationData) {
          const parsedLocation = JSON.parse(savedLocationData);
          await loadWeatherForLocation(parsedLocation);
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

      // Get position with lower accuracy for faster response
      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Faster than Balanced
      });

      // Start weather fetch immediately, geocode in parallel
      const weatherDataPromise = fetchWeatherData(
        currentPosition.coords.latitude, 
        currentPosition.coords.longitude
      );
      
      const reverseGeocodePromise = reverseGeocode(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude
      );

      // Wait for both in parallel
      const [fetchedWeatherResult, resolvedLocationName] = await Promise.all([
        weatherDataPromise,
        reverseGeocodePromise,
      ]);

      setWeatherData({
        ...fetchedWeatherResult,
        location: {
          name: resolvedLocationName,
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        },
      });
      setLastUpdatedTime(new Date());
      setErrorMessage(null);

      // Save location (fire and forget)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: resolvedLocationName,
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      })).catch(() => {});

    } catch (err) {
      console.error('Location error:', err);
      const savedLocationData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLocationData) {
        const parsedLocation = JSON.parse(savedLocationData);
        await loadWeatherForLocation(parsedLocation);
      } else {
        setErrorMessage(translations.errorLocation);
      }
    }
  }, [loadWeatherForLocation, translations.errorLocation]);

  const initializeApp = useCallback(async () => {
    setIsLoading(true);
    await loadCurrentLocation();
    setIsLoading(false);
    
    // Mark as ready after interactions complete
    InteractionManager.runAfterInteractions(() => {
      setIsAppReady(true);
    });
  }, [loadCurrentLocation]);

  useEffect(() => {
    initializeApp();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (weatherData?.location) {
      await loadWeatherForLocation(weatherData.location, true); // Force refresh
    } else {
      await loadCurrentLocation();
    }
    setIsRefreshing(false);
  }, [weatherData?.location, loadWeatherForLocation, loadCurrentLocation]);

  const handleLocationSelect = useCallback(async (location: GeocodingResult | LocationData) => {
    setIsLoading(true);
    await loadWeatherForLocation({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      admin1: location.admin1,
    });
    setIsLoading(false);
  }, [loadWeatherForLocation]);

  const handleCurrentLocationButtonPress = useCallback(async () => {
    setIsLoading(true);
    await loadCurrentLocation();
    setIsLoading(false);
  }, [loadCurrentLocation]);

  const handleSearchModalClose = useCallback(() => {
    setIsSearchModalVisible(false);
  }, []);

  const handleSearchModalOpen = useCallback(() => {
    setIsSearchModalVisible(true);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (errorMessage && !weatherData) {
    return <ErrorScreen message={errorMessage} onRetry={initializeApp} />;
  }

  if (!weatherData) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <LinearGradient colors={backgroundGradientColors as any} style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        
        {/* Lazy load animation - only after ready */}
        {isAppReady && (
          <Suspense fallback={null}>
            <WeatherAnimation condition={weatherCondition} isDay={isDaytime} />
          </Suspense>
        )}
        
        <View style={styles.safeArea}>
          <Header
            onSearchPress={handleSearchModalOpen}
            onLocationPress={handleCurrentLocationButtonPress}
            theme={currentTheme}
            lastUpdated={lastUpdatedTime}
            language={settings.language}
          />

          <TabNavigator
            weatherData={weatherData}
            theme={currentTheme}
            settings={settings}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onLocationSelect={handleLocationSelect}
            convertTemperature={convertTemperature}
            convertWindSpeed={convertWindSpeed}
            getTemperatureSymbol={getTemperatureSymbol}
            getWindSpeedSymbol={getWindSpeedSymbol}
          />
        </View>

        {isSearchModalVisible && (
          <Suspense fallback={null}>
            <LocationSearch
              visible={isSearchModalVisible}
              onClose={handleSearchModalClose}
              onLocationSelect={handleLocationSelect}
              theme={currentTheme}
              language={settings.language}
            />
          </Suspense>
        )}
      </LinearGradient>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PremiumProvider>
          <FavoritesProvider>
            <WeatherApp />
          </FavoritesProvider>
        </PremiumProvider>
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
