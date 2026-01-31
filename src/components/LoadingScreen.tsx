import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherCardSkeleton, HourlyForecastSkeleton, StatsSkeleton } from './SkeletonLoader';

export const LoadingScreen: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#4A90E2', '#67B8DE', '#87CEEB']}
      style={styles.container}
    >
      {/* Header with animated icon */}
      <View style={styles.header}>
        <Animated.Text
          style={[
            styles.icon,
            {
              transform: [
                { scale: pulseAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          🌤️
        </Animated.Text>
        <Text style={styles.title}>WeatherThen</Text>
        <View style={styles.loadingDots}>
          <LoadingDot delay={0} />
          <LoadingDot delay={150} />
          <LoadingDot delay={300} />
        </View>
      </View>

      {/* Skeleton preview */}
      <View style={styles.skeletonPreview}>
        <WeatherCardSkeleton />
        <HourlyForecastSkeleton />
        <StatsSkeleton />
      </View>
    </LinearGradient>
  );
};

const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 30,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  skeletonPreview: {
    flex: 1,
    paddingHorizontal: 0,
  },
});
