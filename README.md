# WeatherThen 🌤️

**WeatherThen** is a sophisticated, feature-rich weather application built with **React Native** and **Expo**. It provides accurate real-time weather data, detailed forecasts, and beautiful visualizations wrapped in a modern, user-friendly interface. Designed to offer more than just the temperature, WeatherThen delivers deep insights into weather conditions including air quality, solar cycles, and lifestyle suggestions.

## 🚀 Key Features

### 🌍 **Comprehensive Weather Data**
- **Real-Time Conditions:** Instant access to temperature, humidity, pressure, wind speed, and more.
- **Forecasts:** Detailed hourly predictions and 7-day extended forecasts.
- **Advanced Metrics:** Air quality index, UV index, dew point, and visibility.

### 🎨 **Immersive Visuals**
- **Dynamic Backgrounds:** Beautiful animations that reflect current weather conditions and time of day (Day/Night cycles).
- **Interactive Charts:** Visual representations of temperature trends, precipitation probability, and wind patterns.
- **Sun & Moon:** Sun path tracking and detailed moon phase information.

### 📍 **Location Services**
- **Auto-Detection:** Automatically detects your current location for instant weather updates.
- **Global Search:** Search and save any city worldwide.
- **Favorites:** Manage a list of your favorite locations for quick access.

### 📱 **Widgets (Android)**
Stay updated without opening the app using a variety of customizable home screen widgets:
- **Temperature:** Small, Medium, and Large sizes.
- **Daily Summary:** Get a quick overview of the day's outlook.
- **Precipitation:** Keep an eye on rain/snow chances.
- **Comfort & Moon Phase:** Specialized widgets for lifestyle details.

### ⚙️ **Personalization & Tools**
- **Themes:** Supports Light, Dark, and Auto modes (syncs with system or time of day).
- **Units:** Customizable units for temperature (°C/°F) and wind speed (m/s, km/h, mph, knots).
- **Multi-language:** Built-in support for multiple languages (including English and Turkish).
- **Lifestyle Tips:** Clothing suggestions based on weather and "Feels Like" explanations.

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (v0.81) via [Expo](https://expo.dev/) (SDK 54)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Navigation:** [React Navigation](https://reactnavigation.org/) (v7)
- **State Management:** React Context API & Hooks
- **Persistence:** [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **UI & Animations:** 
  - `react-native-reanimated`
  - `expo-linear-gradient`
  - `expo-blur`
- **Native Modules:**
  - `expo-location` (Geolocation)
  - `react-native-android-widget` (Android Widgets)

---

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/WeatherThen.git
   cd WeatherThen
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on Device/Emulator**
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.
   - Scan the QR code with the Expo Go app on your physical device.

---

## 📂 Project Structure

```
WeatherThen/
├── App.tsx                 # Application entry point
├── app.json                # Expo configuration
├── src/
│   ├── components/         # Reusable UI components (Charts, Cards, Modals)
│   ├── context/            # React Context (Settings, Favorites, Premium)
│   ├── navigation/         # Navigation configuration (Tabs, Stack)
│   ├── screens/            # Main screens (Home, Forecast, Favorites, Settings)
│   ├── services/           # API services (Weather, Geocoding)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions (Formatting, Themes, Cache)
│   └── widgets/            # Android Widget definitions and handlers
└── assets/                 # Images, icons, and fonts
```

---

## 📱 Usage

### **Home Screen**
- View current weather, hourly forecast, and key statistics.
- Pull down to refresh data.
- Tap on different cards for more details.

### **Search & Favorites**
- Tap the search icon or location name in the header to find new cities.
- Save cities to your favorites for quick access via the Favorites tab.

### **Settings**
- Customize units (Metric/Imperial).
- Change theme (Light/Dark).
- Select language.

### **Widgets**
- Long press on your Android home screen -> Widgets -> WeatherThen.
- Drag and drop your preferred widget style.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
