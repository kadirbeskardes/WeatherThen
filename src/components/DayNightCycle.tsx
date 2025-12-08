/**
 * Day Night Cycle Component
 * Günün hangi zamanında olduğumuzu gösterir
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { Language } from '../types/settings';

interface DayNightCycleProps {
  sunrise: string;
  sunset: string;
  currentTime: Date;
  theme: ThemeColors;
  language: Language;
}

const DayNightCycleComponent: React.FC<DayNightCycleProps> = ({
  sunrise,
  sunset,
  currentTime,
  theme,
  language,
}) => {
  const cycleInfo = useMemo(() => {
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const now = currentTime;
    
    const isDaytime = now >= sunriseTime && now < sunsetTime;
    
    if (isDaytime) {
      // Gündüz - gün batımına ne kadar kaldı?
      const remaining = Math.floor((sunsetTime.getTime() - now.getTime()) / 60000);
      const hours = Math.floor(remaining / 60);
      const minutes = remaining % 60;
      
      return {
        icon: '☀️',
        label: language === 'tr' ? 'Gün Batımına' : 'Until Sunset',
        time: `${hours}sa ${minutes}dk`,
        gradient: ['#FFB75E', '#ED8F03'],
      };
    } else {
      // Gece - gün doğumuna ne kadar kaldı?
      let nextSunrise = new Date(sunriseTime);
      if (now > sunsetTime) {
        nextSunrise.setDate(nextSunrise.getDate() + 1);
      }
      
      const remaining = Math.floor((nextSunrise.getTime() - now.getTime()) / 60000);
      const hours = Math.floor(remaining / 60);
      const minutes = remaining % 60;
      
      return {
        icon: '🌙',
        label: language === 'tr' ? 'Gün Doğumuna' : 'Until Sunrise',
        time: `${hours}sa ${minutes}dk`,
        gradient: ['#2E3192', '#1BFFFF'],
      };
    }
  }, [sunrise, sunset, currentTime, language]);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{cycleInfo.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {cycleInfo.label}
          </Text>
          <Text style={[styles.time, { color: theme.text }]}>
            {cycleInfo.time}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const DayNightCycle = memo(DayNightCycleComponent);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 2,
  },
  time: {
    fontSize: 20,
    fontWeight: '700',
  },
});
