import React, { useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { WeatherData } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface RadarScreenProps {
    weatherData: WeatherData;
    theme: ThemeColors;
    settings: AppSettings;
}

interface Layer {
    id: string;
    icon: string;
    labelKey: 'precipitationLayer' | 'temperatureLayer' | 'cloudLayer' | 'windLayer';
    tileUrl: string;
}

const LAYERS: Layer[] = [
    {
        id: 'precipitation',
        icon: '🌧️',
        labelKey: 'precipitationLayer',
        tileUrl: 'precipitation_new',
    },
    {
        id: 'temperature',
        icon: '🌡️',
        labelKey: 'temperatureLayer',
        tileUrl: 'temp_new',
    },
    {
        id: 'clouds',
        icon: '☁️',
        labelKey: 'cloudLayer',
        tileUrl: 'clouds_new',
    },
    {
        id: 'wind',
        icon: '💨',
        labelKey: 'windLayer',
        tileUrl: 'wind_new',
    },
];

export const RadarScreen: React.FC<RadarScreenProps> = ({
    weatherData,
    theme,
    settings,
}) => {
    const translations = useMemo(() => getTranslations(settings.language), [settings.language]);
    const [activeLayer, setActiveLayer] = useState('precipitation');
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { latitude, longitude } = weatherData.location;

    const handleLayerChange = async (layerId: string) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setActiveLayer(layerId);
    };

    const getMapHtml = () => {
        const activeLayerData = LAYERS.find(l => l.id === activeLayer);
        const tileLayer = activeLayerData?.tileUrl || 'precipitation_new';

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { 
            width: 100%; 
            height: 100%; 
            background: ${theme.card};
          }
          .leaflet-control-attribution { display: none; }
          .weather-popup {
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .weather-popup .temp {
            font-size: 24px;
            font-weight: bold;
            color: ${theme.text};
          }
          .weather-popup .location {
            font-size: 14px;
            color: ${theme.textSecondary};
            margin-top: 4px;
          }
          .weather-popup .icon {
            font-size: 32px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${latitude}, ${longitude}], 8);
          
          // Base map layer (dark or light based on theme)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/${settings.themeMode === 'dark' || (settings.themeMode === 'auto' && !weatherData.current.isDay) ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);
          
          // Weather overlay layer (using OpenWeatherMap tiles)
          var weatherLayer = L.tileLayer('https://tile.openweathermap.org/map/${tileLayer}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2', {
            maxZoom: 19,
            opacity: 0.7
          }).addTo(map);
          
          // Current location marker
          var currentIcon = L.divIcon({
            html: '<div style="width: 20px; height: 20px; background: ${theme.accent}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          var marker = L.marker([${latitude}, ${longitude}], { icon: currentIcon }).addTo(map);
          
          marker.bindPopup('<div class="weather-popup"><div class="icon">${weatherData.current.weatherCode < 3 ? '☀️' : weatherData.current.weatherCode < 50 ? '⛅' : '🌧️'}</div><div class="temp">${Math.round(weatherData.current.temperature)}°</div><div class="location">${weatherData.location.name}</div></div>');
          
          // Signal that map is loaded
          window.ReactNativeWebView.postMessage('loaded');
        </script>
      </body>
      </html>
    `;
    };

    const onMapLoad = () => {
        setIsMapLoaded(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            {/* Map */}
            <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
                <WebView
                    key={activeLayer}
                    source={{ html: getMapHtml() }}
                    style={styles.map}
                    scrollEnabled={false}
                    onMessage={(event) => {
                        if (event.nativeEvent.data === 'loaded') {
                            onMapLoad();
                        }
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
                            <Text style={styles.loadingIcon}>🗺️</Text>
                            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                {translations.loading}
                            </Text>
                        </View>
                    )}
                />
            </Animated.View>

            {/* Layer Controls */}
            <View style={styles.controlsContainer}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                />
                <View style={[styles.controls, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.controlsTitle, { color: theme.text }]}>
                        🗺️ {translations.layers}
                    </Text>
                    <View style={styles.layerButtons}>
                        {LAYERS.map((layer) => (
                            <TouchableOpacity
                                key={layer.id}
                                style={[
                                    styles.layerButton,
                                    {
                                        backgroundColor: activeLayer === layer.id ? theme.accent : 'transparent',
                                        borderColor: activeLayer === layer.id ? theme.accent : theme.cardBorder,
                                    },
                                ]}
                                onPress={() => handleLayerChange(layer.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.layerIcon}>{layer.icon}</Text>
                                <Text
                                    style={[
                                        styles.layerLabel,
                                        {
                                            color: activeLayer === layer.id
                                                ? (theme.accent === '#FFD700' || theme.accent === '#FFEB3B' ? '#000' : '#fff')
                                                : theme.textSecondary,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {translations[layer.labelKey]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Location Info */}
            <View style={[styles.locationInfo, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={[styles.locationName, { color: theme.text }]} numberOfLines={1}>
                    {weatherData.location.name}
                </Text>
            </View>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    loadingText: {
        fontSize: 14,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    gradient: {
        height: 100,
    },
    controls: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    controlsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    layerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    layerButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    layerIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    layerLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    locationInfo: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    locationIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
});
