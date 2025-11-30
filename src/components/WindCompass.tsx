import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { CurrentWeather } from '../types/weather';
import { AppSettings, WindSpeedUnit } from '../types/settings';

interface WindCompassProps {
  current: CurrentWeather;
  theme: ThemeColors;
  settings: AppSettings;
}

export const WindCompass: React.FC<WindCompassProps> = ({
  current,
  theme,
  settings,
}) => {
  const windDirection = current.windDirection;
  const windSpeed = current.windSpeed;
  const gustSpeed = current.gustSpeed;
  
  // Convert wind speed based on settings
  const convertWindSpeed = (speed: number): string => {
    switch (settings.windSpeedUnit) {
      case 'mph':
        return (speed * 0.621371).toFixed(1);
      case 'ms':
        return (speed / 3.6).toFixed(1);
      default:
        return speed.toFixed(1);
    }
  };
  
  const getWindSpeedLabel = (unit: WindSpeedUnit): string => {
    switch (unit) {
      case 'mph': return 'mph';
      case 'ms': return 'm/s';
      default: return 'km/h';
    }
  };
  
  const getBeaufortScale = (speedKmh: number): { level: number; description: string } => {
    const descriptions = settings.language === 'tr'
      ? ['Sakin', 'Hafif', 'Hafif', 'Orta', 'Orta', 'Taze', 'Kuvvetli', 'Sert', 'Fırtına', 'Şiddetli', 'Fırtına', 'Şiddetli', 'Kasırga']
      : ['Calm', 'Light', 'Light', 'Gentle', 'Moderate', 'Fresh', 'Strong', 'Near Gale', 'Gale', 'Strong Gale', 'Storm', 'Violent', 'Hurricane'];
    
    if (speedKmh < 1) return { level: 0, description: descriptions[0] };
    if (speedKmh < 6) return { level: 1, description: descriptions[1] };
    if (speedKmh < 12) return { level: 2, description: descriptions[2] };
    if (speedKmh < 20) return { level: 3, description: descriptions[3] };
    if (speedKmh < 29) return { level: 4, description: descriptions[4] };
    if (speedKmh < 39) return { level: 5, description: descriptions[5] };
    if (speedKmh < 50) return { level: 6, description: descriptions[6] };
    if (speedKmh < 62) return { level: 7, description: descriptions[7] };
    if (speedKmh < 75) return { level: 8, description: descriptions[8] };
    if (speedKmh < 89) return { level: 9, description: descriptions[9] };
    if (speedKmh < 103) return { level: 10, description: descriptions[10] };
    if (speedKmh < 118) return { level: 11, description: descriptions[11] };
    return { level: 12, description: descriptions[12] };
  };
  
  const getWindDirectionText = (degrees: number): string => {
    const directionsTr = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
    const directionsEn = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const directions = settings.language === 'tr' ? directionsTr : directionsEn;
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };
  
  const beaufort = getBeaufortScale(windSpeed);
  const directionText = getWindDirectionText(windDirection);
  
  // Compass points
  const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const compassPointsTr = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  const points = settings.language === 'tr' ? compassPointsTr : compassPoints;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        💨 {settings.language === 'tr' ? 'Rüzgar' : 'Wind'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.content}>
          {/* Compass */}
          <View style={styles.compassContainer}>
            <View style={[styles.compass, { borderColor: theme.accent }]}>
              {/* Compass points */}
              {points.map((point, index) => {
                const angle = index * 45;
                const radian = (angle - 90) * (Math.PI / 180);
                const radius = 40;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                
                return (
                  <Text
                    key={point}
                    style={[
                      styles.compassPoint,
                      {
                        color: index === 0 ? theme.accent : theme.textSecondary,
                        transform: [{ translateX: x }, { translateY: y }],
                      },
                    ]}
                  >
                    {point}
                  </Text>
                );
              })}
              
              {/* Wind direction arrow */}
              <View
                style={[
                  styles.arrowContainer,
                  { transform: [{ rotate: `${windDirection}deg` }] },
                ]}
              >
                <View style={[styles.arrow, { borderBottomColor: theme.accent }]} />
                <View style={[styles.arrowTail, { backgroundColor: theme.accent }]} />
              </View>
              
              {/* Center circle */}
              <View style={[styles.centerCircle, { backgroundColor: theme.card }]}>
                <Text style={[styles.directionText, { color: theme.text }]}>
                  {directionText}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Wind info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                {settings.language === 'tr' ? 'Hız' : 'Speed'}
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {convertWindSpeed(windSpeed)} {getWindSpeedLabel(settings.windSpeedUnit)}
              </Text>
            </View>
            
            {gustSpeed > windSpeed && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  {settings.language === 'tr' ? 'Rüzgar Hızı' : 'Gusts'}
                </Text>
                <Text style={[styles.infoValue, { color: theme.accent }]}>
                  {convertWindSpeed(gustSpeed)} {getWindSpeedLabel(settings.windSpeedUnit)}
                </Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                {settings.language === 'tr' ? 'Yön' : 'Direction'}
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {windDirection}°
              </Text>
            </View>
            
            <View style={[styles.beaufortBadge, { backgroundColor: theme.accent + '30' }]}>
              <Text style={[styles.beaufortLevel, { color: theme.accent }]}>
                {settings.language === 'tr' ? 'Seviye' : 'Level'} {beaufort.level}
              </Text>
              <Text style={[styles.beaufortDesc, { color: theme.text }]}>
                {beaufort.description}
              </Text>
            </View>
          </View>
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
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compassContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassPoint: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
  },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -5,
  },
  arrowTail: {
    width: 3,
    height: 15,
    borderRadius: 1.5,
  },
  centerCircle: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  beaufortBadge: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  beaufortLevel: {
    fontSize: 12,
    fontWeight: '700',
  },
  beaufortDesc: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});
