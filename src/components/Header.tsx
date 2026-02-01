import React, { memo, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Continuous subtle glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  // Pulse animation for update indicator
  useEffect(() => {
    if (lastUpdated) {
      // Quick rotation on update
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
      });

      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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
  }, [lastUpdated, pulseAnim, rotateAnim]);

  const handleLocationPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(scaleAnim1, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim1, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onLocationPress();
  };

  const handleSearchPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Animated.sequence([
      Animated.timing(scaleAnim2, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim2, {
        toValue: 1,
        friction: 5,
        tension: 100,
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
        <TouchableOpacity onPress={handleLocationPress} activeOpacity={0.8}>
          <BlurView intensity={70} tint={theme.isDark ? 'dark' : 'light'} style={styles.buttonBlur}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={[styles.button, { borderColor: theme.cardBorder }]}
            >
              <Text style={styles.buttonIcon}>📍</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {lastUpdated && (
        <Animated.View style={[styles.updateInfo, { transform: [{ scale: pulseAnim }] }]}>
          <BlurView intensity={50} tint={theme.isDark ? 'dark' : 'light'} style={styles.updateBlur}>
            <View style={[styles.updateContent, { borderColor: theme.cardBorder }]}>
              <Animated.Text style={[styles.updateIcon, { transform: [{ rotate: spin }] }]}>🔄</Animated.Text>
              <Text style={[styles.updateText, { color: theme.text }]}>
                {lastUpdateTimeText}
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
        <TouchableOpacity onPress={handleSearchPress} activeOpacity={0.8}>
          <BlurView intensity={70} tint={theme.isDark ? 'dark' : 'light'} style={styles.buttonBlur}>
            <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: glowOpacity, backgroundColor: theme.accent, borderRadius: 28 }} />
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={[styles.button, { borderColor: theme.cardBorder }]}
            >
              <Text style={styles.buttonIcon}>🔍</Text>
            </LinearGradient>
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
    prev.theme.isDark === next.theme.isDark &&
    prev.theme.accent === next.theme.accent
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  buttonBlur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonIcon: {
    fontSize: 26,
  },
  updateInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  updateBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  updateIcon: {
    fontSize: 14,
  },
  updateText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

