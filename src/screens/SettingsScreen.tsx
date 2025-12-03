import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { useSettings } from '../context/SettingsContext';
import { getTranslations } from '../utils/translations';
import { TemperatureUnit, WindSpeedUnit, Language, ThemeMode } from '../types/settings';

interface SettingsScreenProps {
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

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ theme }) => {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.text }]}>⚙️ {t.settings}</Text>

      {/* Language */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🌍</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.language}
          </Text>
        </View>
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
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🌡️</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.temperatureUnit}
          </Text>
        </View>
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
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💨</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.windSpeedUnit}
          </Text>
        </View>
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
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🎨</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.theme}
          </Text>
        </View>
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
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🕐</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.hourFormat}
          </Text>
        </View>
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
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.switchRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔔</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.notifications}
            </Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={handleNotificationsChange}
            trackColor={{ false: theme.secondary, true: theme.accent }}
            thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.infoSection, { borderTopColor: theme.cardBorder }]}>
        <Text style={styles.appIcon}>🌤️</Text>
        <Text style={[styles.appName, { color: theme.text }]}>WeatherThen</Text>
        <Text style={[styles.appVersion, { color: theme.textSecondary }]}>v0.1.0</Text>
        <Text style={[styles.poweredBy, { color: theme.textSecondary }]}>
          {t.poweredBy}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
    paddingTop: 30,
    marginTop: 20,
    borderTopWidth: 1,
  },
  appIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  poweredBy: {
    fontSize: 12,
  },
});
