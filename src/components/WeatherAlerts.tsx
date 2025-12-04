import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { WeatherData } from '../types/weather';

interface WeatherAlertsProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  icon: string;
  title: string;
  description: string;
}

const generateAlerts = (weatherData: WeatherData, language: 'tr' | 'en'): Alert[] => {
  const alerts: Alert[] = [];
  const current = weatherData.current;
  const today = weatherData.daily[0];
  const tomorrow = weatherData.daily[1];
  
  // UV Alert
  if (current.uvIndex >= 8) {
    alerts.push({
      id: 'uv-extreme',
      type: 'danger',
      icon: '☀️',
      title: language === 'tr' ? 'Aşırı UV Radyasyonu' : 'Extreme UV Radiation',
      description: language === 'tr' 
        ? 'UV indeksi çok yüksek! Dışarı çıkarken güneş kremi kullanın ve gözlerinizi koruyun.'
        : 'UV index is very high! Use sunscreen and protect your eyes when going outside.',
    });
  } else if (current.uvIndex >= 6) {
    alerts.push({
      id: 'uv-high',
      type: 'warning',
      icon: '🕶️',
      title: language === 'tr' ? 'Yüksek UV' : 'High UV',
      description: language === 'tr'
        ? 'UV indeksi yüksek. Öğle saatlerinde gölgede kalmaya çalışın.'
        : 'UV index is high. Try to stay in shade during midday.',
    });
  }
  
  // Wind Alert
  if (current.windSpeed >= 50) {
    alerts.push({
      id: 'wind-strong',
      type: 'danger',
      icon: '💨',
      title: language === 'tr' ? 'Çok Kuvvetli Rüzgar' : 'Very Strong Wind',
      description: language === 'tr'
        ? `Rüzgar hızı ${current.windSpeed} km/s! Dışarıda dikkatli olun.`
        : `Wind speed is ${current.windSpeed} km/h! Be careful outside.`,
    });
  } else if (current.windSpeed >= 30) {
    alerts.push({
      id: 'wind-moderate',
      type: 'warning',
      icon: '🌬️',
      title: language === 'tr' ? 'Kuvvetli Rüzgar' : 'Strong Wind',
      description: language === 'tr'
        ? 'Rüzgar kuvvetli esiyor. Hafif eşyalarınızı sabitleyin.'
        : 'Wind is blowing strongly. Secure light objects.',
    });
  }
  
  // Rain Alert
  const rainComing = weatherData.hourly.slice(0, 6).some(h => 
    [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(h.weatherCode)
  );
  if (rainComing) {
    const rainHour = weatherData.hourly.slice(0, 6).find(h =>
      [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(h.weatherCode)
    );
    if (rainHour) {
      const time = new Date(rainHour.time);
      const hourStr = time.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      alerts.push({
        id: 'rain-coming',
        type: 'info',
        icon: '🌧️',
        title: language === 'tr' ? 'Yağmur Bekleniyor' : 'Rain Expected',
        description: language === 'tr'
          ? `Yaklaşık ${hourStr} civarında yağmur bekleniyor. Şemsiye almayı unutmayın!`
          : `Rain is expected around ${hourStr}. Don't forget your umbrella!`,
      });
    }
  }
  
  // Temperature Drop Alert
  if (tomorrow && today.temperatureMax - tomorrow.temperatureMax >= 8) {
    alerts.push({
      id: 'temp-drop',
      type: 'warning',
      icon: '🌡️',
      title: language === 'tr' ? 'Sıcaklık Düşüşü' : 'Temperature Drop',
      description: language === 'tr'
        ? `Yarın sıcaklıklar ${today.temperatureMax - tomorrow.temperatureMax}° düşecek. Kalın giyinin!`
        : `Temperatures will drop by ${today.temperatureMax - tomorrow.temperatureMax}° tomorrow. Dress warmly!`,
    });
  }
  
  // Temperature Rise Alert
  if (tomorrow && tomorrow.temperatureMax - today.temperatureMax >= 8) {
    alerts.push({
      id: 'temp-rise',
      type: 'info',
      icon: '🔥',
      title: language === 'tr' ? 'Sıcaklık Artışı' : 'Temperature Rise',
      description: language === 'tr'
        ? `Yarın sıcaklıklar ${tomorrow.temperatureMax - today.temperatureMax}° artacak.`
        : `Temperatures will rise by ${tomorrow.temperatureMax - today.temperatureMax}° tomorrow.`,
    });
  }
  
  // Fog Alert
  if ([45, 48].includes(current.weatherCode)) {
    alerts.push({
      id: 'fog',
      type: 'warning',
      icon: '🌫️',
      title: language === 'tr' ? 'Sisli Hava' : 'Foggy Weather',
      description: language === 'tr'
        ? 'Görüş mesafesi düşük. Araç kullanırken dikkatli olun.'
        : 'Visibility is low. Be careful when driving.',
    });
  }
  
  // Snow Alert
  if ([71, 73, 75, 77, 85, 86].includes(current.weatherCode)) {
    alerts.push({
      id: 'snow',
      type: 'warning',
      icon: '❄️',
      title: language === 'tr' ? 'Kar Yağışı' : 'Snowfall',
      description: language === 'tr'
        ? 'Kar yağışı var. Yollar kaygan olabilir.'
        : 'It is snowing. Roads may be slippery.',
    });
  }
  
  // Thunderstorm Alert
  if ([95, 96, 99].includes(current.weatherCode)) {
    alerts.push({
      id: 'thunder',
      type: 'danger',
      icon: '⛈️',
      title: language === 'tr' ? 'Gök Gürültülü Fırtına' : 'Thunderstorm',
      description: language === 'tr'
        ? 'Şiddetli fırtına var! Açık alanlardan uzak durun.'
        : 'Severe storm! Stay away from open areas.',
    });
  }
  
  // Low Visibility
  if (current.visibility < 1) {
    alerts.push({
      id: 'low-visibility',
      type: 'danger',
      icon: '👁️',
      title: language === 'tr' ? 'Çok Düşük Görüş' : 'Very Low Visibility',
      description: language === 'tr'
        ? `Görüş mesafesi ${current.visibility} km. Seyahat etmekten kaçının.`
        : `Visibility is ${current.visibility} km. Avoid traveling.`,
    });
  }

  return alerts;
};

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({
  weatherData,
  theme,
  settings,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  const alerts = generateAlerts(weatherData, settings.language)
    .filter(alert => !dismissedAlerts.includes(alert.id));
  
  if (alerts.length === 0) {
    return null;
  }
  
  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return { bg: 'rgba(244, 67, 54, 0.15)', border: '#F44336' };
      case 'warning':
        return { bg: 'rgba(255, 152, 0, 0.15)', border: '#FF9800' };
      default:
        return { bg: 'rgba(33, 150, 243, 0.15)', border: '#2196F3' };
    }
  };
  
  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        ⚠️ {settings.language === 'tr' ? 'Hava Uyarıları' : 'Weather Alerts'}
      </Text>
      
      {alerts.map((alert) => {
        const colors = getAlertColors(alert.type);
        return (
          <View 
            key={alert.id}
            style={[
              styles.alertCard,
              { 
                backgroundColor: colors.bg,
                borderLeftColor: colors.border,
              }
            ]}
          >
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>{alert.icon}</Text>
                <Text style={[styles.alertTitle, { color: theme.text }]}>
                  {alert.title}
                </Text>
              </View>
              <Text style={[styles.alertDescription, { color: theme.textSecondary }]}>
                {alert.description}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={() => dismissAlert(alert.id)}
            >
              <Text style={[styles.dismissText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 26,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
