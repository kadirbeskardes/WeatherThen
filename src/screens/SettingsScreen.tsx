import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '../utils/themeUtils';
import { useSettings } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import { getTranslations } from '../utils/translations';
import { TemperatureUnit, WindSpeedUnit, PressureUnit, Language, ThemeMode } from '../types/settings';
import { WidgetPreviewScreen } from './WidgetPreviewScreen';
import { PremiumPaywall, PremiumBadge } from '../components';

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
  const { isPremium, premiumStatus } = usePremium();
  const t = getTranslations(settings.language);
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);

  const handleTemperatureChange = (unit: TemperatureUnit) => {
    updateSettings({ temperatureUnit: unit });
  };

  const handleWindSpeedChange = (unit: WindSpeedUnit) => {
    updateSettings({ windSpeedUnit: unit });
  };

  const handlePressureChange = (unit: PressureUnit) => {
    updateSettings({ pressureUnit: unit });
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

      {/* Premium Section */}
      {isPremium ? (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumActiveCard}
          >
            <View style={styles.premiumActiveContent}>
              <Text style={styles.premiumActiveIcon}>👑</Text>
              <View style={styles.premiumActiveInfo}>
                <Text style={styles.premiumActiveTitle}>{t.premiumMember}</Text>
                <Text style={styles.premiumActiveSubtitle}>
                  {premiumStatus.expiresAt
                    ? `${t.premiumExpires}: ${premiumStatus.expiresAt.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US')}`
                    : settings.language === 'tr' ? 'Ömür boyu erişim' : 'Lifetime access'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder, overflow: 'hidden' }]}
          onPress={() => setShowPremiumPaywall(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBanner}
          >
            <View style={styles.premiumBannerContent}>
              <Text style={styles.premiumBannerIcon}>👑</Text>
              <View style={styles.premiumBannerInfo}>
                <Text style={styles.premiumBannerTitle}>
                  {t.upgradeToPremium}
                </Text>
                <Text style={styles.premiumBannerSubtitle}>
                  {t.unlockAllFeatures}
                </Text>
              </View>
              <View style={styles.premiumBannerArrow}>
                <Text style={styles.premiumArrowText}>›</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

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

      {/* Pressure Unit */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🌡️</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.pressureUnit}
          </Text>
        </View>
        <View style={styles.optionsRow}>
          <OptionButton
            label={t.hPa}
            selected={settings.pressureUnit === 'hPa'}
            onPress={() => handlePressureChange('hPa')}
            theme={theme}
          />
          <OptionButton
            label={t.inHg}
            selected={settings.pressureUnit === 'inHg'}
            onPress={() => handlePressureChange('inHg')}
            theme={theme}
          />
          <OptionButton
            label={t.mmHg}
            selected={settings.pressureUnit === 'mmHg'}
            onPress={() => handlePressureChange('mmHg')}
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

      {/* Widgets */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={styles.widgetButton}
          onPress={() => setShowWidgetPreview(true)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📱</Text>
            <View style={styles.widgetInfo}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {settings.language === 'tr' ? 'Widget\'lar' : 'Widgets'}
              </Text>
              <Text style={[styles.widgetDesc, { color: theme.textSecondary }]}>
                {settings.language === 'tr'
                  ? 'Ana ekran widget\'larını önizle'
                  : 'Preview home screen widgets'}
              </Text>
            </View>
          </View>
          <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={[styles.infoSection, { borderTopColor: theme.cardBorder }]}>
        <Text style={styles.appIcon}>🌤️</Text>
        <Text style={[styles.appName, { color: theme.text }]}>WeatherThen</Text>
        <Text style={[styles.appVersion, { color: theme.textSecondary }]}>v0.4.0</Text>
        <Text style={[styles.poweredBy, { color: theme.textSecondary }]}>
          {t.poweredBy}
        </Text>
      </View>

      {/* Widget Preview Modal */}
      <Modal
        visible={showWidgetPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWidgetPreview(false)}
      >
        <WidgetPreviewScreen onClose={() => setShowWidgetPreview(false)} />
      </Modal>

      {/* Premium Paywall Modal */}
      <PremiumPaywall
        visible={showPremiumPaywall}
        onClose={() => setShowPremiumPaywall(false)}
        theme={theme}
        language={settings.language}
      />
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
  widgetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetInfo: {
    flex: 1,
  },
  widgetDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  // Premium styles
  premiumBanner: {
    margin: -16,
    padding: 16,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBannerIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  premiumBannerInfo: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  premiumBannerSubtitle: {
    fontSize: 13,
    color: '#4A4A4A',
    marginTop: 2,
  },
  premiumBannerArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumArrowText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '600',
  },
  premiumActiveCard: {
    margin: -16,
    padding: 16,
    borderRadius: 16,
  },
  premiumActiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumActiveIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  premiumActiveInfo: {
    flex: 1,
  },
  premiumActiveTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  premiumActiveSubtitle: {
    fontSize: 13,
    color: '#4A4A4A',
    marginTop: 2,
  },
});
