/**
 * Premium Types
 * Premium abonelik sistemi için tipler
 */

export type PremiumTier = 'free' | 'premium';

export interface PremiumStatus {
  tier: PremiumTier;
  isPremium: boolean;
  expiresAt?: Date;
  purchasedAt?: Date;
}

/**
 * Premium özelliklerin listesi
 * Bu özellikler sadece premium kullanıcılar için erişilebilir
 */
export type PremiumFeature =
  | 'air_quality'           // Hava kalitesi kartı
  | 'moon_phase'            // Ay fazı bilgisi
  | 'comfort_index'         // Konfor indeksi
  | 'temperature_chart'     // 7 günlük sıcaklık grafiği
  | 'precipitation_chart'   // Yağış grafiği
  | 'weather_comparison'    // Konum karşılaştırması
  | 'clothing_suggestion'   // Giysi önerisi
  | 'weather_share'         // Hava durumu paylaşma
  | 'unlimited_favorites'   // Sınırsız favori konum
  | 'widgets'               // Ana ekran widget'ları
  | 'ad_free'               // Reklamsız deneyim
  | 'hourly_48h'            // 48 saatlik tahmin
  | 'detailed_alerts';      // Detaylı hava uyarıları

/**
 * Her özelliğin açıklaması
 */
export const PREMIUM_FEATURE_INFO: Record<PremiumFeature, { 
  titleTr: string; 
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  emoji: string;
}> = {
  air_quality: {
    titleTr: 'Hava Kalitesi',
    titleEn: 'Air Quality',
    descriptionTr: 'Detaylı hava kalitesi ve kirlilik verileri',
    descriptionEn: 'Detailed air quality and pollution data',
    emoji: '🌬️',
  },
  moon_phase: {
    titleTr: 'Ay Fazı',
    titleEn: 'Moon Phase',
    descriptionTr: 'Ay fazı, aydınlanma ve takvim bilgileri',
    descriptionEn: 'Moon phase, illumination and calendar info',
    emoji: '🌙',
  },
  comfort_index: {
    titleTr: 'Konfor İndeksi',
    titleEn: 'Comfort Index',
    descriptionTr: 'Saatlik konfor skorları ve en iyi zaman önerileri',
    descriptionEn: 'Hourly comfort scores and best time suggestions',
    emoji: '😊',
  },
  temperature_chart: {
    titleTr: 'Sıcaklık Grafiği',
    titleEn: 'Temperature Chart',
    descriptionTr: '7 günlük sıcaklık trendi grafiği',
    descriptionEn: '7-day temperature trend chart',
    emoji: '📈',
  },
  precipitation_chart: {
    titleTr: 'Yağış Grafiği',
    titleEn: 'Precipitation Chart',
    descriptionTr: 'Detaylı yağış olasılığı grafiği',
    descriptionEn: 'Detailed precipitation probability chart',
    emoji: '🌧️',
  },
  weather_comparison: {
    titleTr: 'Konum Karşılaştırması',
    titleEn: 'Location Comparison',
    descriptionTr: 'Farklı konumları karşılaştır',
    descriptionEn: 'Compare different locations',
    emoji: '🔄',
  },
  clothing_suggestion: {
    titleTr: 'Giysi Önerisi',
    titleEn: 'Clothing Suggestion',
    descriptionTr: 'Havaya göre giysi önerileri',
    descriptionEn: 'Weather-based clothing suggestions',
    emoji: '👔',
  },
  weather_share: {
    titleTr: 'Hava Paylaşımı',
    titleEn: 'Weather Share',
    descriptionTr: 'Hava durumunu arkadaşlarınla paylaş',
    descriptionEn: 'Share weather with your friends',
    emoji: '📤',
  },
  unlimited_favorites: {
    titleTr: 'Sınırsız Favoriler',
    titleEn: 'Unlimited Favorites',
    descriptionTr: 'Sınırsız favori konum ekle',
    descriptionEn: 'Add unlimited favorite locations',
    emoji: '⭐',
  },
  widgets: {
    titleTr: 'Ana Ekran Widget\'ları',
    titleEn: 'Home Screen Widgets',
    descriptionTr: 'Özelleştirilebilir ana ekran widget\'ları',
    descriptionEn: 'Customizable home screen widgets',
    emoji: '📱',
  },
  ad_free: {
    titleTr: 'Reklamsız',
    titleEn: 'Ad-Free',
    descriptionTr: 'Reklamsız temiz deneyim',
    descriptionEn: 'Clean ad-free experience',
    emoji: '🚫',
  },
  hourly_48h: {
    titleTr: '48 Saatlik Tahmin',
    titleEn: '48-Hour Forecast',
    descriptionTr: '48 saatlik detaylı tahminler',
    descriptionEn: '48-hour detailed forecasts',
    emoji: '⏰',
  },
  detailed_alerts: {
    titleTr: 'Detaylı Uyarılar',
    titleEn: 'Detailed Alerts',
    descriptionTr: 'Gelişmiş hava durumu uyarıları',
    descriptionEn: 'Advanced weather alerts',
    emoji: '⚠️',
  },
};

/**
 * Ücretsiz kullanıcılar için favori limiti
 */
export const FREE_FAVORITES_LIMIT = 3;

/**
 * Premium paket bilgisi
 */
export interface PremiumPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  discount?: number;
}

export const PREMIUM_PACKAGES: PremiumPackage[] = [
  {
    id: 'premium_monthly',
    name: 'Aylık Premium',
    price: 29.99,
    currency: 'TRY',
    period: 'monthly',
  },
  {
    id: 'premium_yearly',
    name: 'Yıllık Premium',
    price: 199.99,
    currency: 'TRY',
    period: 'yearly',
    discount: 45,
  },
  {
    id: 'premium_lifetime',
    name: 'Ömür Boyu Premium',
    price: 499.99,
    currency: 'TRY',
    period: 'lifetime',
  },
];
