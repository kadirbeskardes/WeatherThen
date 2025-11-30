import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { CurrentWeather, DailyWeather } from '../types/weather';
import { AppSettings } from '../types/settings';
import { getWeatherCondition } from '../utils/weatherUtils';

interface ClothingSuggestionProps {
  current: CurrentWeather;
  daily: DailyWeather;
  theme: ThemeColors;
  settings: AppSettings;
}

interface ClothingItem {
  emoji: string;
  nameTr: string;
  nameEn: string;
  priority: number;
}

export const ClothingSuggestion: React.FC<ClothingSuggestionProps> = ({
  current,
  daily,
  theme,
  settings,
}) => {
  const temp = current.temperature;
  const condition = getWeatherCondition(current.weatherCode);
  const uvIndex = current.uvIndex;
  const windSpeed = current.windSpeed;
  const humidity = current.humidity;
  const rainProb = daily.precipitationProbability;
  
  const getSuggestedClothing = (): ClothingItem[] => {
    const items: ClothingItem[] = [];
    
    // Temperature-based clothing
    if (temp <= 0) {
      items.push({ emoji: '🧥', nameTr: 'Kalın Mont', nameEn: 'Heavy Coat', priority: 1 });
      items.push({ emoji: '🧣', nameTr: 'Atkı', nameEn: 'Scarf', priority: 2 });
      items.push({ emoji: '🧤', nameTr: 'Eldiven', nameEn: 'Gloves', priority: 2 });
      items.push({ emoji: '🎿', nameTr: 'Termal İçlik', nameEn: 'Thermal Wear', priority: 3 });
    } else if (temp <= 10) {
      items.push({ emoji: '🧥', nameTr: 'Mont', nameEn: 'Coat', priority: 1 });
      items.push({ emoji: '👖', nameTr: 'Kalın Pantolon', nameEn: 'Warm Pants', priority: 2 });
      items.push({ emoji: '🧶', nameTr: 'Kazak', nameEn: 'Sweater', priority: 2 });
    } else if (temp <= 18) {
      items.push({ emoji: '🧥', nameTr: 'Hafif Ceket', nameEn: 'Light Jacket', priority: 1 });
      items.push({ emoji: '👕', nameTr: 'Uzun Kollu', nameEn: 'Long Sleeve', priority: 2 });
    } else if (temp <= 25) {
      items.push({ emoji: '👕', nameTr: 'T-Shirt', nameEn: 'T-Shirt', priority: 1 });
      items.push({ emoji: '👖', nameTr: 'Hafif Pantolon', nameEn: 'Light Pants', priority: 2 });
    } else {
      items.push({ emoji: '👕', nameTr: 'Kısa Kollu', nameEn: 'Short Sleeve', priority: 1 });
      items.push({ emoji: '🩳', nameTr: 'Şort', nameEn: 'Shorts', priority: 2 });
      items.push({ emoji: '👡', nameTr: 'Sandalet', nameEn: 'Sandals', priority: 3 });
    }
    
    // Weather condition based
    if (condition === 'rain' || condition === 'drizzle' || rainProb >= 50) {
      items.push({ emoji: '☔', nameTr: 'Şemsiye', nameEn: 'Umbrella', priority: 1 });
      items.push({ emoji: '🥾', nameTr: 'Su Geçirmez Ayakkabı', nameEn: 'Waterproof Shoes', priority: 2 });
      items.push({ emoji: '🧥', nameTr: 'Yağmurluk', nameEn: 'Raincoat', priority: 1 });
    }
    
    if (condition === 'snow') {
      items.push({ emoji: '🥾', nameTr: 'Bot', nameEn: 'Boots', priority: 1 });
      items.push({ emoji: '🧤', nameTr: 'Eldiven', nameEn: 'Gloves', priority: 1 });
    }
    
    // UV based
    if (uvIndex >= 6) {
      items.push({ emoji: '🧴', nameTr: 'Güneş Kremi', nameEn: 'Sunscreen', priority: 1 });
      items.push({ emoji: '😎', nameTr: 'Güneş Gözlüğü', nameEn: 'Sunglasses', priority: 1 });
      items.push({ emoji: '🎩', nameTr: 'Şapka', nameEn: 'Hat', priority: 2 });
    } else if (uvIndex >= 3) {
      items.push({ emoji: '😎', nameTr: 'Güneş Gözlüğü', nameEn: 'Sunglasses', priority: 2 });
    }
    
    // Wind based
    if (windSpeed >= 40) {
      items.push({ emoji: '🧥', nameTr: 'Rüzgarlık', nameEn: 'Windbreaker', priority: 1 });
    }
    
    // Remove duplicates by emoji and sort by priority
    const uniqueItems = items.reduce((acc: ClothingItem[], item) => {
      if (!acc.find(i => i.emoji === item.emoji)) {
        acc.push(item);
      }
      return acc;
    }, []);
    
    return uniqueItems.sort((a, b) => a.priority - b.priority).slice(0, 6);
  };
  
  const clothing = getSuggestedClothing();
  
  // Outfit recommendation text
  const getOutfitText = (): string => {
    if (temp <= 5) {
      return settings.language === 'tr' 
        ? 'Çok soğuk! Kat kat giyinin ve sıcak tutun.'
        : 'Very cold! Layer up and stay warm.';
    } else if (temp <= 15) {
      return settings.language === 'tr'
        ? 'Serin hava. Ceket almayı unutmayın.'
        : 'Cool weather. Don\'t forget a jacket.';
    } else if (temp <= 25) {
      return settings.language === 'tr'
        ? 'Rahat bir gün. Hafif giysiler yeterli.'
        : 'Comfortable day. Light clothes are enough.';
    } else {
      return settings.language === 'tr'
        ? 'Sıcak! Açık renkli ve hafif giysiler tercih edin.'
        : 'Hot! Prefer light-colored and breathable clothes.';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        👔 {settings.language === 'tr' ? 'Ne Giymeliyim?' : 'What to Wear'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Outfit Suggestion */}
        <Text style={[styles.outfitText, { color: theme.textSecondary }]}>
          {getOutfitText()}
        </Text>
        
        {/* Clothing Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          {clothing.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.clothingItem, 
                { 
                  backgroundColor: item.priority === 1 ? theme.accent + '30' : theme.secondary,
                  borderColor: item.priority === 1 ? theme.accent : 'transparent',
                }
              ]}
            >
              <Text style={styles.clothingEmoji}>{item.emoji}</Text>
              <Text style={[styles.clothingName, { color: theme.text }]} numberOfLines={1}>
                {settings.language === 'tr' ? item.nameTr : item.nameEn}
              </Text>
              {item.priority === 1 && (
                <View style={[styles.priorityBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.priorityText}>!</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
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
    padding: 16,
  },
  outfitText: {
    fontSize: 13,
    marginBottom: 15,
    lineHeight: 18,
  },
  scrollView: {
    marginHorizontal: -5,
  },
  clothingItem: {
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    position: 'relative',
  },
  clothingEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  clothingName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  priorityBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
});
