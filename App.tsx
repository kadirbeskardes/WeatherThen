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
  const t = getTranslations(settings.language);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [searchVisible, setSearchVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

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

  const loadWeatherForLocation = useCallback(async (location: LocationData, forceRefresh = false) => {
    try {
      const data = await fetchWeatherData(location.latitude, location.longitude, forceRefresh);
      setWeatherData({
        ...data,
        location,
      });
      setLastUpdated(new Date());
      setError(null);

      // Save location to storage (don't await - fire and forget)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location)).catch(() => {});
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(t.errorWeatherFetch);
    }
  }, [t.errorWeatherFetch]);

  const loadCurrentLocation = useCallback(async () => {
    try {
      // Start location permission request
      const permissionPromise = Location.requestForegroundPermissionsAsync();
      
      // Preload cache in parallel
      const cachePromise = cacheManager.preload();
      
      // Load saved location in parallel
      const savedLocationPromise = AsyncStorage.getItem(STORAGE_KEY);
      
      // Wait for permission
      const { status } = await permissionPromise;
      await cachePromise;
      
      if (status !== 'granted') {
        const savedLocation = await savedLocationPromise;
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

      // Get position with lower accuracy for faster response
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Faster than Balanced
      });

      // Start weather fetch immediately, geocode in parallel
      const weatherPromise = fetchWeatherData(
        position.coords.latitude, 
        position.coords.longitude
      );
      
      const geocodePromise = reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      // Wait for both in parallel
      const [weatherResult, locationName] = await Promise.all([
        weatherPromise,
        geocodePromise,
      ]);

      setWeatherData({
        ...weatherResult,
        location: {
          name: locationName,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
      setLastUpdated(new Date());
      setError(null);

      // Save location (fire and forget)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: locationName,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })).catch(() => {});

    } catch (err) {
      console.error('Location error:', err);
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
    
    // Mark as ready after interactions complete
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, [loadCurrentLocation]);

  useEffect(() => {
    initializeApp();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (weatherData?.location) {
      await loadWeatherForLocation(weatherData.location, true); // Force refresh
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

  const handleSearchClose = useCallback(() => {
    setSearchVisible(false);
  }, []);

  const handleSearchOpen = useCallback(() => {
    setSearchVisible(true);
  }, []);

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
        
        {/* Lazy load animation - only after ready */}
        {isReady && (
          <Suspense fallback={null}>
            <WeatherAnimation condition={condition} isDay={isDay} />
          </Suspense>
        )}
        
        <View style={styles.safeArea}>
          <Header
            onSearchPress={handleSearchOpen}
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

        {searchVisible && (
          <Suspense fallback={null}>
            <LocationSearch
              visible={searchVisible}
              onClose={handleSearchClose}
              onLocationSelect={handleLocationSelect}
              theme={theme}
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
