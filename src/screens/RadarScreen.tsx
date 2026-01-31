import React, { useState, useMemo, useRef, useCallback } from 'react';
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
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { WeatherData } from '../types/weather';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface RadarScreenProps {
    weatherData: WeatherData;
    theme: ThemeColors;
    settings: AppSettings;
}

interface Layer {
    id: string;
    icon: string;
    labelKey: 'precipitationLayer' | 'temperatureLayer' | 'cloudLayer' | 'windLayer' | 'pressureLayer';
    tileUrl: string;
    legendColors: string[];
    legendLabels: ('light' | 'moderate' | 'heavy' | 'cold' | 'warm' | 'hot' | 'calm' | 'strong' | 'low' | 'high')[];
}

const LAYERS: Layer[] = [
    {
        id: 'precipitation',
        icon: '🌧️',
        labelKey: 'precipitationLayer',
        tileUrl: 'precipitation_new',
        legendColors: ['#A0D2FF', '#4A90D9', '#1E3A8A'],
        legendLabels: ['light', 'moderate', 'heavy'],
    },
    {
        id: 'temperature',
        icon: '🌡️',
        labelKey: 'temperatureLayer',
        tileUrl: 'temp_new',
        legendColors: ['#3B82F6', '#FBBF24', '#EF4444'],
        legendLabels: ['cold', 'warm', 'hot'],
    },
    {
        id: 'clouds',
        icon: '☁️',
        labelKey: 'cloudLayer',
        tileUrl: 'clouds_new',
        legendColors: ['#E5E7EB', '#9CA3AF', '#4B5563'],
        legendLabels: ['light', 'moderate', 'heavy'],
    },
    {
        id: 'wind',
        icon: '💨',
        labelKey: 'windLayer',
        tileUrl: 'wind_new',
        legendColors: ['#34D399', '#FBBF24', '#EF4444'],
        legendLabels: ['calm', 'moderate', 'strong'],
    },
    {
        id: 'pressure',
        icon: '📊',
        labelKey: 'pressureLayer',
        tileUrl: 'pressure_new',
        legendColors: ['#60A5FA', '#A78BFA', '#F472B6'],
        legendLabels: ['low', 'moderate', 'high'],
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
    const [showLegend, setShowLegend] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnims = useRef(LAYERS.map(() => new Animated.Value(1))).current;
    const legendAnim = useRef(new Animated.Value(0)).current;
    const webViewRef = useRef<WebView>(null);

    const { latitude, longitude } = weatherData.location;

    const handleLayerChange = useCallback(async (layerId: string, index: number) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Animate button press
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnims[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setActiveLayer(layerId);
    }, [scaleAnims]);

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const script = direction === 'in'
            ? 'map.zoomIn();'
            : 'map.zoomOut();';
        webViewRef.current?.injectJavaScript(script);
    }, []);

    const handleRecenter = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        const script = `map.setView([${latitude}, ${longitude}], 8, { animate: true });`;
        webViewRef.current?.injectJavaScript(script);
    }, [latitude, longitude]);

    const toggleLegend = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const newValue = !showLegend;
        setShowLegend(newValue);
        Animated.timing(legendAnim, {
            toValue: newValue ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showLegend, legendAnim]);

    const activeLayerData = useMemo(() =>
        LAYERS.find(l => l.id === activeLayer) || LAYERS[0],
        [activeLayer]
    );

    const getMapHtml = () => {
        const tileLayer = activeLayerData?.tileUrl || 'precipitation_new';
        const isDark = settings.themeMode === 'dark' || (settings.themeMode === 'auto' && !weatherData.current.isDay);

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
            background: ${isDark ? '#1a1a2e' : '#f0f0f0'};
          }
          .leaflet-control-attribution { display: none; }
          .leaflet-control-zoom { display: none; }
          .weather-popup {
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 8px;
          }
          .weather-popup .temp {
            font-size: 28px;
            font-weight: bold;
            color: ${theme.text};
          }
          .weather-popup .location {
            font-size: 14px;
            color: ${theme.textSecondary};
            margin-top: 4px;
          }
          .weather-popup .icon {
            font-size: 36px;
          }
          .weather-popup .details {
            display: flex;
            justify-content: space-around;
            margin-top: 8px;
            font-size: 12px;
            color: ${theme.textSecondary};
          }
          .weather-popup .detail-item {
            display: flex;
            align-items: center;
            gap: 4px;
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
          L.tileLayer('https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);
          
          // Weather overlay layer (using OpenWeatherMap tiles)
          var weatherLayer = L.tileLayer('https://tile.openweathermap.org/map/${tileLayer}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2', {
            maxZoom: 19,
            opacity: 0.7
          }).addTo(map);
          
          // Current location marker with pulse animation
          var currentIcon = L.divIcon({
            html: '<div style="position: relative;"><div style="width: 20px; height: 20px; background: ${theme.accent}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative; z-index: 2;"></div><div style="position: absolute; top: -5px; left: -5px; width: 30px; height: 30px; background: ${theme.accent}; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div></div><style>@keyframes pulse { 0% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 0.1; } 100% { transform: scale(1); opacity: 0.3; } }</style>',
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          var marker = L.marker([${latitude}, ${longitude}], { icon: currentIcon }).addTo(map);
          
          var popupContent = '<div class="weather-popup">' +
            '<div class="icon">${weatherData.current.weatherCode < 3 ? '☀️' : weatherData.current.weatherCode < 50 ? '⛅' : '🌧️'}</div>' +
            '<div class="temp">${Math.round(weatherData.current.temperature)}°</div>' +
            '<div class="location">${weatherData.location.name}</div>' +
            '<div class="details">' +
              '<div class="detail-item">💧 ${weatherData.current.humidity}%</div>' +
              '<div class="detail-item">💨 ${Math.round(weatherData.current.windSpeed)} km/h</div>' +
            '</div>' +
          '</div>';
          
          marker.bindPopup(popupContent, { closeButton: false, className: 'custom-popup' });
          
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
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const renderMapSkeleton = () => (
        <View style={[styles.skeletonContainer, { backgroundColor: theme.card }]}>
            <SkeletonLoader
                variant="card"
                width="100%"
                height="100%"
                borderRadius={0}
            />
            <View style={styles.skeletonContent}>
                <Text style={styles.skeletonIcon}>🗺️</Text>
                <Text style={[styles.skeletonText, { color: theme.textSecondary }]}>
                    {translations.loading}
                </Text>
            </View>
        </View>
    );

    const legendOpacity = legendAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const legendTranslateY = legendAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    return (
        <View style={styles.container}>
            {/* Map */}
            {!isMapLoaded && renderMapSkeleton()}
            <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
                <WebView
                    ref={webViewRef}
                    key={activeLayer}
                    source={{ html: getMapHtml() }}
                    style={styles.map}
                    scrollEnabled={true}
                    onMessage={(event) => {
                        if (event.nativeEvent.data === 'loaded') {
                            onMapLoad();
                        }
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                />
            </Animated.View>

            {/* Map Controls (Right Side) */}
            <View style={styles.mapControls}>
                <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.controlsBlur}>
                    <TouchableOpacity
                        style={[styles.mapControlButton, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
                        onPress={() => handleZoom('in')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.mapControlIcon, { color: theme.text }]}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.mapControlButton, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
                        onPress={() => handleZoom('out')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.mapControlIcon, { color: theme.text }]}>−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.mapControlButton}
                        onPress={handleRecenter}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.mapControlEmoji}>📍</Text>
                    </TouchableOpacity>
                </BlurView>
            </View>

            {/* Location Info */}
            <View style={styles.locationInfoContainer}>
                <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.locationBlur}>
                    <View style={[styles.locationInfo, { borderColor: theme.cardBorder }]}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={[styles.locationName, { color: theme.text }]} numberOfLines={1}>
                            {weatherData.location.name}
                        </Text>
                        <TouchableOpacity
                            onPress={toggleLegend}
                            style={[styles.legendToggle, { backgroundColor: showLegend ? theme.accent : 'transparent' }]}
                        >
                            <Text style={styles.legendToggleIcon}>📊</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </View>

            {/* Legend */}
            {showLegend && (
                <Animated.View
                    style={[
                        styles.legendContainer,
                        { opacity: legendOpacity, transform: [{ translateY: legendTranslateY }] }
                    ]}
                >
                    <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.legendBlur}>
                        <View style={[styles.legend, { borderColor: theme.cardBorder }]}>
                            <Text style={[styles.legendTitle, { color: theme.text }]}>
                                {translations[activeLayerData.labelKey]}
                            </Text>
                            <View style={styles.legendItems}>
                                {activeLayerData.legendColors.map((color, index) => (
                                    <View key={index} style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: color }]} />
                                        <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
                                            {translations[activeLayerData.legendLabels[index]]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </BlurView>
                </Animated.View>
            )}

            {/* Layer Controls */}
            <View style={styles.controlsContainer}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.gradient}
                />
                <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.controlsBlurView}>
                    <View style={[styles.controls, { borderColor: theme.cardBorder }]}>
                        <Text style={[styles.controlsTitle, { color: theme.text }]}>
                            🗺️ {translations.layers}
                        </Text>
                        <View style={styles.layerButtons}>
                            {LAYERS.map((layer, index) => (
                                <Animated.View
                                    key={layer.id}
                                    style={{ transform: [{ scale: scaleAnims[index] }], flex: 1 }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.layerButton,
                                            {
                                                backgroundColor: activeLayer === layer.id
                                                    ? theme.accent
                                                    : 'rgba(255,255,255,0.1)',
                                                borderColor: activeLayer === layer.id
                                                    ? theme.accent
                                                    : 'transparent',
                                            },
                                        ]}
                                        onPress={() => handleLayerChange(layer.id, index)}
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
                                        {activeLayer === layer.id && (
                                            <View style={[styles.activeIndicator, { backgroundColor: theme.text }]} />
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </View>
                </BlurView>
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
    skeletonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    skeletonContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skeletonIcon: {
        fontSize: 56,
        marginBottom: 16,
    },
    skeletonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    mapControls: {
        position: 'absolute',
        right: 16,
        top: '35%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    controlsBlur: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    mapControlButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapControlIcon: {
        fontSize: 24,
        fontWeight: '600',
    },
    mapControlEmoji: {
        fontSize: 20,
    },
    locationInfoContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    locationBlur: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    locationInfo: {
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
    legendToggle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendToggleIcon: {
        fontSize: 18,
    },
    legendContainer: {
        position: 'absolute',
        top: 80,
        right: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    legendBlur: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    legend: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 100,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    legendItems: {
        gap: 6,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendColor: {
        width: 20,
        height: 12,
        borderRadius: 3,
    },
    legendLabel: {
        fontSize: 11,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    gradient: {
        height: 80,
    },
    controlsBlurView: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },
    controls: {
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
        gap: 6,
    },
    layerButton: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 70,
    },
    layerIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    layerLabel: {
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 16,
        height: 3,
        borderRadius: 2,
    },
});
