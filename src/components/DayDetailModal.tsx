import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { DailyWeather } from '../types/weather';
import { getWeatherIcon, formatDayName, formatTime, getUVIndexLevel } from '../utils/weatherUtils';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface DayDetailModalProps {
  visible: boolean;
  day: DailyWeather | null;
  onClose: () => void;
  theme: ThemeColors;
  settings: AppSettings;
  convertTemperature: (celsius: number) => number;
  convertWindSpeed: (kmh: number) => number;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  visible,
  day,
  onClose,
  theme,
  settings,
  convertTemperature,
  convertWindSpeed,
}) => {
  if (!day) return null;

  const t = getTranslations(settings.language);
  const uvInfo = getUVIndexLevel(day.uvIndexMax, settings.language);
  
  // Get weather description based on language
  const getLocalizedWeatherDescription = (code: number): string => {
    const descMap: Record<number, keyof typeof t> = {
      0: 'clear', 1: 'mostlyClear', 2: 'partlyCloudy', 3: 'overcast',
      45: 'fog', 48: 'rimeFog',
      51: 'lightDrizzle', 53: 'moderateDrizzle', 55: 'denseDrizzle',
      56: 'freezingDrizzle', 57: 'heavyFreezingDrizzle',
      61: 'lightRain', 63: 'moderateRain', 65: 'heavyRain',
      66: 'freezingRain', 67: 'heavyFreezingRain',
      71: 'lightSnow', 73: 'moderateSnow', 75: 'heavySnow', 77: 'snowGrains',
      80: 'lightShowers', 81: 'moderateShowers', 82: 'heavyShowers',
      85: 'lightSnowShowers', 86: 'heavySnowShowers',
      95: 'thunderstorm', 96: 'thunderstormLightHail', 99: 'thunderstormHeavyHail',
    };
    const key = descMap[code] || 'clear';
    return t[key];
  };
  
  const windSpeedSymbol = settings.windSpeedUnit === 'mph' ? 'mph' : settings.windSpeedUnit === 'ms' ? 'm/s' : 'km/s';

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
            <Text style={[styles.title, { color: theme.text }]}>
              {formatDayName(day.date, settings.language)}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.mainSection}>
              <Text style={styles.icon}>{getWeatherIcon(day.weatherCode, true)}</Text>
              <Text style={[styles.description, { color: theme.text }]}>
                {getLocalizedWeatherDescription(day.weatherCode)}
              </Text>
              <View style={styles.tempRange}>
                <Text style={[styles.tempMax, { color: theme.text }]}>
                  ↑ {convertTemperature(day.temperatureMax)}°
                </Text>
                <Text style={[styles.tempMin, { color: theme.textSecondary }]}>
                  ↓ {convertTemperature(day.temperatureMin)}°
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <Text style={styles.detailIcon}>🌅</Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t.sunrise}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatTime(day.sunrise, settings.language, settings.hourFormat24)}
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <Text style={styles.detailIcon}>🌇</Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t.sunset}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatTime(day.sunset, settings.language, settings.hourFormat24)}
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t.precipProbability}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {day.precipitationProbability}%
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <Text style={styles.detailIcon}>🌧️</Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t.totalPrecipitation}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {day.precipitationSum.toFixed(1)} mm
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t.maxWind}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {convertWindSpeed(day.windSpeedMax)} {windSpeedSymbol}
                </Text>
              </View>

              <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
                <Text style={styles.detailIcon}>☀️</Text>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t.uvIndex}</Text>
                <Text style={[styles.detailValue, { color: uvInfo.color }]}>
                  {day.uvIndexMax} - {uvInfo.level}
                </Text>
              </View>
            </View>

            {day.uvIndexMax >= 6 && (
              <View style={[styles.warningCard, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={[styles.warningText, { color: theme.text }]}>
                  {t.uvWarning}
                </Text>
              </View>
            )}

            {day.precipitationProbability >= 50 && (
              <View style={[styles.warningCard, { backgroundColor: 'rgba(33, 150, 243, 0.2)' }]}>
                <Text style={styles.warningIcon}>☔</Text>
                <Text style={[styles.warningText, { color: theme.text }]}>
                  {t.rainWarning}
                </Text>
              </View>
            )}

            {day.windSpeedMax >= 40 && (
              <View style={[styles.warningCard, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}>
                <Text style={styles.warningIcon}>🌬️</Text>
                <Text style={[styles.warningText, { color: theme.text }]}>
                  {t.windWarning}
                </Text>
              </View>
            )}
          </ScrollView>
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
    maxHeight: '80%',
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
  mainSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  icon: {
    fontSize: 80,
    marginBottom: 10,
  },
  description: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
  },
  tempRange: {
    flexDirection: 'row',
    gap: 20,
  },
  tempMax: {
    fontSize: 28,
    fontWeight: '700',
  },
  tempMin: {
    fontSize: 28,
    fontWeight: '400',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
  },
});
