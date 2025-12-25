export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg';
export type Language = 'tr' | 'en';
export type ThemeMode = 'auto' | 'light' | 'dark';

export interface AppSettings {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  language: Language;
  themeMode: ThemeMode;
  notifications: boolean;
  hourFormat24: boolean;
}

export const defaultSettings: AppSettings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hPa',
  language: 'tr',
  themeMode: 'auto',
  notifications: true,
  hourFormat24: true,
};
