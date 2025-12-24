import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { GeocodingResult } from '../types/weather';
import { searchLocation } from '../services/weatherApi';
import { ThemeColors } from '../utils/themeUtils';
import { Language } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface LocationSearchProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: GeocodingResult) => void;
  theme: ThemeColors;
  language: Language;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  visible,
  onClose,
  onLocationSelect,
  theme,
  language,
}) => {
  const translations = getTranslations(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const searchDebounceTimer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        setSearchError(null);
        try {
          const locationResults = await searchLocation(searchQuery);
          setSearchResults(locationResults);
        } catch (err) {
          setSearchError(language === 'tr' ? 'Arama yapılırken bir hata oluştu' : 'An error occurred while searching');
          setSearchResults([]);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounceTimer);
  }, [searchQuery, language]);

  const handleLocationSelection = (location: GeocodingResult) => {
    onLocationSelect(location);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const predefinedPopularCities: GeocodingResult[] = [
    { id: 1, name: 'İstanbul', latitude: 41.0082, longitude: 28.9784, country: language === 'tr' ? 'Türkiye' : 'Turkey', timezone: 'Europe/Istanbul' },
    { id: 2, name: 'Ankara', latitude: 39.9334, longitude: 32.8597, country: language === 'tr' ? 'Türkiye' : 'Turkey', timezone: 'Europe/Istanbul' },
    { id: 3, name: 'İzmir', latitude: 38.4192, longitude: 27.1287, country: language === 'tr' ? 'Türkiye' : 'Turkey', timezone: 'Europe/Istanbul' },
    { id: 4, name: 'London', latitude: 51.5074, longitude: -0.1278, country: language === 'tr' ? 'İngiltere' : 'United Kingdom', timezone: 'Europe/London' },
    { id: 5, name: 'New York', latitude: 40.7128, longitude: -74.0060, country: language === 'tr' ? 'ABD' : 'United States', timezone: 'America/New_York' },
    { id: 6, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: language === 'tr' ? 'Fransa' : 'France', timezone: 'Europe/Paris' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.primary[0] }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{translations.searchLocation}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={translations.searchPlaceholder}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={[styles.clearText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {isSearching && (
            <ActivityIndicator size="small" color={theme.accent} style={styles.loader} />
          )}

          {searchError && (
            <Text style={[styles.error, { color: '#FF6B6B' }]}>{searchError}</Text>
          )}

          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.resultItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                  onPress={() => handleLocationSelection(item)}
                >
                  <Text style={styles.locationIcon}>📍</Text>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.locationDetails, { color: theme.textSecondary }]}>
                      {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          ) : searchQuery.length === 0 ? (
            <View style={styles.popularSection}>
              <Text style={[styles.popularTitle, { color: theme.textSecondary }]}>
                {translations.popularCities}
              </Text>
              {predefinedPopularCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[styles.resultItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                  onPress={() => handleLocationSelection(city)}
                >
                  <Text style={styles.locationIcon}>🏙️</Text>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, { color: theme.text }]}>
                      {city.name}
                    </Text>
                    <Text style={[styles.locationDetails, { color: theme.textSecondary }]}>
                      {city.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  clearText: {
    fontSize: 18,
    padding: 5,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    textAlign: 'center',
    marginVertical: 10,
  },
  resultsList: {
    maxHeight: 400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  locationIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  popularSection: {
    marginTop: 10,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
