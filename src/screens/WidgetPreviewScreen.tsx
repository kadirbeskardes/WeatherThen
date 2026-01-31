/**
 * Widget Preview Screen
 * Widget'ları önizleme ve yapılandırma ekranı
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../context/SettingsContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  TemperatureWidget,
  DailySummaryWidget,
  HourlyChartWidget,
  PrecipitationWidget,
  ComfortWidget,
  MoonPhaseWidget,
  LocationSwitcherWidget,
  WidgetSize,
} from '../widgets';
import {
  CompleteWidgetData,
  prepareWidgetData,
  getWidgetData,
  saveWidgetData,
} from '../services/widgetService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WidgetTypeKey =
  | 'temperature'
  | 'daily_summary'
  | 'hourly_chart'
  | 'precipitation'
  | 'comfort'
  | 'moon_phase'
  | 'location_switcher';

interface WidgetInfo {
  key: WidgetTypeKey;
  name: string;
  description: string;
  emoji: string;
  sizes: WidgetSize[];
}

const WIDGET_TYPES: WidgetInfo[] = [
  {
    key: 'temperature',
    name: 'Sıcaklık',
    description: 'Anlık sıcaklık ve hissedilen',
    emoji: '🌡️',
    sizes: ['small', 'medium', 'large'],
  },
  {
    key: 'daily_summary',
    name: 'Günlük Özet',
    description: 'Bugünün hava durumu özeti',
    emoji: '📅',
    sizes: ['small', 'medium', 'large'],
  },
  {
    key: 'hourly_chart',
    name: 'Saatlik Grafik',
    description: 'Saatlik sıcaklık mini grafiği',
    emoji: '📊',
    sizes: ['small', 'medium', 'large'],
  },
  {
    key: 'precipitation',
    name: 'Yağış Olasılığı',
    description: 'Yağış tahminleri',
    emoji: '🌧️',
    sizes: ['small', 'medium', 'large'],
  },
  {
    key: 'comfort',
    name: 'Konfor İndeksi',
    description: 'UV ve hava kalitesi',
    emoji: '😊',
    sizes: ['small', 'medium', 'large'],
  },
  {
    key: 'moon_phase',
    name: 'Ay Fazı',
    description: 'Ay fazı ve takvimi',
    emoji: '🌙',
    sizes: ['small', 'medium', 'large'],
  },
  {
    key: 'location_switcher',
    name: 'Konum Seçici',
    description: 'Hızlı konum değiştirme',
    emoji: '📍',
    sizes: ['small', 'medium', 'large'],
  },
];

interface WidgetPreviewScreenProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  onClose?: () => void;
}

export const WidgetPreviewScreen: React.FC<WidgetPreviewScreenProps> = ({
  latitude = 41.0082,
  longitude = 28.9784,
  locationName = 'İstanbul',
  onClose,
}) => {
  const { settings } = useSettings();
  const { favorites } = useFavorites();
  const [widgetData, setWidgetData] = useState<CompleteWidgetData | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<WidgetTypeKey>('temperature');
  const [selectedSize, setSelectedSize] = useState<WidgetSize>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState('current');

  const isDark = settings.themeMode === 'dark';
  const isNight = new Date().getHours() >= 20 || new Date().getHours() < 6;

  // Widget verilerini yükle
  useEffect(() => {
    loadWidgetData();
  }, [latitude, longitude]);

  const loadWidgetData = async () => {
    setIsLoading(true);
    try {
      // Önce cache'den dene
      let data = await getWidgetData();

      // Cache yoksa veya eskiyse yeni veri al
      if (!data) {
        data = await prepareWidgetData(latitude, longitude, locationName, settings.language);
        await saveWidgetData(data);
      }

      setWidgetData(data);
    } catch (error) {
      console.error('Widget verisi yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Widget'ı render et
  const renderWidget = useCallback(() => {
    if (!widgetData) return null;

    const favoriteLocations = favorites.map((fav, index) => ({
      id: `fav-${index}`,
      name: fav.name,
      temperature: widgetData.current.temperature,
      conditionCode: widgetData.current.conditionCode,
    }));

    const locations = [
      {
        id: 'current',
        name: locationName,
        temperature: widgetData.current.temperature,
        conditionCode: widgetData.current.conditionCode,
        isCurrentLocation: true,
      },
      ...favoriteLocations,
    ];

    switch (selectedWidget) {
      case 'temperature':
        return (
          <TemperatureWidget
            data={widgetData.current}
            size={selectedSize}
            isNight={isNight}
          />
        );
      case 'daily_summary':
        return (
          <DailySummaryWidget
            current={widgetData.current}
            daily={widgetData.daily}
            size={selectedSize}
            isNight={isNight}
          />
        );
      case 'hourly_chart':
        return (
          <HourlyChartWidget
            current={widgetData.current}
            hourly={widgetData.hourly}
            size={selectedSize}
            isNight={isNight}
          />
        );
      case 'precipitation':
        return (
          <PrecipitationWidget
            current={widgetData.current}
            hourly={widgetData.hourly}
            size={selectedSize}
            isNight={isNight}
          />
        );
      case 'comfort':
        return (
          <ComfortWidget
            current={widgetData.current}
            comfort={widgetData.comfort}
            size={selectedSize}
            isNight={isNight}
          />
        );
      case 'moon_phase':
        return (
          <MoonPhaseWidget
            current={widgetData.current}
            moon={widgetData.moon}
            size={selectedSize}
          />
        );
      case 'location_switcher':
        return (
          <LocationSwitcherWidget
            current={widgetData.current}
            locations={locations}
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
            size={selectedSize}
            isNight={isNight}
          />
        );
      default:
        return null;
    }
  }, [widgetData, selectedWidget, selectedSize, isNight, favorites, selectedLocationId, locationName]);

  // Widget ekleme talimatları
  const showWidgetInstructions = () => {
    const instructions = Platform.select({
      ios: `iOS'ta Widget Ekleme:

1. Ana ekranda boş bir alana uzun basın
2. Sol üstteki + butonuna dokunun
3. "WeatherThen" arayın
4. İstediğiniz widget boyutunu seçin
5. "Widget Ekle" butonuna dokunun
6. Widget'ı istediğiniz yere sürükleyin`,
      android: `Android'de Widget Ekleme:

1. Ana ekranda boş bir alana uzun basın
2. "Widget'lar" seçeneğine dokunun
3. "WeatherThen" arayın
4. İstediğiniz widget'ı basılı tutun
5. Ana ekrana sürükleyip bırakın
6. Gerekirse boyutunu ayarlayın`,
      default: `Widget Ekleme:

1. Ana ekranda boş alana uzun basın
2. Widget'lar bölümünü açın
3. WeatherThen widget'larını bulun
4. İstediğiniz widget'ı ekleyin`,
    });

    Alert.alert('Widget Nasıl Eklenir?', instructions, [{ text: 'Anladım' }]);
  };

  const selectedWidgetInfo = WIDGET_TYPES.find(w => w.key === selectedWidget);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textLight]}>Widget Önizleme</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Widget Önizleme */}
        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Önizleme
          </Text>
          <View style={styles.previewContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            ) : (
              renderWidget()
            )}
          </View>
        </View>

        {/* Widget Türü Seçimi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Widget Türü
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeSelector}
          >
            {WIDGET_TYPES.map(widget => (
              <TouchableOpacity
                key={widget.key}
                style={[
                  styles.typeItem,
                  selectedWidget === widget.key && styles.typeItemSelected,
                  isDark && styles.typeItemDark,
                ]}
                onPress={() => {
                  setSelectedWidget(widget.key);
                  // Seçilen widget'ın desteklediği boyutlardan birini seç
                  if (!widget.sizes.includes(selectedSize)) {
                    setSelectedSize(widget.sizes[0]);
                  }
                }}
              >
                <Text style={styles.typeEmoji}>{widget.emoji}</Text>
                <Text style={[
                  styles.typeName,
                  selectedWidget === widget.key && styles.typeNameSelected,
                  isDark && styles.textLight,
                ]}>
                  {widget.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Boyut Seçimi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            Boyut
          </Text>
          <View style={styles.sizeSelector}>
            {(['small', 'medium', 'large'] as WidgetSize[]).map(size => {
              const isAvailable = selectedWidgetInfo?.sizes.includes(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeItem,
                    selectedSize === size && styles.sizeItemSelected,
                    !isAvailable && styles.sizeItemDisabled,
                    isDark && styles.sizeItemDark,
                  ]}
                  onPress={() => isAvailable && setSelectedSize(size)}
                  disabled={!isAvailable}
                >
                  <View style={[
                    styles.sizeIcon,
                    size === 'small' && styles.sizeIconSmall,
                    size === 'medium' && styles.sizeIconMedium,
                    size === 'large' && styles.sizeIconLarge,
                    selectedSize === size && styles.sizeIconSelected,
                    !isAvailable && styles.sizeIconDisabled,
                  ]} />
                  <Text style={[
                    styles.sizeName,
                    selectedSize === size && styles.sizeNameSelected,
                    !isAvailable && styles.sizeNameDisabled,
                    isDark && styles.textLight,
                  ]}>
                    {size === 'small' ? 'Küçük' : size === 'medium' ? 'Orta' : 'Büyük'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Widget Açıklaması */}
        {selectedWidgetInfo && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <Text style={styles.infoEmoji}>{selectedWidgetInfo.emoji}</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, isDark && styles.textLight]}>
                {selectedWidgetInfo.name}
              </Text>
              <Text style={[styles.infoDescription, isDark && styles.textMuted]}>
                {selectedWidgetInfo.description}
              </Text>
            </View>
          </View>
        )}

        {/* Ekleme Butonu */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={showWidgetInstructions}
        >
          <LinearGradient
            colors={['#4A90E2', '#357ABD']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.addButtonText}>Widget Nasıl Eklenir?</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Platform Bilgisi */}
        <View style={[styles.platformInfo, isDark && styles.platformInfoDark]}>
          <Text style={[styles.platformTitle, isDark && styles.textLight]}>
            {Platform.OS === 'ios' ? '🍎 iOS' : '🤖 Android'} Widget Desteği
          </Text>
          <Text style={[styles.platformText, isDark && styles.textMuted]}>
            {Platform.OS === 'ios'
              ? 'iOS 14 ve üzeri sürümlerde widget desteği mevcuttur. Ana ekran ve kilit ekranına widget ekleyebilirsiniz.'
              : 'Widget\'lar yalnızca "development build" veya "production build" ile çalışır. Expo Go\'da widget ekleyemezsiniz! Widget kullanmak için: eas build --profile development --platform android'}
          </Text>
        </View>

        {/* Alt boşluk */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 24,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeItem: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeItemSelected: {
    backgroundColor: '#4A90E2',
  },
  typeItemDark: {
    backgroundColor: '#2A2A3E',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  typeNameSelected: {
    color: '#fff',
  },
  sizeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sizeItemSelected: {
    backgroundColor: '#4A90E2',
  },
  sizeItemDisabled: {
    opacity: 0.4,
  },
  sizeItemDark: {
    backgroundColor: '#2A2A3E',
  },
  sizeIcon: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  sizeIconSmall: {
    width: 24,
    height: 24,
  },
  sizeIconMedium: {
    width: 48,
    height: 24,
  },
  sizeIconLarge: {
    width: 48,
    height: 48,
  },
  sizeIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  sizeIconDisabled: {
    backgroundColor: '#ccc',
  },
  sizeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  sizeNameSelected: {
    color: '#fff',
  },
  sizeNameDisabled: {
    color: '#999',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardDark: {
    backgroundColor: '#2A2A3E',
  },
  infoEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#666',
  },
  addButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  platformInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
  },
  platformInfoDark: {
    backgroundColor: '#2A2A3E',
  },
  platformTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  platformText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  textLight: {
    color: '#fff',
  },
  textMuted: {
    color: '#aaa',
  },
});

export default WidgetPreviewScreen;
