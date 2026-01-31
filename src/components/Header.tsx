import React, { memo, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ThemeColors } from '../utils/themeUtils';
import { Language } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface HeaderProps {
  onSearchPress: () => void;
  onLocationPress: () => void;
  theme: ThemeColors;
  lastUpdated?: Date;
  language: Language;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  onSearchPress,
  onLocationPress,
  theme,
  lastUpdated,
  language,
}) => {
  const translations = useMemo(() => getTranslations(language), [language]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pulse animation for update indicator
  useEffect(() => {
    if (lastUpdated) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      pulse.start();
    }
  }, [lastUpdated, pulseAnim]);

  const handleLocationPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim1, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim1, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onLocationPress();
  };

  const handleSearchPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim2, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim2, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onSearchPress();
  };

  const lastUpdateTimeText = useMemo(() => {
    if (!lastUpdated) return '';
    const now = new Date();
    const minutesSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    if (minutesSinceUpdate < 1) return translations.updatedNow;
    if (minutesSinceUpdate < 60) return `${minutesSinceUpdate} ${translations.updatedMinutesAgo}`;
    return lastUpdated.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }, [lastUpdated, translations, language]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
        <TouchableOpacity onPress={handleLocationPress} activeOpacity={0.8}>
          <BlurView intensity={60} tint={theme.isDark ? 'dark' : 'light'} style={styles.buttonBlur}>
            <View style={[styles.button, { borderColor: theme.cardBorder }]}>
              <Text style={styles.buttonIcon}>📍</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {lastUpdated && (
        <Animated.View style={[styles.updateInfo, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.updateContent}>
            <Text style={styles.updateIcon}>🔄</Text>
            <Text style={[styles.updateText, { color: theme.textSecondary }]}>
              {lastUpdateTimeText}
            </Text>
          </View>
        </Animated.View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
        <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.8}>
          <BlurView intensity={60} tint={theme.isDark ? 'dark' : 'light'} style={styles.buttonBlur}>
            <View style={[styles.button, { borderColor: theme.cardBorder }]}>
              <Text style={styles.buttonIcon}>🔍</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export const Header = memo(HeaderComponent, (prev, next) => {
  return (
    prev.lastUpdated === next.lastUpdated &&
    prev.language === next.language &&
    prev.theme.textSecondary === next.theme.textSecondary &&
    prev.theme.isDark === next.theme.isDark
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  buttonBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonIcon: {
    fontSize: 22,
  },
  updateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateIcon: {
    fontSize: 12,
  },
  updateText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
