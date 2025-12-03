import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { useSettings } from '../context/SettingsContext';
import { getTranslations } from '../utils/translations';
import { TemperatureUnit, WindSpeedUnit, Language, ThemeMode } from '../types/settings';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ThemeColors;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, selected, onPress, theme }) => (
  <TouchableOpacity
    style={[
      styles.optionButton,
      { 
        backgroundColor: selected ? theme.accent : theme.card,
        borderColor: selected ? theme.accent : theme.cardBorder,
      },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.optionButtonText,
        { color: selected ? (theme.accent === '#FFD700' || theme.accent === '#FFEB3B' ? '#000' : '#fff') : theme.text },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  theme,
}) => {
  const { settings, updateSettings } = useSettings();
  const t = getTranslations(settings.language);

  const handleTemperatureChange = (unit: TemperatureUnit) => {
    updateSettings({ temperatureUnit: unit });
  };

  const handleWindSpeedChange = (unit: WindSpeedUnit) => {
    updateSettings({ windSpeedUnit: unit });
  };

  const handleLanguageChange = (language: Language) => {
    updateSettings({ language });
  };

  const handleThemeChange = (themeMode: ThemeMode) => {
    updateSettings({ themeMode });
  };

  const handleNotificationsChange = (enabled: boolean) => {
    updateSettings({ notifications: enabled });
  };

  const handleHourFormatChange = (is24: boolean) => {
    updateSettings({ hourFormat24: is24 });
  };

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
            <Text style={[styles.title, { color: theme.text }]}>⚙️ {t.settings}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Language */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🌍 {t.language}
              </Text>
              <View style={styles.optionsRow}>
                <OptionButton
                  label="Türkçe"
                  selected={settings.language === 'tr'}
                  onPress={() => handleLanguageChange('tr')}
                  theme={theme}
                />
                <OptionButton
                  label="English"
                  selected={settings.language === 'en'}
                  onPress={() => handleLanguageChange('en')}
                  theme={theme}
                />
              </View>
            </View>

            {/* Temperature Unit */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🌡️ {t.temperatureUnit}
              </Text>
              <View style={styles.optionsRow}>
                <OptionButton
                  label={t.celsius}
                  selected={settings.temperatureUnit === 'celsius'}
                  onPress={() => handleTemperatureChange('celsius')}
                  theme={theme}
                />
                <OptionButton
                  label={t.fahrenheit}
                  selected={settings.temperatureUnit === 'fahrenheit'}
                  onPress={() => handleTemperatureChange('fahrenheit')}
                  theme={theme}
                />
              </View>
            </View>

            {/* Wind Speed Unit */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                💨 {t.windSpeedUnit}
              </Text>
              <View style={styles.optionsRow}>
                <OptionButton
                  label={t.kmh}
                  selected={settings.windSpeedUnit === 'kmh'}
                  onPress={() => handleWindSpeedChange('kmh')}
                  theme={theme}
                />
                <OptionButton
                  label={t.mph}
                  selected={settings.windSpeedUnit === 'mph'}
                  onPress={() => handleWindSpeedChange('mph')}
                  theme={theme}
                />
                <OptionButton
                  label={t.ms}
                  selected={settings.windSpeedUnit === 'ms'}
                  onPress={() => handleWindSpeedChange('ms')}
                  theme={theme}
                />
              </View>
            </View>

            {/* Theme */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🎨 {t.theme}
              </Text>
              <View style={styles.optionsRow}>
                <OptionButton
                  label={t.themeAuto}
                  selected={settings.themeMode === 'auto'}
                  onPress={() => handleThemeChange('auto')}
                  theme={theme}
                />
                <OptionButton
                  label={t.themeLight}
                  selected={settings.themeMode === 'light'}
                  onPress={() => handleThemeChange('light')}
                  theme={theme}
                />
                <OptionButton
                  label={t.themeDark}
                  selected={settings.themeMode === 'dark'}
                  onPress={() => handleThemeChange('dark')}
                  theme={theme}
                />
              </View>
            </View>

            {/* Hour Format */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🕐 {t.hourFormat}
              </Text>
              <View style={styles.optionsRow}>
                <OptionButton
                  label={t.hour24}
                  selected={settings.hourFormat24}
                  onPress={() => handleHourFormatChange(true)}
                  theme={theme}
                />
                <OptionButton
                  label={t.hour12}
                  selected={!settings.hourFormat24}
                  onPress={() => handleHourFormatChange(false)}
                  theme={theme}
                />
              </View>
            </View>

            {/* Notifications */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  🔔 {t.notifications}
                </Text>
                <Switch
                  value={settings.notifications}
                  onValueChange={handleNotificationsChange}
                  trackColor={{ false: theme.secondary, true: theme.accent }}
                  thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* App Info */}
            <View style={[styles.section, styles.infoSection]}>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                WeatherThen v0.1.0
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Powered by Open-Meteo API
              </Text>
            </View>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoSection: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
