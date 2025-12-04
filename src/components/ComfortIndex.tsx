import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { HourlyWeather } from '../types/weather';

interface ComfortIndexProps {
  hourlyData: HourlyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
}

interface HourComfort {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  comfortScore: number;
  comfortLevel: 'excellent' | 'good' | 'moderate' | 'poor' | 'bad';
}

const calculateComfortIndex = (temp: number, humidity: number, windSpeed: number): number => {
  // Thermal comfort calculation based on temperature, humidity, and wind
  // Ideal: 20-25°C, 40-60% humidity, light breeze
  
  let score = 100;
  
  // Temperature factor (ideal: 22°C)
  const tempDiff = Math.abs(temp - 22);
  score -= tempDiff * 4;
  
  // Humidity factor (ideal: 50%)
  const humidityDiff = Math.abs(humidity - 50);
  score -= humidityDiff * 0.5;
  
  // Wind factor (ideal: 5-15 km/h)
  if (windSpeed < 5) {
    score -= (5 - windSpeed) * 2;
  } else if (windSpeed > 15) {
    score -= (windSpeed - 15) * 1.5;
  }
  
  // Heat index effect (high temp + high humidity)
  if (temp > 27 && humidity > 60) {
    score -= (temp - 27) * (humidity - 60) * 0.1;
  }
  
  // Wind chill effect (low temp + high wind)
  if (temp < 10 && windSpeed > 20) {
    score -= (10 - temp) * (windSpeed - 20) * 0.15;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const getComfortLevel = (score: number): HourComfort['comfortLevel'] => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'poor';
  return 'bad';
};

const getComfortInfo = (level: HourComfort['comfortLevel'], language: 'tr' | 'en') => {
  const info = {
    excellent: {
      tr: { label: 'Mükemmel', color: '#4CAF50', emoji: '😄' },
      en: { label: 'Excellent', color: '#4CAF50', emoji: '😄' },
    },
    good: {
      tr: { label: 'İyi', color: '#8BC34A', emoji: '🙂' },
      en: { label: 'Good', color: '#8BC34A', emoji: '🙂' },
    },
    moderate: {
      tr: { label: 'Orta', color: '#FFC107', emoji: '😐' },
      en: { label: 'Moderate', color: '#FFC107', emoji: '😐' },
    },
    poor: {
      tr: { label: 'Zayıf', color: '#FF9800', emoji: '😕' },
      en: { label: 'Poor', color: '#FF9800', emoji: '😕' },
    },
    bad: {
      tr: { label: 'Kötü', color: '#F44336', emoji: '😣' },
      en: { label: 'Bad', color: '#F44336', emoji: '😣' },
    },
  };
  return info[level][language];
};

export const ComfortIndex: React.FC<ComfortIndexProps> = ({
  hourlyData,
  theme,
  settings,
}) => {
  // Calculate comfort for next 12 hours
  const hourlyComfort: HourComfort[] = hourlyData.slice(0, 12).map((hour) => {
    const score = calculateComfortIndex(hour.temperature, hour.humidity, hour.windSpeed);
    return {
      time: hour.time,
      temperature: hour.temperature,
      humidity: hour.humidity,
      windSpeed: hour.windSpeed,
      comfortScore: score,
      comfortLevel: getComfortLevel(score),
    };
  });
  
  // Find best time
  const bestHour = hourlyComfort.reduce((best, current) => 
    current.comfortScore > best.comfortScore ? current : best
  );
  
  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    if (settings.hourFormat24) {
      return date.toLocaleTimeString(settings.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return date.toLocaleTimeString(settings.language === 'tr' ? 'tr-TR' : 'en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };
  
  // Current comfort
  const currentComfort = hourlyComfort[0];
  const currentInfo = getComfortInfo(currentComfort.comfortLevel, settings.language);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🌡️ {settings.language === 'tr' ? 'Konfor İndeksi' : 'Comfort Index'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Current comfort */}
        <View style={styles.currentComfort}>
          <View style={[styles.scoreCircle, { borderColor: currentInfo.color }]}>
            <Text style={styles.scoreEmoji}>{currentInfo.emoji}</Text>
            <Text style={[styles.scoreValue, { color: currentInfo.color }]}>
              {currentComfort.comfortScore}
            </Text>
          </View>
          
          <View style={styles.currentInfo}>
            <Text style={[styles.currentLabel, { color: currentInfo.color }]}>
              {currentInfo.label}
            </Text>
            <Text style={[styles.currentDesc, { color: theme.textSecondary }]}>
              {settings.language === 'tr' 
                ? 'Dış mekan aktiviteleri için konfor seviyesi'
                : 'Comfort level for outdoor activities'
              }
            </Text>
          </View>
        </View>
        
        {/* Best time suggestion */}
        {bestHour.comfortScore > currentComfort.comfortScore && (
          <View style={[styles.suggestion, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
            <Text style={styles.suggestionIcon}>💡</Text>
            <Text style={[styles.suggestionText, { color: theme.text }]}>
              {settings.language === 'tr'
                ? `En iyi zaman: ${formatTime(bestHour.time)} (Skor: ${bestHour.comfortScore})`
                : `Best time: ${formatTime(bestHour.time)} (Score: ${bestHour.comfortScore})`
              }
            </Text>
          </View>
        )}
        
        {/* Hourly comfort timeline */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timeline}
        >
          {hourlyComfort.map((hour, index) => {
            const info = getComfortInfo(hour.comfortLevel, settings.language);
            return (
              <View key={index} style={styles.timelineItem}>
                <Text style={[styles.timelineTime, { color: theme.textSecondary }]}>
                  {index === 0 
                    ? (settings.language === 'tr' ? 'Şimdi' : 'Now')
                    : formatTime(hour.time)
                  }
                </Text>
                <View style={[styles.timelineBar, { backgroundColor: theme.secondary }]}>
                  <View 
                    style={[
                      styles.timelineBarFill,
                      { 
                        height: `${hour.comfortScore}%`,
                        backgroundColor: info.color,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.timelineEmoji}>{info.emoji}</Text>
              </View>
            );
          })}
        </ScrollView>
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  currentComfort: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreEmoji: {
    fontSize: 20,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  currentInfo: {
    flex: 1,
  },
  currentLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  currentDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 45,
  },
  timelineTime: {
    fontSize: 10,
    marginBottom: 6,
  },
  timelineBar: {
    width: 20,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  timelineBarFill: {
    width: '100%',
    borderRadius: 10,
  },
  timelineEmoji: {
    fontSize: 14,
    marginTop: 6,
  },
});
