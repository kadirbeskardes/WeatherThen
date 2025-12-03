import React from 'react';
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

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onLocationPress,
  theme,
  lastUpdated,
  language,
}) => {
  const t = getTranslations(language);
  
  const formatUpdateTime = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    if (diff < 1) return t.updatedNow;
    if (diff < 60) return `${diff} ${t.updatedMinutesAgo}`;
    return lastUpdated.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLocationPress} style={styles.button}>
        <Text style={styles.buttonIcon}>📍</Text>
      </TouchableOpacity>

      {lastUpdated && (
        <View style={styles.updateInfo}>
          <Text style={[styles.updateText, { color: theme.textSecondary }]}>
            {formatUpdateTime()}
          </Text>
        </View>
      )}

      <TouchableOpacity onPress={onSearchPress} style={styles.button}>
        <Text style={styles.buttonIcon}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
};

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
