import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { DailyWeather } from '../types/weather';
import { getWeatherIcon, formatDayName, formatTime } from '../utils/weatherUtils';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface DailyForecastProps {
  dailyData: DailyWeather[];
  theme: ThemeColors;
  onDayPress?: (day: DailyWeather) => void;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
}

interface DayCardProps {
  day: DailyWeather;
  theme: ThemeColors;
  settings: AppSettings;
  onPress?: () => void;
  convertTemperature: (celsius: number) => number;
  index: number;
}

const DayCard = memo<DayCardProps>(({ day, theme, settings, onPress, convertTemperature, index }) => {
  const formattedDayName = useMemo(() => formatDayName(day.date, settings.language), [day.date, settings.language]);
  const formattedSunrise = useMemo(() => formatTime(day.sunrise, settings.language, settings.hourFormat24), [day.sunrise, settings.language, settings.hourFormat24]);
  const formattedSunset = useMemo(() => formatTime(day.sunset, settings.language, settings.hourFormat24), [day.sunset, settings.language, settings.hourFormat24]);
  const weatherIcon = useMemo(() => getWeatherIcon(day.weatherCode, true), [day.weatherCode]);
  const displayMaxTemperature = useMemo(() => convertTemperature(day.temperatureMax), [day.temperatureMax, convertTemperature]);
  const displayMinTemperature = useMemo(() => convertTemperature(day.temperatureMin), [day.temperatureMin, convertTemperature]);
  const temperatureRangePercent = useMemo(() => Math.min(((day.temperatureMax - day.temperatureMin) / 40) * 100, 100), [day.temperatureMax, day.temperatureMin]);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const barWidthAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 50),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(barWidthAnim, {
          toValue: temperatureRangePercent,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Subtle icon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, barWidthAnim, temperatureRangePercent, index, iconRotateAnim]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.();
  };

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-3deg', '3deg', '-3deg'],
  });

  const barWidth = barWidthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <BlurView intensity={30} tint={theme.isDark ? 'dark' : 'light'} style={styles.dayCardBlur}>
          <View style={[styles.dayCard, { borderColor: theme.cardBorder }]}>
            <View style={styles.dayInfo}>
              <Text style={[styles.dayName, { color: theme.text }]}>{formattedDayName}</Text>
              <View style={styles.sunTimes}>
                <Text style={[styles.sunTime, { color: theme.textSecondary }]}>🌅 {formattedSunrise}</Text>
                <Text style={[styles.sunTime, { color: theme.textSecondary }]}>🌇 {formattedSunset}</Text>
              </View>
            </View>

            <View style={styles.weatherInfo}>
              <Animated.Text style={[styles.icon, { transform: [{ rotate: iconRotation }] }]}>
                {weatherIcon}
              </Animated.Text>
              {day.precipitationProbability > 0 && (
                <View style={styles.precipBadge}>
                  <Text style={styles.precipIcon}>💧</Text>
                  <Text style={[styles.precip, { color: '#64B5F6' }]}>
                    {day.precipitationProbability}%
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.tempContainer}>
              <Text style={[styles.tempMax, { color: theme.text }]}>{displayMaxTemperature}°</Text>
              <View style={[styles.tempBar, { backgroundColor: theme.secondary }]}>
                <Animated.View style={[styles.tempBarFill, { width: barWidth }]}>
                  <LinearGradient
                    colors={[theme.accent, `${theme.accent}88`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tempBarGradient}
                  />
                </Animated.View>
              </View>
              <Text style={[styles.tempMin, { color: theme.textSecondary }]}>{displayMinTemperature}°</Text>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.day.date === nextProps.day.date &&
    prevProps.day.temperatureMax === nextProps.day.temperatureMax &&
    prevProps.day.temperatureMin === nextProps.day.temperatureMin &&
    prevProps.day.weatherCode === nextProps.day.weatherCode &&
    prevProps.settings.language === nextProps.settings.language &&
    prevProps.settings.temperatureUnit === nextProps.settings.temperatureUnit &&
    prevProps.index === nextProps.index
  );
});

const DailyForecastComponent: React.FC<DailyForecastProps> = ({
  dailyData,
  theme,
  onDayPress,
  settings,
  convertTemperature,
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

  const renderItem = useCallback(({ item, index }: { item: DailyWeather; index: number }) => (
    <DayCard
      day={item}
      theme={theme}
      settings={settings}
      onPress={() => onDayPress?.(item)}
      convertTemperature={convertTemperature}
      index={index}
    />
  ), [theme, settings, onDayPress, convertTemperature]);

  const keyExtractor = useCallback((item: DailyWeather) => item.date, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={[styles.title, { color: theme.text }]}>{translations.dailyForecast}</Text>
      <FlatList
        data={dailyData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        initialNumToRender={7}
        maxToRenderPerBatch={5}
        removeClippedSubviews={true}
      />
    </Animated.View>
  );
};

export const DailyForecast = memo(DailyForecastComponent);

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayCardBlur: {
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sunTimes: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 10,
  },
  sunTime: {
    fontSize: 11,
  },
  weatherInfo: {
    alignItems: 'center',
    marginHorizontal: 15,
    minWidth: 50,
  },
  icon: {
    fontSize: 34,
  },
  precipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  precipIcon: {
    fontSize: 10,
  },
  precip: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 110,
  },
  tempMax: {
    fontSize: 17,
    fontWeight: '700',
    width: 38,
    textAlign: 'right',
  },
  tempBar: {
    height: 6,
    width: 45,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  tempBarFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tempBarGradient: {
    flex: 1,
    borderRadius: 3,
  },
  tempMin: {
    fontSize: 15,
    width: 38,
    fontWeight: '500',
  },
});
