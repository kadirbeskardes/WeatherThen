import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { HourlyWeather } from '../types/weather';
import { getWeatherIcon, formatHour } from '../utils/weatherUtils';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface HourlyForecastProps {
  hourlyData: HourlyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
}

interface HourCardProps {
  hour: HourlyWeather;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
  isNow?: boolean;
  index?: number;
}

// Memoized hour card component
const HourCard = memo<HourCardProps>(({ hour, theme, settings, convertTemperature, isNow, index = 0 }) => {
  const displayTemperature = useMemo(() => convertTemperature(hour.temperature), [hour.temperature, convertTemperature]);
  const weatherIcon = useMemo(() => getWeatherIcon(hour.weatherCode, hour.isDay), [hour.weatherCode, hour.isDay]);
  const formattedTime = useMemo(() => isNow ? (settings.language === 'tr' ? 'Şimdi' : 'Now') : formatHour(hour.time, settings.language, settings.hourFormat24), [hour.time, settings.language, settings.hourFormat24, isNow]);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(isNow ? 0.9 : 0.85)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation for all cards
    Animated.sequence([
      Animated.delay(index * 40),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtle icon floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloatAnim, {
          toValue: -3,
          duration: 2000 + (index * 100),
          useNativeDriver: true,
        }),
        Animated.timing(iconFloatAnim, {
          toValue: 0,
          duration: 2000 + (index * 100),
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (isNow) {
      // Glow animation for "Now" card
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isNow, glowAnim, scaleAnim, iconFloatAnim, fadeAnim, index]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  if (isNow) {
    return (
      <Animated.View style={[
        styles.nowCardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }
      ]}>
        <LinearGradient
          colors={[theme.accent, `${theme.accent}88`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nowCard}
        >
          <Animated.View style={[
            styles.nowGlow,
            {
              backgroundColor: theme.accent,
              opacity: glowOpacity,
            }
          ]} />
          <Text style={[styles.nowTime, { color: theme.accent === '#FBBF24' || theme.accent === '#FCD34D' || theme.accent === '#FFD54F' ? '#1A1A1A' : '#fff' }]}>{formattedTime}</Text>
          <Animated.Text style={[styles.nowIcon, { transform: [{ translateY: iconFloatAnim }] }]}>{weatherIcon}</Animated.Text>
          <Text style={[styles.nowTemp, { color: theme.accent === '#FBBF24' || theme.accent === '#FCD34D' || theme.accent === '#FFD54F' ? '#1A1A1A' : '#fff' }]}>{displayTemperature}°</Text>
          {hour.precipitationProbability > 0 && (
            <View style={styles.precipContainer}>
              <Text style={styles.precipIcon}>💧</Text>
              <Text style={[styles.nowPrecip, { color: theme.accent === '#FBBF24' || theme.accent === '#FCD34D' || theme.accent === '#FFD54F' ? '#1A1A1A' : '#fff' }]}>
                {hour.precipitationProbability}%
              </Text>
            </View>
          )}
          <View style={styles.windContainer}>
            <Text style={[styles.nowWind, { color: theme.accent === '#FBBF24' || theme.accent === '#FCD34D' || theme.accent === '#FFD54F' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)' }]}>
              💨 {hour.windSpeed}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
      <BlurView intensity={30} tint={theme.isDark ? 'dark' : 'light'} style={styles.hourCardBlur}>
        <View style={[styles.hourCard, { borderColor: theme.cardBorder }]}>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{formattedTime}</Text>
          <Animated.Text style={[styles.icon, { transform: [{ translateY: iconFloatAnim }] }]}>{weatherIcon}</Animated.Text>
          <Text style={[styles.temp, { color: theme.text }]}>{displayTemperature}°</Text>
          {hour.precipitationProbability > 0 && (
            <View style={styles.precipContainer}>
              <Text style={styles.precipIcon}>💧</Text>
              <Text style={[styles.precip, { color: '#64B5F6' }]}>
                {hour.precipitationProbability}%
              </Text>
            </View>
          )}
          <View style={styles.windContainer}>
            <Text style={[styles.wind, { color: theme.textSecondary }]}>
              💨 {hour.windSpeed}
            </Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.hour.time === nextProps.hour.time &&
    prevProps.hour.temperature === nextProps.hour.temperature &&
    prevProps.hour.weatherCode === nextProps.hour.weatherCode &&
    prevProps.settings.language === nextProps.settings.language &&
    prevProps.settings.temperatureUnit === nextProps.settings.temperatureUnit &&
    prevProps.isNow === nextProps.isNow &&
    prevProps.index === nextProps.index
  );
});

const HourlyForecastComponent: React.FC<HourlyForecastProps> = ({
  hourlyData,
  theme,
  settings,
  convertTemperature,
}) => {
  const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollHintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Scroll hint animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollHintAnim, {
          toValue: 5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scrollHintAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scrollHintAnim]);

  // Limit data to 24 hours
  const displayData = useMemo(() => hourlyData.slice(0, 24), [hourlyData]);

  const renderItem = useCallback(({ item, index }: { item: HourlyWeather; index: number }) => (
    <HourCard
      hour={item}
      theme={theme}
      settings={settings}
      convertTemperature={convertTemperature}
      isNow={index === 0}
      index={index}
    />
  ), [theme, settings, convertTemperature]);

  const keyExtractor = useCallback((item: HourlyWeather, index: number) =>
    `${item.time}-${index}`, []
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>{translations.hourlyForecast}</Text>
        <Animated.Text style={[styles.scrollHint, { transform: [{ translateX: scrollHintAnim }] }]}>→</Animated.Text>
      </View>
      <FlatList
        horizontal
        data={displayData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: 95,
          offset: 95 * index,
          index,
        })}
      />
    </Animated.View>
  );
};

export const HourlyForecast = memo(HourlyForecastComponent);

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingLeft: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingRight: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollHint: {
    fontSize: 18,
    opacity: 0.4,
  },
  scrollContent: {
    paddingRight: 20,
  },
  hourCardBlur: {
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
  },
  hourCard: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 80,
    borderWidth: 1,
  },
  nowCardWrapper: {
    marginRight: 10,
  },
  nowCard: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
    minWidth: 90,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nowGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    borderRadius: 100,
  },
  nowTime: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  nowIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  nowTemp: {
    fontSize: 22,
    fontWeight: '700',
  },
  nowPrecip: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  nowWind: {
    fontSize: 12,
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  temp: {
    fontSize: 18,
    fontWeight: '600',
  },
  precipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  precipIcon: {
    fontSize: 10,
  },
  precip: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
  windContainer: {
    marginTop: 4,
  },
  wind: {
    fontSize: 11,
  },
});
