import React, { useEffect, useRef, memo, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { WeatherCondition } from '../types/weather';

interface WeatherAnimationProps {
  condition: WeatherCondition;
  isDay: boolean;
}

const { width, height } = Dimensions.get('window');

// Reduce particle count for better performance
const RAIN_PARTICLE_COUNT = 10;
const SNOW_PARTICLE_COUNT = 12;

const WeatherAnimationComponent: React.FC<WeatherAnimationProps> = ({
  condition,
  isDay,
}) => {
  const animationsRef = useRef<Animated.Value[]>([]);
  const sunPulseRef = useRef(new Animated.Value(0));
  const cloudAnimRef = useRef(new Animated.Value(0));
  
  // Initialize animations only once
  if (animationsRef.current.length === 0) {
    const particleCount = condition === 'snow' ? SNOW_PARTICLE_COUNT : RAIN_PARTICLE_COUNT;
    for (let i = 0; i < particleCount; i++) {
      animationsRef.current.push(new Animated.Value(0));
    }
  }

  // Memoize whether animation should run
  const shouldAnimate = useMemo(() => {
    return ['rain', 'drizzle', 'snow', 'thunderstorm'].includes(condition);
  }, [condition]);

  const shouldShowSun = useMemo(() => {
    return condition === 'clear' && isDay;
  }, [condition, isDay]);

  const shouldShowClouds = useMemo(() => {
    return condition === 'cloudy' || condition === 'partly-cloudy';
  }, [condition]);

  useEffect(() => {
    if (!shouldAnimate) return;

    const animations = animationsRef.current.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500 + Math.random() * 1500,
            useNativeDriver: true,
            delay: index * 200,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });
    
    Animated.parallel(animations).start();

    return () => {
      animationsRef.current.forEach(anim => anim.stopAnimation());
    };
  }, [shouldAnimate]);

  // Sun animation
  useEffect(() => {
    if (!shouldShowSun) return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulseRef.current, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sunPulseRef.current, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();

    return () => anim.stop();
  }, [shouldShowSun]);

  // Cloud animation
  useEffect(() => {
    if (!shouldShowClouds) return;

    const anim = Animated.loop(
      Animated.timing(cloudAnimRef.current, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    );
    anim.start();

    return () => anim.stop();
  }, [shouldShowClouds]);

  // Memoized rain drops
  const rainDrops = useMemo(() => {
    if (!shouldAnimate || condition === 'snow') return null;
    
    return animationsRef.current.slice(0, RAIN_PARTICLE_COUNT).map((anim, index) => {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, height],
      });
      
      const opacity = anim.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 0.5, 0.5, 0],
      });

      return (
        <Animated.View
          key={`rain-${index}`}
          style={[
            styles.rainDrop,
            {
              left: (index * (width / RAIN_PARTICLE_COUNT)) + (index % 3) * 10,
              transform: [{ translateY }],
              opacity,
            },
          ]}
        />
      );
    });
  }, [shouldAnimate, condition]);

  // Memoized snow flakes
  const snowFlakes = useMemo(() => {
    if (!shouldAnimate || condition !== 'snow') return null;
    
    return animationsRef.current.map((anim, index) => {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, height],
      });
      
      const translateX = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 10, 0],
      });
      
      const opacity = anim.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 0.7, 0.7, 0],
      });

      return (
        <Animated.Text
          key={`snow-${index}`}
          style={[
            styles.snowFlake,
            {
              left: (index * (width / SNOW_PARTICLE_COUNT)),
              transform: [{ translateY }, { translateX }],
              opacity,
              fontSize: 12 + (index % 3) * 4,
            },
          ]}
        >
          ❄️
        </Animated.Text>
      );
    });
  }, [shouldAnimate, condition]);

  // Memoized sun
  const sunElement = useMemo(() => {
    if (!shouldShowSun) return null;

    const scale = sunPulseRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.08],
    });

    const opacity = sunPulseRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.4],
    });

    return (
      <Animated.View
        style={[
          styles.sunGlow,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  }, [shouldShowSun]);

  // Memoized clouds
  const cloudElement = useMemo(() => {
    if (!shouldShowClouds) return null;

    const translateX = cloudAnimRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, width + 100],
    });

    return (
      <Animated.Text
        style={[
          styles.cloud,
          { transform: [{ translateX }] },
        ]}
      >
        ☁️
      </Animated.Text>
    );
  }, [shouldShowClouds]);

  return (
    <View style={styles.container} pointerEvents="none">
      {rainDrops}
      {snowFlakes}
      {sunElement}
      {cloudElement}
    </View>
  );
};

export const WeatherAnimation = memo(WeatherAnimationComponent, (prev, next) => {
  return prev.condition === next.condition && prev.isDay === next.isDay;
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 15,
    backgroundColor: 'rgba(174, 194, 224, 0.6)',
    borderRadius: 1,
  },
  snowFlake: {
    position: 'absolute',
  },
  sunGlow: {
    position: 'absolute',
    top: 40,
    right: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cloud: {
    position: 'absolute',
    top: 80,
    fontSize: 60,
    opacity: 0.3,
  },
});
