import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ThemeColors } from '../utils/themeUtils';
import { CurrentWeather } from '../types/weather';
import { AppSettings } from '../types/settings';
import { useSettings } from '../context/SettingsContext';
import { getTranslations } from '../utils/translations';

interface WeatherDetailsGridProps {
  current: CurrentWeather;
  theme: ThemeColors;
  settings: AppSettings;
}

interface DetailItem {
  icon: string;
  labelTr: string;
  labelEn: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
}

interface DetailCardProps {
  item: DetailItem;
  theme: ThemeColors;
  language: string;
  index: number;
}

const DetailCard = memo<DetailCardProps>(({ item, theme, language, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      Animated.delay(index * 60),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle icon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, rotateAnim, index]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '5deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.gridItemWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <BlurView intensity={30} tint={theme.isDark ? 'dark' : 'light'} style={styles.gridItemBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
            style={[styles.gridItem, { borderColor: theme.cardBorder }]}
          >
            <Animated.Text style={[styles.icon, { transform: [{ rotate: iconRotation }] }]}>
              {item.icon}
            </Animated.Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {language === 'tr' ? item.labelTr : item.labelEn}
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {item.value}
            </Text>
            {item.subValue && (
              <Text style={[styles.subValue, { color: item.subValueColor || theme.accent }]}>
                {item.subValue}
              </Text>
            )}
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
});

const WeatherDetailsGridComponent: React.FC<WeatherDetailsGridProps> = ({
  current,
  theme,
  settings,
}) => {
  const { convertPressure, getPressureSymbol, convertTemperature, getTemperatureSymbol } = useSettings();
  const t = getTranslations(settings.language);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const getFeelsLikeText = (): string => {
    const feels = convertTemperature(current.apparentTemperature);
    const unit = getTemperatureSymbol();
    return `${feels}${unit}`;
  };

  const getDewpointText = (): string => {
    const dewpoint = convertTemperature(current.dewpoint);
    const unit = getTemperatureSymbol();
    return `${dewpoint}${unit}`;
  };

  const getHumidityComfort = (): { text: string; color: string } => {
    const dewpoint = current.dewpoint;
    if (dewpoint < 10) {
      return { text: t.humidityDry, color: '#FFA726' };
    } else if (dewpoint < 16) {
      return { text: t.humidityComfortable, color: '#66BB6A' };
    } else if (dewpoint < 18) {
      return { text: t.humiditySlightlyHumid, color: '#29B6F6' };
    } else if (dewpoint < 21) {
      return { text: t.humidityHumid, color: '#5C6BC0' };
    } else {
      return { text: t.humidityVeryHumid, color: '#EF5350' };
    }
  };

  const getPressureTrend = (): string => {
    if (current.pressure > 1020) {
      return settings.language === 'tr' ? '↑ Yüksek' : '↑ High';
    } else if (current.pressure < 1000) {
      return settings.language === 'tr' ? '↓ Düşük' : '↓ Low';
    }
    return settings.language === 'tr' ? '→ Normal' : '→ Normal';
  };

  const getVisibilityText = (): string => {
    const km = current.visibility;
    if (km >= 10) return settings.language === 'tr' ? 'Mükemmel' : 'Excellent';
    if (km >= 5) return settings.language === 'tr' ? 'İyi' : 'Good';
    if (km >= 2) return settings.language === 'tr' ? 'Orta' : 'Moderate';
    if (km >= 1) return settings.language === 'tr' ? 'Zayıf' : 'Poor';
    return settings.language === 'tr' ? 'Çok Zayıf' : 'Very Poor';
  };

  const getCloudCoverDescription = (): string => {
    const cover = current.cloudCover;
    if (cover < 10) return settings.language === 'tr' ? 'Açık' : 'Clear';
    if (cover < 30) return settings.language === 'tr' ? 'Az Bulutlu' : 'Few Clouds';
    if (cover < 60) return settings.language === 'tr' ? 'Parçalı Bulutlu' : 'Scattered';
    if (cover < 90) return settings.language === 'tr' ? 'Çok Bulutlu' : 'Broken';
    return settings.language === 'tr' ? 'Kapalı' : 'Overcast';
  };

  const humidityComfort = getHumidityComfort();

  const details: DetailItem[] = [
    {
      icon: '🌡️',
      labelTr: 'Hissedilen',
      labelEn: 'Feels Like',
      value: getFeelsLikeText(),
    },
    {
      icon: '💧',
      labelTr: 'Nem',
      labelEn: 'Humidity',
      value: `${current.humidity}%`,
      subValue: humidityComfort.text,
      subValueColor: humidityComfort.color,
    },
    {
      icon: '🌫️',
      labelTr: 'Çiy Noktası',
      labelEn: 'Dewpoint',
      value: getDewpointText(),
      subValue: humidityComfort.text,
      subValueColor: humidityComfort.color,
    },
    {
      icon: '🔵',
      labelTr: 'Basınç',
      labelEn: 'Pressure',
      value: `${convertPressure(current.pressure)} ${getPressureSymbol()}`,
      subValue: getPressureTrend(),
    },
    {
      icon: '👁️',
      labelTr: 'Görüş',
      labelEn: 'Visibility',
      value: `${current.visibility} km`,
      subValue: getVisibilityText(),
    },
    {
      icon: '☁️',
      labelTr: 'Bulut',
      labelEn: 'Cloud Cover',
      value: `${current.cloudCover}%`,
      subValue: getCloudCoverDescription(),
    },
    {
      icon: '☀️',
      labelTr: 'UV İndeksi',
      labelEn: 'UV Index',
      value: `${current.uvIndex.toFixed(1)}`,
      subValue: current.uvIndex <= 2
        ? (settings.language === 'tr' ? 'Düşük' : 'Low')
        : current.uvIndex <= 5
          ? (settings.language === 'tr' ? 'Orta' : 'Moderate')
          : current.uvIndex <= 7
            ? (settings.language === 'tr' ? 'Yüksek' : 'High')
            : current.uvIndex <= 10
              ? (settings.language === 'tr' ? 'Çok Yüksek' : 'Very High')
              : (settings.language === 'tr' ? 'Aşırı' : 'Extreme'),
    },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        📊 {settings.language === 'tr' ? 'Detaylar' : 'Details'}
      </Text>

      <View style={styles.grid}>
        {details.map((item, index) => (
          <DetailCard
            key={index}
            item={item}
            theme={theme}
            language={settings.language}
            index={index}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export const WeatherDetailsGrid = memo(WeatherDetailsGridComponent);

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  gridItemWrapper: {
    width: '33.33%',
    paddingHorizontal: 5,
    marginBottom: 12,
  },
  gridItemBlur: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gridItem: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 26,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  subValue: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
});
