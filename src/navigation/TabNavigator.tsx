import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen, ForecastScreen, FavoritesScreen, SettingsScreen } from '../screens';
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
}

const TabIcon: React.FC<TabIconProps> = ({ icon, focused }) => (
  <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
    <Text style={[styles.tabIcon, focused && styles.tabIconTextFocused]}>{icon}</Text>
  </View>
);

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
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.primary[0],
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: tabBarHeight,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: t.home,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" focused={focused} color={color} />
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
            <TabIcon icon="📅" focused={focused} color={color} />
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
        name="Favorites"
        options={{
          tabBarLabel: t.favorites,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⭐" focused={focused} color={color} />
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
            <TabIcon icon="⚙️" focused={focused} color={color} />
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
