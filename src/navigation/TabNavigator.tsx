import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { HomeScreen, ForecastScreen, RadarScreen, FavoritesScreen, SettingsScreen } from '../screens';
import { WeatherData, LocationData, GeocodingResult } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  weatherData: WeatherData;
  theme: ThemeColors;
  settings: AppSettings;
  refreshing: boolean;
  onRefresh: () => void;
  onLocationSelect: (location: GeocodingResult | LocationData) => void;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
  getTemperatureSymbol: () => string;
  getWindSpeedSymbol: () => string;
}

interface TabIconProps {
  icon: string;
  focused: boolean;
  color: string;
  theme: ThemeColors;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, focused, theme }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scaleAnim, glowAnim]);

  return (
    <Animated.View style={[
      styles.tabIconContainer,
      focused && styles.tabIconFocused,
      {
        transform: [{ scale: scaleAnim }],
        backgroundColor: focused ? `${theme.accent}25` : 'transparent',
      }
    ]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconTextFocused]}>{icon}</Text>
    </Animated.View>
  );
};

export const TabNavigator: React.FC<TabNavigatorProps> = ({
  weatherData,
  theme,
  settings,
  refreshing,
  onRefresh,
  onLocationSelect,
  convertTemperature,
  convertWindSpeed,
  getTemperatureSymbol,
  getWindSpeedSymbol,
}) => {
  const t = getTranslations(settings.language);
  const insets = useSafeAreaInsets();

  // Calculate tab bar height with safe area
  const tabBarHeight = 70 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : `${theme.primary[0]}F0`,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 0.5,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 10),
          height: tabBarHeight,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint={theme.isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3,
        },
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: t.home,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" focused={focused} color={color} theme={theme} />
          ),
        }}
      >
        {() => (
          <HomeScreen
            weatherData={weatherData}
            theme={theme}
            settings={settings}
            refreshing={refreshing}
            onRefresh={onRefresh}
            convertTemperature={convertTemperature}
            convertWindSpeed={convertWindSpeed}
            getTemperatureSymbol={getTemperatureSymbol}
            getWindSpeedSymbol={getWindSpeedSymbol}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Forecast"
        options={{
          tabBarLabel: t.forecast,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="📅" focused={focused} color={color} theme={theme} />
          ),
        }}
      >
        {() => (
          <ForecastScreen
            weatherData={weatherData}
            theme={theme}
            settings={settings}
            refreshing={refreshing}
            onRefresh={onRefresh}
            convertTemperature={convertTemperature}
            convertWindSpeed={convertWindSpeed}
            getTemperatureSymbol={getTemperatureSymbol}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Radar"
        options={{
          tabBarLabel: t.radar,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🗺️" focused={focused} color={color} theme={theme} />
          ),
        }}
      >
        {() => (
          <RadarScreen
            weatherData={weatherData}
            theme={theme}
            settings={settings}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Favorites"
        options={{
          tabBarLabel: t.favorites,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⭐" focused={focused} color={color} theme={theme} />
          ),
        }}
      >
        {() => (
          <FavoritesScreen
            currentLocation={weatherData.location}
            onLocationSelect={onLocationSelect}
            theme={theme}
            settings={settings}
            convertTemperature={convertTemperature}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: t.settings,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⚙️" focused={focused} color={color} theme={theme} />
          ),
        }}
      >
        {() => (
          <SettingsScreen theme={theme} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabIcon: {
    fontSize: 22,
  },
  tabIconTextFocused: {
    fontSize: 24,
  },
});
