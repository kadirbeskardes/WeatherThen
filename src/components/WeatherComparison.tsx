import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { DailyWeather, LocationData } from '../types/weather';
import { AppSettings } from '../types/settings';
import { fetchWeatherData } from '../services/weatherApi';
import { getWeatherIcon, formatDayName } from '../utils/weatherUtils';
import { useFavorites } from '../context/FavoritesContext';

interface WeatherComparisonProps {
  currentLocation: LocationData;
  currentDaily: DailyWeather[];
  theme: ThemeColors;
  settings: AppSettings;
}

interface ComparisonData {
  location: LocationData;
  daily: DailyWeather[];
}

const { width } = Dimensions.get('window');

export const WeatherComparison: React.FC<WeatherComparisonProps> = ({
  currentLocation,
  currentDaily,
  theme,
  settings,
}) => {
  const { favorites } = useFavorites();
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (favorites.length > 0) {
      loadComparisonData();
    }
  }, [favorites]);

  const loadComparisonData = async () => {
    setLoading(true);
    const data: ComparisonData[] = [];
    
    for (const fav of favorites.slice(0, 3)) {
      try {
        const weather = await fetchWeatherData(fav.latitude, fav.longitude);
        data.push({
          location: fav,
          daily: weather.daily,
        });
      } catch (error) {
        console.error(`Error loading comparison data for ${fav.name}:`, error);
      }
    }
    
    setComparisonData(data);
    setLoading(false);
  };

  const convertTemp = (celsius: number): number => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round(celsius * 9/5 + 32);
    }
    return Math.round(celsius);
  };

  if (favorites.length === 0) {
    return null;
  }

  const allLocations = [
    { location: currentLocation, daily: currentDaily },
    ...comparisonData,
  ];

  const days = currentDaily.slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🔄 {settings.language === 'tr' ? 'Konum Karşılaştırması' : 'Location Comparison'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Location tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsContainer}
        >
          {allLocations.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                {
                  backgroundColor: selectedLocationIndex === index 
                    ? theme.accent 
                    : theme.secondary,
                },
              ]}
              onPress={() => setSelectedLocationIndex(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedLocationIndex === index 
                      ? '#FFFFFF' 
                      : theme.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {index === 0 ? '📍 ' : ''}{item.location.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Comparison table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableRow}>
            <View style={styles.dayColumn}>
              <Text style={[styles.headerText, { color: theme.textSecondary }]}>
                {settings.language === 'tr' ? 'Gün' : 'Day'}
              </Text>
            </View>
            {allLocations.map((item, index) => (
              <View key={index} style={styles.dataColumn}>
                <Text 
                  style={[
                    styles.headerText, 
                    { 
                      color: index === selectedLocationIndex ? theme.accent : theme.textSecondary 
                    }
                  ]}
                  numberOfLines={1}
                >
                  {item.location.name.slice(0, 8)}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {days.map((day, dayIndex) => (
            <View key={dayIndex} style={[styles.tableRow, { borderTopColor: theme.cardBorder }]}>
              <View style={styles.dayColumn}>
                <Text style={[styles.dayText, { color: theme.text }]}>
                  {formatDayName(day.date, settings.language).slice(0, 3)}
                </Text>
              </View>
              {allLocations.map((item, locIndex) => {
                const dayData = item.daily[dayIndex];
                if (!dayData) return <View key={locIndex} style={styles.dataColumn} />;
                
                return (
                  <View 
                    key={locIndex} 
                    style={[
                      styles.dataColumn,
                      locIndex === selectedLocationIndex && styles.highlightColumn,
                    ]}
                  >
                    <Text style={styles.weatherIcon}>
                      {getWeatherIcon(dayData.weatherCode, true)}
                    </Text>
                    <Text style={[styles.tempText, { color: theme.text }]}>
                      {convertTemp(dayData.temperatureMax)}°
                    </Text>
                    <Text style={[styles.tempTextLow, { color: theme.textSecondary }]}>
                      {convertTemp(dayData.temperatureMin)}°
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Summary */}
        {comparisonData.length > 0 && (
          <View style={[styles.summary, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.summaryText, { color: theme.text }]}>
              {(() => {
                const currentAvg = currentDaily.slice(0, 5).reduce((sum, d) => sum + d.temperatureMax, 0) / 5;
                const selectedData = allLocations[selectedLocationIndex];
                const selectedAvg = selectedData.daily.slice(0, 5).reduce((sum, d) => sum + d.temperatureMax, 0) / 5;
                const diff = Math.round(selectedAvg - currentAvg);
                
                if (selectedLocationIndex === 0) {
                  return settings.language === 'tr'
                    ? 'Mevcut konumunuz seçili'
                    : 'Your current location is selected';
                }
                
                if (diff > 0) {
                  return settings.language === 'tr'
                    ? `${selectedData.location.name}, şu anki konumunuzdan ortalama ${diff}° daha sıcak`
                    : `${selectedData.location.name} is ${diff}° warmer on average`;
                } else if (diff < 0) {
                  return settings.language === 'tr'
                    ? `${selectedData.location.name}, şu anki konumunuzdan ortalama ${Math.abs(diff)}° daha soğuk`
                    : `${selectedData.location.name} is ${Math.abs(diff)}° cooler on average`;
                }
                return settings.language === 'tr'
                  ? 'Sıcaklıklar benzer'
                  : 'Temperatures are similar';
              })()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
  },
  tabsContainer: {
    marginBottom: 15,
    marginHorizontal: -5,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  dayColumn: {
    width: 50,
  },
  dataColumn: {
    flex: 1,
    alignItems: 'center',
  },
  highlightColumn: {
    opacity: 1,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tempText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tempTextLow: {
    fontSize: 11,
  },
  summary: {
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  summaryText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
