import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { WeatherCondition } from '../types/weather';

interface WeatherAnimationProps {
  condition: WeatherCondition;
  isDay: boolean;
}

const { width, height } = Dimensions.get('window');

export const WeatherAnimation: React.FC<WeatherAnimationProps> = ({
  condition,
  isDay,
}) => {
  const animations = useRef<Animated.Value[]>([]);
  
  // Create animation values for particles
  if (animations.current.length === 0) {
    for (let i = 0; i < 20; i++) {
      animations.current.push(new Animated.Value(0));
    }
  }

  useEffect(() => {
    const animateParticles = () => {
      const animationConfigs = animations.current.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
              delay: index * 150,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      });
      
      Animated.parallel(animationConfigs).start();
    };

    if (condition === 'rain' || condition === 'drizzle' || condition === 'snow') {
      animateParticles();
    }

    return () => {
      animations.current.forEach(anim => anim.stopAnimation());
    };
  }, [condition]);

  const renderRainDrops = () => {
    return animations.current.slice(0, 15).map((anim, index) => {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, height],
      });
      
      const opacity = anim.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 0.6, 0.6, 0],
      });

      return (
        <Animated.View
          key={`rain-${index}`}
          style={[
            styles.rainDrop,
            {
              left: (index * (width / 15)) + Math.random() * 20,
              transform: [{ translateY }],
              opacity,
            },
          ]}
        />
      );
    });
  };

  const renderSnowFlakes = () => {
    return animations.current.map((anim, index) => {
      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, height],
      });
      
      const translateX = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 15, 0],
      });
      
      const opacity = anim.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [0, 0.8, 0.8, 0],
      });
      
      const rotate = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

      return (
        <Animated.Text
          key={`snow-${index}`}
          style={[
            styles.snowFlake,
            {
              left: (index * (width / 20)) + Math.random() * 10,
              transform: [{ translateY }, { translateX }, { rotate }],
              opacity,
              fontSize: 10 + Math.random() * 10,
            },
          ]}
        >
          ❄️
        </Animated.Text>
      );
    });
  };

  const renderSunRays = () => {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const scale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    const opacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.5],
    });

    return (
      <Animated.View
        style={[
          styles.sunGlow,
          {
            transform: [{ scale }],
            opacity,
            backgroundColor: '#FFD700',
          },
        ]}
      />
    );
  };

  const renderClouds = () => {
    const cloudAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.loop(
        Animated.timing(cloudAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    }, []);

    const translateX = cloudAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, width + 100],
    });

    return (
      <Animated.Text
        style={[
          styles.cloud,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        ☁️
      </Animated.Text>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {(condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') && renderRainDrops()}
      {condition === 'snow' && renderSnowFlakes()}
      {condition === 'clear' && isDay && renderSunRays()}
      {(condition === 'cloudy' || condition === 'partly-cloudy') && renderClouds()}
    </View>
  );
};

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
