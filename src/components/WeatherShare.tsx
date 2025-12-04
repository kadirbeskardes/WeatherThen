import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { WeatherData } from '../types/weather';
import { getWeatherDescription } from '../utils/weatherUtils';

interface WeatherShareProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
  getTemperatureSymbol: () => string;
}

export const WeatherShare: React.FC<WeatherShareProps> = ({
  weatherData,
  theme,
  settings,
  convertTemperature,
  getTemperatureSymbol,
}) => {
  const handleShare = async () => {
    const temp = convertTemperature(weatherData.current.temperature);
    const feelsLike = convertTemperature(weatherData.current.apparentTemperature);
    const description = getWeatherDescription(weatherData.current.weatherCode, settings.language);
    const symbol = getTemperatureSymbol();
    
    const today = new Date().toLocaleDateString(
      settings.language === 'tr' ? 'tr-TR' : 'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    const messageLines = settings.language === 'tr' 
      ? [
          `🌤️ ${weatherData.location.name} Hava Durumu`,
          `📅 ${today}`,
          ``,
          `🌡️ Sıcaklık: ${temp}${symbol}`,
          `🤔 Hissedilen: ${feelsLike}${symbol}`,
          `☁️ Durum: ${description}`,
          `💧 Nem: %${weatherData.current.humidity}`,
          `💨 Rüzgar: ${weatherData.current.windSpeed} km/s`,
          ``,
          `📱 WeatherThen ile paylaşıldı`,
        ]
      : [
          `🌤️ ${weatherData.location.name} Weather`,
          `📅 ${today}`,
          ``,
          `🌡️ Temperature: ${temp}${symbol}`,
          `🤔 Feels like: ${feelsLike}${symbol}`,
          `☁️ Condition: ${description}`,
          `💧 Humidity: ${weatherData.current.humidity}%`,
          `💨 Wind: ${weatherData.current.windSpeed} km/h`,
          ``,
          `📱 Shared via WeatherThen`,
        ];
    
    try {
      await Share.share({
        message: messageLines.join('\n'),
        title: settings.language === 'tr' ? 'Hava Durumu Paylaş' : 'Share Weather',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.shareButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={handleShare}
        activeOpacity={0.7}
      >
        <Text style={styles.shareIcon}>📤</Text>
        <Text style={[styles.shareText, { color: theme.text }]}>
          {settings.language === 'tr' ? 'Hava Durumunu Paylaş' : 'Share Weather'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  shareIcon: {
    fontSize: 22,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
