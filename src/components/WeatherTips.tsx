import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { WeatherData } from '../types/weather';
import { AppSettings } from '../types/settings';
import { getWeatherCondition } from '../utils/weatherUtils';

interface WeatherTipsProps {
  weather: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
}

interface Tip {
  icon: string;
  textTr: string;
  textEn: string;
  priority: 'high' | 'medium' | 'low';
}

export const WeatherTips: React.FC<WeatherTipsProps> = ({
  weather,
  theme,
  settings,
}) => {
  const tips: Tip[] = [];
  const current = weather.current;
  const today = weather.daily[0];
  const condition = getWeatherCondition(current.weatherCode);
  
  // UV Index tips
  if (current.uvIndex >= 8) {
    tips.push({
      icon: '🧴',
      textTr: 'UV indeksi çok yüksek! Güneş kremi kullanın ve gölgede kalın.',
      textEn: 'UV index is very high! Use sunscreen and stay in shade.',
      priority: 'high',
    });
  } else if (current.uvIndex >= 6) {
    tips.push({
      icon: '😎',
      textTr: 'UV indeksi yüksek. Güneş gözlüğü ve şapka takın.',
      textEn: 'UV index is high. Wear sunglasses and a hat.',
      priority: 'medium',
    });
  }
  
  // Feels like temperature difference tip
  const feelsLikeDiff = Math.abs(current.apparentTemperature - current.temperature);
  if (feelsLikeDiff >= 5) {
    if (current.apparentTemperature > current.temperature) {
      tips.push({
        icon: '🌡️',
        textTr: `Hissedilen sıcaklık ${Math.round(feelsLikeDiff)}° daha yüksek! Nem ve güneş etkisi var.`,
        textEn: `Feels ${Math.round(feelsLikeDiff)}° warmer! Humidity and sun effect.`,
        priority: 'medium',
      });
    } else {
      tips.push({
        icon: '🌬️',
        textTr: `Hissedilen sıcaklık ${Math.round(feelsLikeDiff)}° daha düşük! Rüzgar etkisi var.`,
        textEn: `Feels ${Math.round(feelsLikeDiff)}° colder! Wind chill effect.`,
        priority: 'medium',
      });
    }
  }
  
  // Temperature tips
  const tempC = current.temperature;
  if (tempC >= 35) {
    tips.push({
      icon: '🥵',
      textTr: 'Aşırı sıcak! Bol su için ve klimada kalın.',
      textEn: 'Extreme heat! Stay hydrated and in air conditioning.',
      priority: 'high',
    });
  } else if (tempC >= 30) {
    tips.push({
      icon: '💧',
      textTr: 'Sıcak hava. Bol sıvı tüketin.',
      textEn: 'Hot weather. Drink plenty of fluids.',
      priority: 'medium',
    });
  } else if (tempC <= 0) {
    tips.push({
      icon: '🧣',
      textTr: 'Dondurucu soğuk! Kalın giyinin.',
      textEn: 'Freezing cold! Bundle up warmly.',
      priority: 'high',
    });
  } else if (tempC <= 5) {
    tips.push({
      icon: '🧥',
      textTr: 'Soğuk hava. Mont ve eldiven alın.',
      textEn: 'Cold weather. Take a coat and gloves.',
      priority: 'medium',
    });
  }
  
  // Rain tips
  if (condition === 'rain' || condition === 'drizzle') {
    tips.push({
      icon: '☔',
      textTr: 'Yağmur yağıyor. Şemsiyenizi unutmayın!',
      textEn: 'It\'s raining. Don\'t forget your umbrella!',
      priority: 'high',
    });
  } else if (today.precipitationProbability >= 60) {
    tips.push({
      icon: '🌂',
      textTr: 'Yağmur ihtimali yüksek. Şemsiye alın.',
      textEn: 'High chance of rain. Take an umbrella.',
      priority: 'medium',
    });
  }
  
  // Snow tips
  if (condition === 'snow') {
    tips.push({
      icon: '❄️',
      textTr: 'Kar yağışı var. Dikkatli sürün.',
      textEn: 'It\'s snowing. Drive carefully.',
      priority: 'high',
    });
  }
  
  // Thunderstorm tips
  if (condition === 'thunderstorm') {
    tips.push({
      icon: '⛈️',
      textTr: 'Fırtına var! Mümkünse içeride kalın.',
      textEn: 'Thunderstorm! Stay indoors if possible.',
      priority: 'high',
    });
  }
  
  // Wind tips
  if (current.windSpeed >= 50) {
    tips.push({
      icon: '🌪️',
      textTr: 'Çok şiddetli rüzgar! Dikkatli olun.',
      textEn: 'Very strong winds! Be careful.',
      priority: 'high',
    });
  } else if (current.windSpeed >= 30) {
    tips.push({
      icon: '💨',
      textTr: 'Kuvvetli rüzgar var. Uçan objeler için dikkatli olun.',
      textEn: 'Strong winds. Watch for flying objects.',
      priority: 'medium',
    });
  }
  
  // Visibility tips
  if (current.visibility < 1) {
    tips.push({
      icon: '🌫️',
      textTr: 'Görüş mesafesi çok düşük. Sürüş tehlikeli.',
      textEn: 'Very low visibility. Driving is dangerous.',
      priority: 'high',
    });
  }
  
  // Humidity tips
  if (current.humidity >= 80) {
    tips.push({
      icon: '💦',
      textTr: 'Nem çok yüksek. Bunaltıcı olabilir.',
      textEn: 'Very high humidity. It may feel muggy.',
      priority: 'low',
    });
  }
  
  // Perfect weather tip
  if (tips.length === 0 && tempC >= 18 && tempC <= 28 && condition === 'clear') {
    tips.push({
      icon: '🌈',
      textTr: 'Harika bir gün! Dışarı çıkın ve tadını çıkarın.',
      textEn: 'Beautiful day! Go outside and enjoy it.',
      priority: 'low',
    });
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  if (tips.length === 0) return null;
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return theme.accent;
      default: return theme.textSecondary;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        💡 {settings.language === 'tr' ? 'Öneriler' : 'Tips'}
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tips.map((tip, index) => (
          <View
            key={index}
            style={[
              styles.tipCard,
              { 
                backgroundColor: theme.card, 
                borderColor: getPriorityColor(tip.priority),
                borderLeftWidth: 3,
              },
            ]}
          >
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <Text style={[styles.tipText, { color: theme.text }]} numberOfLines={3}>
              {settings.language === 'tr' ? tip.textTr : tip.textEn}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  tipCard: {
    width: 200,
    padding: 15,
    marginLeft: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
