import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { useFavorites } from '../context/FavoritesContext';
import { LocationData } from '../types/weather';
import { fetchWeatherData } from '../services/weatherApi';
import { getWeatherIcon } from '../utils/weatherUtils';

interface FavoritesModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  currentLocation?: LocationData;
  theme: ThemeColors;
  settings: AppSettings;
}

interface FavoriteWeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  currentLocation,
  theme,
  settings,
}) => {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [weatherData, setWeatherData] = useState<Record<string, FavoriteWeatherData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && favorites.length > 0) {
      loadWeatherForFavorites();
    }
  }, [visible, favorites]);

  const loadWeatherForFavorites = async () => {
    setLoading(true);
    const newWeatherData: Record<string, FavoriteWeatherData> = {};
    
    await Promise.all(
      favorites.map(async (fav) => {
        try {
          const data = await fetchWeatherData(fav.latitude, fav.longitude);
          newWeatherData[fav.id] = {
            temperature: data.current.temperature,
            weatherCode: data.current.weatherCode,
            isDay: data.current.isDay,
          };
        } catch (error) {
          console.error(`Error fetching weather for ${fav.name}:`, error);
        }
      })
    );
    
    setWeatherData(newWeatherData);
    setLoading(false);
  };

  const handleAddCurrentLocation = async () => {
    if (currentLocation) {
      await addFavorite(currentLocation);
    }
  };

  const convertTemp = (celsius: number): number => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round(celsius * 9/5 + 32);
    }
    return Math.round(celsius);
  };

  const isCurrentLocationFavorite = currentLocation 
    ? isFavorite(currentLocation.latitude, currentLocation.longitude)
    : false;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              ⭐ {settings.language === 'tr' ? 'Favori Konumlar' : 'Favorite Locations'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Add current location button */}
          {currentLocation && !isCurrentLocationFavorite && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.accent + '30', borderColor: theme.accent }]}
              onPress={handleAddCurrentLocation}
            >
              <Text style={styles.addIcon}>➕</Text>
              <Text style={[styles.addText, { color: theme.accent }]}>
                {settings.language === 'tr' 
                  ? `${currentLocation.name} konumunu ekle` 
                  : `Add ${currentLocation.name}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Favorites list */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loading && favorites.length > 0 && (
              <ActivityIndicator color={theme.accent} style={styles.loader} />
            )}
            
            {favorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📍</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {settings.language === 'tr'
                    ? 'Henüz favori konum eklemediniz'
                    : 'No favorite locations yet'}
                </Text>
                <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
                  {settings.language === 'tr'
                    ? 'Mevcut konumunuzu favorilere ekleyin'
                    : 'Add your current location to favorites'}
                </Text>
              </View>
            ) : (
              favorites.map((fav) => {
                const weather = weatherData[fav.id];
                return (
                  <TouchableOpacity
                    key={fav.id}
                    style={[styles.favoriteItem, { backgroundColor: theme.secondary }]}
                    onPress={() => {
                      onLocationSelect(fav);
                      onClose();
                    }}
                  >
                    <View style={styles.favoriteInfo}>
                      <Text style={[styles.favoriteName, { color: theme.text }]}>
                        {fav.name}
                      </Text>
                      {fav.country && (
                        <Text style={[styles.favoriteCountry, { color: theme.textSecondary }]}>
                          {fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}
                        </Text>
                      )}
                    </View>
                    
                    {weather && (
                      <View style={styles.weatherInfo}>
                        <Text style={styles.weatherIcon}>
                          {getWeatherIcon(weather.weatherCode, weather.isDay)}
                        </Text>
                        <Text style={[styles.weatherTemp, { color: theme.text }]}>
                          {convertTemp(weather.temperature)}°
                        </Text>
                      </View>
                    )}
                    
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFavorite(fav.id)}
                    >
                      <Text style={styles.removeIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  addIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    maxHeight: 400,
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptyHint: {
    fontSize: 13,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteCountry: {
    fontSize: 12,
    marginTop: 2,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  weatherIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '700',
  },
  removeButton: {
    padding: 5,
  },
  removeIcon: {
    fontSize: 18,
  },
});
