import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { DailyWeather } from '../types/weather';
import { AppSettings } from '../types/settings';
import { formatTime } from '../utils/weatherUtils';

interface SunPathProps {
  daily: DailyWeather;
  theme: ThemeColors;
  settings: AppSettings;
}

export const SunPath: React.FC<SunPathProps> = ({
  daily,
  theme,
  settings,
}) => {
  const now = new Date();
  const sunrise = new Date(daily.sunrise);
  const sunset = new Date(daily.sunset);
  
  // Calculate sun position (0 = sunrise, 1 = sunset)
  let sunPosition = 0;
  if (now < sunrise) {
    sunPosition = 0;
  } else if (now > sunset) {
    sunPosition = 1;
  } else {
    const totalDaylight = sunset.getTime() - sunrise.getTime();
    const elapsed = now.getTime() - sunrise.getTime();
    sunPosition = elapsed / totalDaylight;
  }
  
  // Calculate daylight duration
  const daylightMs = sunset.getTime() - sunrise.getTime();
  const daylightHours = Math.floor(daylightMs / (1000 * 60 * 60));
  const daylightMinutes = Math.floor((daylightMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const isNight = now < sunrise || now > sunset;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🌞 {settings.language === 'tr' ? 'Güneş Yolu' : 'Sun Path'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Arc path */}
        <View style={styles.arcContainer}>
          <View style={[styles.arc, { borderColor: theme.accent }]} />
          <View style={[styles.horizon, { backgroundColor: theme.secondary }]} />
          
          {/* Sun position */}
          <View
            style={[
              styles.sun,
              {
                left: `${15 + sunPosition * 70}%`,
                bottom: `${Math.sin(sunPosition * Math.PI) * 60 + 10}%`,
              },
            ]}
          >
            <Text style={styles.sunEmoji}>{isNight ? '🌙' : '☀️'}</Text>
          </View>
          
          {/* Sunrise marker */}
          <View style={[styles.marker, styles.sunriseMarker]}>
            <Text style={styles.markerEmoji}>🌅</Text>
          </View>
          
          {/* Sunset marker */}
          <View style={[styles.marker, styles.sunsetMarker]}>
            <Text style={styles.markerEmoji}>🌇</Text>
          </View>
        </View>
        
        {/* Time labels */}
        <View style={styles.timeLabels}>
          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Gün Doğumu' : 'Sunrise'}
            </Text>
            <Text style={[styles.timeValue, { color: theme.text }]}>
              {formatTime(daily.sunrise, settings.language, settings.hourFormat24)}
            </Text>
          </View>
          
          <View style={styles.timeBlock}>
            <Text style={[styles.daylightLabel, { color: theme.accent }]}>
              {daylightHours}{settings.language === 'tr' ? 's' : 'h'} {daylightMinutes}{settings.language === 'tr' ? 'd' : 'm'}
            </Text>
            <Text style={[styles.daylightSubLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'gün ışığı' : 'daylight'}
            </Text>
          </View>
          
          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Gün Batımı' : 'Sunset'}
            </Text>
            <Text style={[styles.timeValue, { color: theme.text }]}>
              {formatTime(daily.sunset, settings.language, settings.hourFormat24)}
            </Text>
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
  arcContainer: {
    height: 100,
    position: 'relative',
    marginBottom: 15,
  },
  arc: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 80,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderWidth: 2,
    borderBottomWidth: 0,
    opacity: 0.5,
  },
  horizon: {
    position: 'absolute',
    bottom: 0,
    left: '5%',
    right: '5%',
    height: 2,
    borderRadius: 1,
  },
  sun: {
    position: 'absolute',
    transform: [{ translateX: -15 }, { translateY: 15 }],
  },
  sunEmoji: {
    fontSize: 30,
  },
  marker: {
    position: 'absolute',
    bottom: -5,
  },
  sunriseMarker: {
    left: '10%',
    transform: [{ translateX: -12 }],
  },
  sunsetMarker: {
    right: '10%',
    transform: [{ translateX: 12 }],
  },
  markerEmoji: {
    fontSize: 24,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  daylightLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  daylightSubLabel: {
    fontSize: 11,
  },
});
