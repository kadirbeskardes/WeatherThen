import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, defaultSettings, TemperatureUnit, WindSpeedUnit, Language, ThemeMode } from '../types/settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
  getTemperatureSymbol: () => string;
  getWindSpeedSymbol: () => string;
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
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const convertTemperature = (celsius: number): number => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round((celsius * 9/5) + 32);
    }
    return celsius;
  };

  const convertWindSpeed = (kmh: number): number => {
    switch (settings.windSpeedUnit) {
      case 'mph':
        return Math.round(kmh * 0.621371);
      case 'ms':
        return Math.round(kmh / 3.6 * 10) / 10;
      default:
        return kmh;
    }
  };

  const getTemperatureSymbol = (): string => {
    return settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  };

  const getWindSpeedSymbol = (): string => {
    switch (settings.windSpeedUnit) {
      case 'mph':
        return 'mph';
      case 'ms':
        return 'm/s';
      default:
        return 'km/s';
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        convertTemperature,
        convertWindSpeed,
        getTemperatureSymbol,
        getWindSpeedSymbol,
      }}
    >
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
