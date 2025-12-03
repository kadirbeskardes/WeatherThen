import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { useFavorites } from '../context/FavoritesContext';
import { LocationData } from '../types/weather';
import { fetchWeatherData } from '../services/weatherApi';
import { getWeatherIcon } from '../utils/weatherUtils';
import { getTranslations } from '../utils/translations';

interface FavoritesScreenProps {
  currentLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
}

interface FavoriteWeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  temperatureMax?: number;
  temperatureMin?: number;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  currentLocation,
  onLocationSelect,
  theme,
  settings,
  convertTemperature,
}) => {
  const t = getTranslations(settings.language);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [weatherData, setWeatherData] = useState<Record<string, FavoriteWeatherData>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeatherForFavorites = async () => {
    if (favorites.length === 0) return;
    
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
            temperatureMax: data.daily[0]?.temperatureMax,
            temperatureMin: data.daily[0]?.temperatureMin,
          };
        } catch (error) {
          console.error(`Error fetching weather for ${fav.name}:`, error);
        }
      })
    );

    setWeatherData(newWeatherData);
    setLoading(false);
  };

  useEffect(() => {
    loadWeatherForFavorites();
  }, [favorites]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherForFavorites();
    setRefreshing(false);
  };

  const handleAddCurrentLocation = async () => {
    if (currentLocation) {
      await addFavorite(currentLocation);
    }
  };

  const isCurrentLocationFavorite = currentLocation
    ? isFavorite(currentLocation.latitude, currentLocation.longitude)
    : false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.text}
          colors={[theme.accent]}
        />
      }
    >
      <Text style={[styles.title, { color: theme.text }]}>
        ⭐ {t.favoriteLocations}
      </Text>

      {/* Add current location button */}
      {currentLocation && !isCurrentLocationFavorite && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.accent + '20', borderColor: theme.accent }]}
          onPress={handleAddCurrentLocation}
        >
          <Text style={styles.addIcon}>➕</Text>
          <View style={styles.addTextContainer}>
            <Text style={[styles.addTitle, { color: theme.accent }]}>
              {t.addCurrentLocation}
            </Text>
            <Text style={[styles.addSubtitle, { color: theme.textSecondary }]}>
              {currentLocation.name}
              {currentLocation.country ? `, ${currentLocation.country}` : ''}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {loading && favorites.length > 0 && (
        <ActivityIndicator color={theme.accent} size="large" style={styles.loader} />
      )}

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📍</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {t.noFavorites}
          </Text>
          <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
            {t.tapToAddFavorite}
          </Text>
        </View>
      ) : (
        <View style={styles.favoritesGrid}>
          {favorites.map((fav) => {
            const weather = weatherData[fav.id];
            return (
              <TouchableOpacity
                key={fav.id}
                style={[styles.favoriteCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => onLocationSelect(fav)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, { color: theme.text }]} numberOfLines={1}>
                      {fav.name}
                    </Text>
                    {fav.country && (
                      <Text style={[styles.locationCountry, { color: theme.textSecondary }]} numberOfLines={1}>
                        {fav.admin1 ? `${fav.admin1}, ` : ''}{fav.country}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFavorite(fav.id)}
                  >
                    <Text style={styles.removeIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {weather ? (
                  <View style={styles.weatherInfo}>
                    <Text style={styles.weatherIcon}>
                      {getWeatherIcon(weather.weatherCode, weather.isDay)}
                    </Text>
                    <Text style={[styles.temperature, { color: theme.text }]}>
                      {convertTemperature(weather.temperature)}°
                    </Text>
                    {weather.temperatureMax !== undefined && weather.temperatureMin !== undefined && (
                      <Text style={[styles.minMax, { color: theme.textSecondary }]}>
                        H: {convertTemperature(weather.temperatureMax)}° L: {convertTemperature(weather.temperatureMin)}°
                      </Text>
                    )}
                  </View>
                ) : (
                  <ActivityIndicator color={theme.accent} style={styles.cardLoader} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addTextContainer: {
    flex: 1,
  },
  addTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  loader: {
    marginVertical: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  favoritesGrid: {
    gap: 12,
  },
  favoriteCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 10,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
  },
  locationCountry: {
    fontSize: 13,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  removeIcon: {
    fontSize: 18,
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '300',
  },
  minMax: {
    fontSize: 13,
    marginTop: 4,
  },
  cardLoader: {
    marginVertical: 20,
  },
});
