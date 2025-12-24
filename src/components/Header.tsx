import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { Language } from '../types/settings';
import { getTranslations } from '../utils/translations';

interface HeaderProps {
  onSearchPress: () => void;
  onLocationPress: () => void;
  theme: ThemeColors;
  lastUpdated?: Date;
  language: Language;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  onSearchPress,
  onLocationPress,
  theme,
  lastUpdated,
  language,
}) => {
  const translations = useMemo(() => getTranslations(language), [language]);
  
  const lastUpdateTimeText = useMemo(() => {
    if (!lastUpdated) return '';
    const now = new Date();
    const minutesSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    if (minutesSinceUpdate < 1) return translations.updatedNow;
    if (minutesSinceUpdate < 60) return `${minutesSinceUpdate} ${translations.updatedMinutesAgo}`;
    return lastUpdated.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }, [lastUpdated, translations, language]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLocationPress} style={styles.button}>
        <Text style={styles.buttonIcon}>📍</Text>
      </TouchableOpacity>

      {lastUpdated && (
        <View style={styles.updateInfo}>
          <Text style={[styles.updateText, { color: theme.textSecondary }]}>
            {lastUpdateTimeText}
          </Text>
        </View>
      )}

      <TouchableOpacity onPress={onSearchPress} style={styles.button}>
        <Text style={styles.buttonIcon}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
};

export const Header = memo(HeaderComponent, (prev, next) => {
  return (
    prev.lastUpdated === next.lastUpdated &&
    prev.language === next.language &&
    prev.theme.textSecondary === next.theme.textSecondary
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonIcon: {
    fontSize: 20,
  },
  updateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  updateText: {
    fontSize: 12,
  },
});
