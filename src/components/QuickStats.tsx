/**
 * Quick Stats Component
 * Hava durumu için hızlı istatistikler gösterir
 */

import React, { memo, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { WeatherData } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface QuickStatsProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
}

interface StatItemProps {
  emoji: string;
  label: string;
  value: string;
  theme: ThemeColors;
  index: number;
  accentColor?: string;
}

const StatItem = memo<StatItemProps>(({ emoji, label, value, theme, index, accentColor }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, bounceAnim, index]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Animated.View style={[styles.statItemWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <BlurView intensity={35} tint={theme.isDark ? 'dark' : 'light'} style={styles.statBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
            style={[styles.statItem, { borderColor: theme.cardBorder }]}
          >
            <Animated.Text style={[styles.statEmoji, { transform: [{ translateY: bounceAnim }] }]}>
              {emoji}
            </Animated.Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {label}
            </Text>
            <Text style={[styles.statValue, { color: accentColor || theme.text }]}>
              {value}
            </Text>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
});

const QuickStatsComponent: React.FC<QuickStatsProps> = ({
  weatherData,
  theme,
  settings,
}) => {
  const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Bugün yağmur yağacak mı?
  const willRainToday = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    return todayHourlyData.some(hour => hour.precipitationProbability > 50);
  }, [weatherData.hourly]);

  // Ortalama nem
  const averageHumidity = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    const humiditySum = todayHourlyData.reduce((accumulator, hour) => accumulator + hour.humidity, 0);
    return Math.round(humiditySum / todayHourlyData.length);
  }, [weatherData.hourly]);

  // Günün en yüksek rüzgar hızı
  const maximumWindSpeed = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    return Math.max(...todayHourlyData.map(hour => hour.windSpeed));
  }, [weatherData.hourly]);

  // En sıcak saat
  const hottestHourOfDay = useMemo(() => {
    const todayHourlyData = weatherData.hourly.slice(0, 24);
    const maxTemperature = Math.max(...todayHourlyData.map(hour => hour.temperature));
    const hottestHourIndex = todayHourlyData.findIndex(hour => hour.temperature === maxTemperature);
    if (hottestHourIndex >= 0) {
      const hourValue = new Date(todayHourlyData[hottestHourIndex].time).getHours();
      return `${hourValue}:00`;
    }
    return '--:--';
  }, [weatherData.hourly]);

  const stats = [
    {
      emoji: willRainToday ? '🌧️' : '☀️',
      label: settings.language === 'tr' ? 'Bugün' : 'Today',
      value: willRainToday
        ? (settings.language === 'tr' ? 'Yağmur Var' : 'Rain Expected')
        : (settings.language === 'tr' ? 'Yağmur Yok' : 'No Rain'),
      accentColor: willRainToday ? '#64B5F6' : '#FFD54F',
    },
    {
      emoji: '💧',
      label: settings.language === 'tr' ? 'Ort. Nem' : 'Avg. Humidity',
      value: `${averageHumidity}%`,
      accentColor: averageHumidity > 70 ? '#64B5F6' : undefined,
    },
    {
      emoji: '💨',
      label: settings.language === 'tr' ? 'Maks. Rüzgar' : 'Max Wind',
      value: `${maximumWindSpeed} km/h`,
      accentColor: maximumWindSpeed > 30 ? '#FF7043' : undefined,
    },
    {
      emoji: '🔥',
      label: settings.language === 'tr' ? 'En Sıcak' : 'Hottest',
      value: hottestHourOfDay,
      accentColor: '#FF7043',
    },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        ⚡ {settings.language === 'tr' ? 'Hızlı Bakış' : 'Quick View'}
      </Text>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            emoji={stat.emoji}
            label={stat.label}
            value={stat.value}
            theme={theme}
            index={index}
            accentColor={stat.accentColor}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export const QuickStats = memo(QuickStatsComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItemWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  statBlur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  statItem: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
