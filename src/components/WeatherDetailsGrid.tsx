import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { CurrentWeather } from '../types/weather';
import { AppSettings } from '../types/settings';

interface WeatherDetailsGridProps {
  current: CurrentWeather;
  theme: ThemeColors;
  settings: AppSettings;
}

interface DetailItem {
  icon: string;
  labelTr: string;
  labelEn: string;
  value: string;
  subValue?: string;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  current,
  theme,
  settings,
}) => {
  const getFeelsLikeText = (): string => {
    const feels = settings.temperatureUnit === 'fahrenheit'
      ? Math.round(current.apparentTemperature * 9/5 + 32)
      : Math.round(current.apparentTemperature);
    const unit = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    return `${feels}${unit}`;
  };

  const getPressureTrend = (): string => {
    // Simplified pressure trend logic
    if (current.pressure > 1020) {
      return settings.language === 'tr' ? '↑ Yüksek' : '↑ High';
    } else if (current.pressure < 1000) {
      return settings.language === 'tr' ? '↓ Düşük' : '↓ Low';
    }
    return settings.language === 'tr' ? '→ Normal' : '→ Normal';
  };

  const getVisibilityText = (): string => {
    const km = current.visibility / 1000;
    if (km >= 10) {
      return settings.language === 'tr' ? 'Mükemmel' : 'Excellent';
    } else if (km >= 5) {
      return settings.language === 'tr' ? 'İyi' : 'Good';
    } else if (km >= 2) {
      return settings.language === 'tr' ? 'Orta' : 'Moderate';
    } else if (km >= 1) {
      return settings.language === 'tr' ? 'Zayıf' : 'Poor';
    }
    return settings.language === 'tr' ? 'Çok Zayıf' : 'Very Poor';
  };

  const getCloudCoverDescription = (): string => {
    const cover = current.cloudCover;
    if (cover < 10) {
      return settings.language === 'tr' ? 'Açık' : 'Clear';
    } else if (cover < 30) {
      return settings.language === 'tr' ? 'Az Bulutlu' : 'Few Clouds';
    } else if (cover < 60) {
      return settings.language === 'tr' ? 'Parçalı Bulutlu' : 'Scattered';
    } else if (cover < 90) {
      return settings.language === 'tr' ? 'Çok Bulutlu' : 'Broken';
    }
    return settings.language === 'tr' ? 'Kapalı' : 'Overcast';
  };

  const details: DetailItem[] = [
    {
      icon: '🌡️',
      labelTr: 'Hissedilen',
      labelEn: 'Feels Like',
      value: getFeelsLikeText(),
    },
    {
      icon: '💧',
      labelTr: 'Nem',
      labelEn: 'Humidity',
      value: `${current.humidity}%`,
      subValue: current.humidity > 70 
        ? (settings.language === 'tr' ? 'Yüksek' : 'High')
        : current.humidity < 30 
          ? (settings.language === 'tr' ? 'Düşük' : 'Low')
          : (settings.language === 'tr' ? 'Normal' : 'Normal'),
    },
    {
      icon: '🔵',
      labelTr: 'Basınç',
      labelEn: 'Pressure',
      value: `${Math.round(current.pressure)} hPa`,
      subValue: getPressureTrend(),
    },
    {
      icon: '👁️',
      labelTr: 'Görüş',
      labelEn: 'Visibility',
      value: `${(current.visibility / 1000).toFixed(1)} km`,
      subValue: getVisibilityText(),
    },
    {
      icon: '☁️',
      labelTr: 'Bulut',
      labelEn: 'Cloud Cover',
      value: `${current.cloudCover}%`,
      subValue: getCloudCoverDescription(),
    },
    {
      icon: '☀️',
      labelTr: 'UV İndeksi',
      labelEn: 'UV Index',
      value: `${current.uvIndex.toFixed(1)}`,
      subValue: current.uvIndex <= 2 
        ? (settings.language === 'tr' ? 'Düşük' : 'Low')
        : current.uvIndex <= 5 
          ? (settings.language === 'tr' ? 'Orta' : 'Moderate')
          : current.uvIndex <= 7 
            ? (settings.language === 'tr' ? 'Yüksek' : 'High')
            : current.uvIndex <= 10 
              ? (settings.language === 'tr' ? 'Çok Yüksek' : 'Very High')
              : (settings.language === 'tr' ? 'Aşırı' : 'Extreme'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        📊 {settings.language === 'tr' ? 'Detaylar' : 'Details'}
      </Text>
      
      <View style={styles.grid}>
        {details.map((item, index) => (
          <View
            key={index}
            style={[
              styles.gridItem,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? item.labelTr : item.labelEn}
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {item.value}
            </Text>
            {item.subValue && (
              <Text style={[styles.subValue, { color: theme.accent }]}>
                {item.subValue}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '30%',
    marginHorizontal: '1.66%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  subValue: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
