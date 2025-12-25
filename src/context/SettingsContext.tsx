import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, defaultSettings, TemperatureUnit, WindSpeedUnit, PressureUnit, Language, ThemeMode } from '../types/settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
  convertPressure: (hPa: number) => number;
  getTemperatureSymbol: () => string;
  getWindSpeedSymbol: () => string;
  getPressureSymbol: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@WeatherThen:settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate parsed data
        const validatedSettings: AppSettings = {
          ...defaultSettings,
          temperatureUnit: ['celsius', 'fahrenheit'].includes(parsed.temperatureUnit) 
            ? parsed.temperatureUnit 
            : defaultSettings.temperatureUnit,
          windSpeedUnit: ['kmh', 'mph', 'ms'].includes(parsed.windSpeedUnit)
            ? parsed.windSpeedUnit
            : defaultSettings.windSpeedUnit,
          pressureUnit: ['hPa', 'inHg', 'mmHg'].includes(parsed.pressureUnit)
            ? parsed.pressureUnit
            : defaultSettings.pressureUnit,
          language: ['tr', 'en'].includes(parsed.language)
            ? parsed.language
            : defaultSettings.language,
          themeMode: ['light', 'dark', 'auto'].includes(parsed.themeMode)
            ? parsed.themeMode
            : defaultSettings.themeMode,
          notifications: typeof parsed.notifications === 'boolean'
            ? parsed.notifications
            : defaultSettings.notifications,
          hourFormat24: typeof parsed.hourFormat24 === 'boolean'
            ? parsed.hourFormat24
            : defaultSettings.hourFormat24,
        };
        
        setSettings(validatedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Reset to defaults on error
      setSettings(defaultSettings);
    }
    setIsLoaded(true);
  };

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        // Fire and forget - don't block UI
        AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated)).catch(console.error);
        return updated;
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  // Memoize conversion functions based on settings
  const convertTemperature = useCallback((celsius: number): number => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round((celsius * 9/5) + 32);
    }
    return celsius;
  }, [settings.temperatureUnit]);

  const convertWindSpeed = useCallback((kmh: number): number => {
    switch (settings.windSpeedUnit) {
      case 'mph':
        return Math.round(kmh * 0.621371);
      case 'ms':
        return Math.round(kmh / 3.6 * 10) / 10;
      default:
        return kmh;
    }
  }, [settings.windSpeedUnit]);

  const convertPressure = useCallback((hPa: number): number => {
    switch (settings.pressureUnit) {
      case 'inHg':
        return Math.round(hPa * 0.02953 * 100) / 100;
      case 'mmHg':
        return Math.round(hPa * 0.75006);
      default:
        return hPa;
    }
  }, [settings.pressureUnit]);

  const getTemperatureSymbol = useCallback((): string => {
    return settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  }, [settings.temperatureUnit]);

  const getWindSpeedSymbol = useCallback((): string => {
    switch (settings.windSpeedUnit) {
      case 'mph':
        return 'mph';
      case 'ms':
        return 'm/s';
      default:
        return 'km/h';
    }
  }, [settings.windSpeedUnit]);

  const getPressureSymbol = useCallback((): string => {
    switch (settings.pressureUnit) {
      case 'inHg':
        return 'inHg';
      case 'mmHg':
        return 'mmHg';
      default:
        return 'hPa';
    }
  }, [settings.pressureUnit]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    settings,
    updateSettings,
    convertTemperature,
    convertWindSpeed,
    convertPressure,
    getTemperatureSymbol,
    getWindSpeedSymbol,
    getPressureSymbol,
  }), [settings, updateSettings, convertTemperature, convertWindSpeed, convertPressure, getTemperatureSymbol, getWindSpeedSymbol, getPressureSymbol]);

  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
