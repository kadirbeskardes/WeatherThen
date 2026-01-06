# 🌤️ WeatherThen

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

**WeatherThen**, React Native ve Expo ile geliştirilmiş, modern ve kullanıcı dostu bir hava durumu uygulamasıdır. Dinamik temalar, animasyonlar ve Android widget desteği ile kapsamlı bir hava durumu deneyimi sunar.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Yapılandırma](#-yapılandırma)
- [Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler

- 🌍 **Konum Tabanlı Hava Durumu**: Otomatik konum algılama
- 🔍 **Konum Arama**: Herhangi bir şehir için hava durumu sorgulama
- 📱 **Tab Navigasyon**: Kolay gezinme için bottom tab navigator
- 🎨 **Dinamik Temalar**: Hava durumuna göre değişen renk şemaları
- 🌅 **Gündüz/Gece Modu**: Otomatik veya manuel tema seçimi
- ⭐ **Favoriler**:  Sık kullanılan konumları kaydetme
- 💎 **Premium Özellikler**: Gelişmiş özellikler için premium üyelik
- 🔄 **Önbellek Yönetimi**: Performans için akıllı önbellekleme
- 🌐 **Çoklu Dil Desteği**: Farklı dillerde kullanım
- 📊 **Widget Desteği**: Android ana ekran widget'ı
- 🌡️ **Birim Dönüşümü**: Celsius/Fahrenheit, km/h-mph dönüşümleri
- ✨ **Hava Animasyonları**: Hava durumuna göre görsel animasyonlar

## 🛠 Teknolojiler

### Core
- **React Native** `0.81.5` - Cross-platform mobil geliştirme
- **Expo** `54.0` - React Native framework
- **TypeScript** `5.9` - Tip güvenli JavaScript

### Navigation & UI
- **React Navigation** `7.x` - Navigasyon yönetimi
- **Expo Linear Gradient** - Gradient arka planlar
- **Expo Blur** - Blur efektleri
- **React Native Reanimated** - Performanslı animasyonlar

### State & Storage
- **React Context API** - Global state yönetimi
- **AsyncStorage** - Yerel veri depolama

### Location & Weather
- **Expo Location** - Konum servisleri
- **Weather API** - Hava durumu verileri

### Platform Specific
- **React Native Android Widget** - Android widget desteği

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Expo CLI
- iOS Simulator (Mac) veya Android Emulator

### Adımlar

```bash
# Repository'yi klonlayın
git clone https://github.com/kadirbeskardes/WeatherThen.git
cd WeatherThen

# Bağımlılıkları yükleyin
npm install

# Expo ile başlatın
npx expo start
```

### Platform Spesifik Başlatma

```bash
# Android için
npm run android

# iOS için
npm run ios

# Web için
npm run web
```

## 📁 Proje Yapısı

```
WeatherThen/
├── App.tsx                     # Ana uygulama komponenti
├── index.ts                    # Giriş noktası
├── src/
│   ├── components/            # Yeniden kullanılabilir UI bileşenleri
│   │   ├── Header.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── ErrorScreen.tsx
│   │   ├── LocationSearch.tsx
│   │   └── WeatherAnimation.tsx
│   ├── context/               # React Context providers
│   │   ├── SettingsContext.tsx
│   │   ├── FavoritesContext.tsx
│   │   └── PremiumContext.tsx
│   ├── navigation/            # Navigasyon yapılandırması
│   │   └── TabNavigator.tsx
│   ├── services/              # API servisleri
│   │   └── weatherApi.ts
│   ├── types/                 # TypeScript tip tanımları
│   │   └── weather.ts
│   └── utils/                 # Yardımcı fonksiyonlar
│       ├── weatherUtils.ts
│       ├── themeUtils.ts
│       ├── translations.ts
│       └── cache.ts
├── assets/                    # Resimler ve fontlar
├── docs/                      # Dokümantasyon
├── scripts/                   # Build scriptleri
└── app.json                   # Expo yapılandırması
```

## ⚙️ Yapılandırma

### Environment Değişkenleri

```env
WEATHER_API_KEY=your_api_key_here
```

### Ayarlar

Uygulama içinden yapılandırılabilir ayarlar: 
- 🌡️ Sıcaklık birimi (Celsius/Fahrenheit)
- 💨 Rüzgar hızı birimi (km/h, mph)
- 🎨 Tema modu (Açık/Koyu/Otomatik)
- 🌐 Dil seçimi

## 🌈 Tema Sistemi

Uygulama, hava durumuna göre dinamik olarak tema değiştirir:

| Hava Durumu | Gündüz Renkleri | Gece Renkleri |
|-------------|-----------------|---------------|
| ☀️ Güneşli | Turuncu/Sarı | Lacivert |
| ☁️ Bulutlu | Gri tonları | Koyu gri |
| 🌧️ Yağmurlu | Mavi tonları | Koyu mavi |
| ❄️ Karlı | Beyaz/Açık mavi | Gri/Mavi |

## 📱 Widget Kullanımı (Android)

1. Ana ekrana uzun basın
2. Widget'lar'ı seçin
3. WeatherThen widget'ını bulun
4. Ana ekrana sürükleyin

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/NewFeature`)
3. Commit edin (`git commit -m 'Add NewFeature'`)
4. Push edin (`git push origin feature/NewFeature`)
5. Pull Request açın

## 📄 Lisans

MIT License

---

<p align="center">
  🌤️ <strong>WeatherThen</strong> - Her zaman hava durumundan haberdar olun! 
</p>
