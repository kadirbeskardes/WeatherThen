import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';

interface AirQualityCardProps {
  theme: ThemeColors;
  settings: AppSettings;
  latitude: number;
  longitude: number;
}

interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
}

// Simulated air quality based on location (in real app, use an API)
const getSimulatedAirQuality = (lat: number, lon: number): AirQualityData => {
  // Use coordinates to generate consistent but varied data
  const seed = Math.abs(Math.sin(lat * lon)) * 100;
  return {
    aqi: Math.floor(30 + (seed % 70)),
    pm25: Math.floor(5 + (seed % 30)),
    pm10: Math.floor(10 + (seed % 50)),
    no2: Math.floor(5 + (seed % 25)),
    o3: Math.floor(20 + (seed % 40)),
  };
};

export const AirQualityCard: React.FC<AirQualityCardProps> = ({
  theme,
  settings,
  latitude,
  longitude,
}) => {
  const airQuality = getSimulatedAirQuality(latitude, longitude);
  
  const getAQILevel = (aqi: number): { label: string; color: string; emoji: string } => {
    const levels = {
      tr: {
        good: 'İyi',
        moderate: 'Orta',
        unhealthySensitive: 'Hassas Gruplar İçin Sağlıksız',
        unhealthy: 'Sağlıksız',
        veryUnhealthy: 'Çok Sağlıksız',
        hazardous: 'Tehlikeli',
      },
      en: {
        good: 'Good',
        moderate: 'Moderate',
        unhealthySensitive: 'Unhealthy for Sensitive',
        unhealthy: 'Unhealthy',
        veryUnhealthy: 'Very Unhealthy',
        hazardous: 'Hazardous',
      },
    };
    const l = levels[settings.language];
    
    if (aqi <= 50) return { label: l.good, color: '#4CAF50', emoji: '😊' };
    if (aqi <= 100) return { label: l.moderate, color: '#FFEB3B', emoji: '😐' };
    if (aqi <= 150) return { label: l.unhealthySensitive, color: '#FF9800', emoji: '😷' };
    if (aqi <= 200) return { label: l.unhealthy, color: '#F44336', emoji: '😨' };
    if (aqi <= 300) return { label: l.veryUnhealthy, color: '#9C27B0', emoji: '🤢' };
    return { label: l.hazardous, color: '#7B1FA2', emoji: '☠️' };
  };
  
  const aqiLevel = getAQILevel(airQuality.aqi);
  const progressWidth = Math.min((airQuality.aqi / 300) * 100, 100);
  
  const pollutants = [
    { name: 'PM2.5', value: airQuality.pm25, unit: 'μg/m³', max: 75 },
    { name: 'PM10', value: airQuality.pm10, unit: 'μg/m³', max: 150 },
    { name: 'NO₂', value: airQuality.no2, unit: 'μg/m³', max: 100 },
    { name: 'O₃', value: airQuality.o3, unit: 'μg/m³', max: 100 },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🌬️ {settings.language === 'tr' ? 'Hava Kalitesi' : 'Air Quality'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Main AQI Display */}
        <View style={styles.mainAqi}>
          <View style={styles.aqiCircle}>
            <Text style={styles.aqiEmoji}>{aqiLevel.emoji}</Text>
            <Text style={[styles.aqiValue, { color: aqiLevel.color }]}>{airQuality.aqi}</Text>
            <Text style={[styles.aqiLabel, { color: theme.textSecondary }]}>AQI</Text>
          </View>
          
          <View style={styles.aqiInfo}>
            <Text style={[styles.aqiStatus, { color: aqiLevel.color }]}>{aqiLevel.label}</Text>
            <Text style={[styles.aqiDescription, { color: theme.textSecondary }]}>
              {settings.language === 'tr' 
                ? airQuality.aqi <= 50 
                  ? 'Dışarıda aktivite yapmak güvenlidir.'
                  : airQuality.aqi <= 100
                    ? 'Hassas gruplar dikkatli olmalıdır.'
                    : 'Dış mekan aktiviteleri sınırlandırılmalıdır.'
                : airQuality.aqi <= 50
                  ? 'Outdoor activities are safe.'
                  : airQuality.aqi <= 100
                    ? 'Sensitive groups should be cautious.'
                    : 'Outdoor activities should be limited.'
              }
            </Text>
            
            {/* Progress bar */}
            <View style={[styles.progressBar, { backgroundColor: theme.secondary }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressWidth}%`,
                    backgroundColor: aqiLevel.color,
                  }
                ]} 
              />
            </View>
          </View>
        </View>
        
        {/* Pollutant details */}
        <View style={styles.pollutantsGrid}>
          {pollutants.map((pollutant, index) => {
            const fillPercent = Math.min((pollutant.value / pollutant.max) * 100, 100);
            const pollutantColor = fillPercent < 50 ? '#4CAF50' : fillPercent < 75 ? '#FF9800' : '#F44336';
            
            return (
              <View key={index} style={styles.pollutantItem}>
                <Text style={[styles.pollutantName, { color: theme.textSecondary }]}>
                  {pollutant.name}
                </Text>
                <Text style={[styles.pollutantValue, { color: theme.text }]}>
                  {pollutant.value}
                </Text>
                <View style={[styles.pollutantBar, { backgroundColor: theme.secondary }]}>
                  <View 
                    style={[
                      styles.pollutantFill, 
                      { 
                        width: `${fillPercent}%`,
                        backgroundColor: pollutantColor,
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
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
  mainAqi: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aqiCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  aqiEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  aqiValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  aqiLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  aqiInfo: {
    flex: 1,
  },
  aqiStatus: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  aqiDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pollutantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  pollutantItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pollutantName: {
    fontSize: 10,
    marginBottom: 3,
  },
  pollutantValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  pollutantBar: {
    width: 30,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  pollutantFill: {
    height: '100%',
    borderRadius: 2,
  },
});
