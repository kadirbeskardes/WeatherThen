/**
 * Location Switcher Widget Component
 * Hızlı konum değiştirici widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetWeatherData } from '../services/widgetService';
import { getWidgetTheme, WidgetSize, WIDGET_THEMES } from './types';

interface LocationItem {
  id: string;
  name: string;
  temperature?: number;
  conditionCode?: number;
  isCurrentLocation?: boolean;
}

interface LocationSwitcherWidgetProps {
  current: WidgetWeatherData | null;
  locations: LocationItem[];
  selectedLocationId: string;
  onLocationSelect: (id: string) => void;
  size: WidgetSize;
  isNight?: boolean;
}

export const LocationSwitcherWidget: React.FC<LocationSwitcherWidgetProps> = ({
  current,
  locations,
  selectedLocationId,
  onLocationSelect,
  size,
  isNight = false,
}) => {
  const theme = current 
    ? getWidgetTheme(current.conditionCode, isNight) 
    : WIDGET_THEMES.sunny;

  const getWeatherEmoji = (code?: number): string => {
    if (!code) return '📍';
    const emojis: { [key: number]: string } = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌧️', 53: '🌧️', 55: '🌧️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '❄️', 73: '❄️', 75: '❄️',
      80: '🌦️', 81: '🌦️', 82: '⛈️',
      95: '⛈️', 96: '⛈️', 99: '⛈️',
    };
    return emojis[code] || '☀️';
  };

  const renderLocationItem = (location: LocationItem, index: number) => {
    const isSelected = location.id === selectedLocationId;
    
    return (
      <TouchableOpacity
        key={location.id}
        style={[
          styles.locationItem,
          isSelected && styles.locationItemSelected,
          { borderColor: isSelected ? theme.accent : 'rgba(255,255,255,0.3)' }
        ]}
        onPress={() => onLocationSelect(location.id)}
        activeOpacity={0.7}
      >
        <View style={styles.locationLeft}>
          <Text style={styles.locationEmoji}>
            {location.isCurrentLocation ? '📍' : getWeatherEmoji(location.conditionCode)}
          </Text>
          <View style={styles.locationInfo}>
            <Text 
              style={[styles.locationName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {location.name}
            </Text>
            {location.isCurrentLocation && (
              <Text style={[styles.currentBadge, { color: theme.accent }]}>
                Şu anki konum
              </Text>
            )}
          </View>
        </View>
        
        {location.temperature !== undefined && (
          <Text style={[styles.locationTemp, { color: theme.textPrimary }]}>
            {location.temperature}°
          </Text>
        )}
        
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: theme.accent }]} />
        )}
      </TouchableOpacity>
    );
  };

  const defaultGradient: [string, string] = [theme.background, theme.background];
  const gradientColors = theme.backgroundGradient ?? defaultGradient;

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, styles[size]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>📍 Konumlar</Text>
          <Text style={[styles.count, { color: theme.textSecondary }]}>
            {locations.length} konum
          </Text>
        </View>

        {/* Konum listesi */}
        {size === 'small' ? (
          // Small: Sadece seçili konum
          <View style={styles.smallContent}>
            {locations.find(l => l.id === selectedLocationId) && (
              <View style={styles.selectedLocation}>
                <Text style={styles.selectedEmoji}>
                  {getWeatherEmoji(locations.find(l => l.id === selectedLocationId)?.conditionCode)}
                </Text>
                <Text 
                  style={[styles.selectedName, { color: theme.textPrimary }]}
                  numberOfLines={2}
                >
                  {locations.find(l => l.id === selectedLocationId)?.name}
                </Text>
              </View>
            )}
            <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
              Değiştirmek için dokun
            </Text>
          </View>
        ) : (
          // Medium ve Large: Kaydırılabilir liste
          <ScrollView 
            style={styles.locationList}
            showsVerticalScrollIndicator={false}
          >
            {locations.map((location, index) => renderLocationItem(location, index))}
            
            {locations.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📍</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Favori konum eklenmemiş
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Alt bilgi (large için) */}
        {size === 'large' && (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              💡 Favorilere konum eklemek için uygulamayı açın
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 14,
  },
  small: {
    width: 155,
    height: 155,
  },
  medium: {
    width: 330,
    height: 155,
  },
  large: {
    width: 330,
    height: 330,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  count: {
    fontSize: 11,
  },
  smallContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLocation: {
    alignItems: 'center',
  },
  selectedEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 10,
    marginTop: 12,
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    position: 'relative',
  },
  locationItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentBadge: {
    fontSize: 10,
    marginTop: 2,
  },
  locationTemp: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default LocationSwitcherWidget;
