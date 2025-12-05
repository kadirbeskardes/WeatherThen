/**
 * Moon Phase Widget Component
 * Ay fazı mini widget'ı
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetMoonData, WidgetWeatherData } from '../services/widgetService';
import { WidgetSize, WIDGET_THEMES } from './types';

interface MoonPhaseWidgetProps {
  current: WidgetWeatherData | null;
  moon: WidgetMoonData | null;
  size: WidgetSize;
}

export const MoonPhaseWidget: React.FC<MoonPhaseWidgetProps> = ({
  current,
  moon,
  size,
}) => {
  if (!moon) {
    return (
      <View style={[styles.container, styles[size]]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const theme = WIDGET_THEMES.night;
  
  // Sonraki ay fazları hesaplama
  const getNextPhases = () => {
    const now = new Date();
    const lunarCycle = 29.5305882;
    
    // Basit hesaplama - gerçek uygulamada daha doğru hesaplama yapılabilir
    const daysToNew = Math.round((1 - getMoonAge(now) / lunarCycle) * lunarCycle) % Math.round(lunarCycle);
    const daysToFull = Math.abs(Math.round(lunarCycle / 2 - getMoonAge(now)));
    
    return {
      nextNew: daysToNew || Math.round(lunarCycle),
      nextFull: daysToFull || Math.round(lunarCycle / 2),
    };
  };
  
  const getMoonAge = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const c = Math.floor(365.25 * year);
    const e = Math.floor(30.6 * month);
    return (c + e + day - 694039.09) % 29.5305882;
  };

  const nextPhases = getNextPhases();

  // Ay fazı görseli
  const renderMoonVisual = () => {
    const phases: { [key: string]: { light: number; side: 'left' | 'right' | 'full' | 'none' } } = {
      new: { light: 0, side: 'none' },
      waxing_crescent: { light: 25, side: 'right' },
      first_quarter: { light: 50, side: 'right' },
      waxing_gibbous: { light: 75, side: 'right' },
      full: { light: 100, side: 'full' },
      waning_gibbous: { light: 75, side: 'left' },
      last_quarter: { light: 50, side: 'left' },
      waning_crescent: { light: 25, side: 'left' },
    };
    
    const phaseInfo = phases[moon.phase] || phases.full;
    const moonSize = size === 'small' ? 50 : 70;
    
    return (
      <View style={[styles.moonVisual, { width: moonSize, height: moonSize }]}>
        {/* Ay arka planı (karanlık) */}
        <View style={[styles.moonBase, { width: moonSize, height: moonSize }]} />
        
        {/* Aydınlık kısım */}
        {phaseInfo.side !== 'none' && (
          <View
            style={[
              styles.moonLight,
              {
                width: phaseInfo.side === 'full' ? moonSize : moonSize * (phaseInfo.light / 100),
                height: moonSize,
                [phaseInfo.side === 'left' ? 'left' : 'right']: 0,
                borderTopLeftRadius: phaseInfo.side === 'left' || phaseInfo.side === 'full' ? moonSize / 2 : 0,
                borderBottomLeftRadius: phaseInfo.side === 'left' || phaseInfo.side === 'full' ? moonSize / 2 : 0,
                borderTopRightRadius: phaseInfo.side === 'right' || phaseInfo.side === 'full' ? moonSize / 2 : 0,
                borderBottomRightRadius: phaseInfo.side === 'right' || phaseInfo.side === 'full' ? moonSize / 2 : 0,
              }
            ]}
          />
        )}
      </View>
    );
  };

  const defaultGradient: [string, string] = [theme.background, theme.background];
  const gradientColors = theme.backgroundGradient ?? defaultGradient;

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, styles[size]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>🌙 Ay Fazı</Text>
          {size !== 'small' && current && (
            <Text style={[styles.location, { color: theme.textSecondary }]}>{current.location}</Text>
          )}
        </View>

        {/* Ana içerik */}
        <View style={styles.mainContent}>
          {/* Ay görseli veya emoji */}
          <View style={styles.moonContainer}>
            {size === 'small' ? (
              <Text style={styles.moonEmoji}>{moon.emoji}</Text>
            ) : (
              renderMoonVisual()
            )}
          </View>

          {/* Bilgiler */}
          <View style={styles.moonInfo}>
            <Text style={[styles.phaseName, { color: theme.textPrimary }]}>
              {moon.phaseName}
            </Text>
            <Text style={[styles.illumination, { color: theme.textSecondary }]}>
              %{moon.illumination} aydınlık
            </Text>
          </View>
        </View>

        {/* Sonraki fazlar (medium ve large için) */}
        {size !== 'small' && (
          <View style={styles.nextPhases}>
            <View style={styles.nextPhaseItem}>
              <Text style={styles.nextPhaseEmoji}>🌑</Text>
              <View>
                <Text style={[styles.nextPhaseLabel, { color: theme.textSecondary }]}>Yeni Ay</Text>
                <Text style={[styles.nextPhaseValue, { color: theme.textPrimary }]}>
                  {nextPhases.nextNew} gün
                </Text>
              </View>
            </View>
            <View style={styles.nextPhaseItem}>
              <Text style={styles.nextPhaseEmoji}>🌕</Text>
              <View>
                <Text style={[styles.nextPhaseLabel, { color: theme.textSecondary }]}>Dolunay</Text>
                <Text style={[styles.nextPhaseValue, { color: theme.textPrimary }]}>
                  {nextPhases.nextFull} gün
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Ek bilgiler (large için) */}
        {size === 'large' && (
          <View style={styles.extraInfo}>
            <Text style={[styles.extraTitle, { color: theme.textSecondary }]}>
              Ay Takvimi
            </Text>
            <View style={styles.moonCalendar}>
              {['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'].map((emoji, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.calendarItem,
                    getMoonPhaseIndex(moon.phase) === index && styles.calendarItemActive
                  ]}
                >
                  <Text style={styles.calendarEmoji}>{emoji}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.cycleInfo, { color: theme.textSecondary }]}>
              Ay döngüsü: ~29.5 gün
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

// Ay fazı indeksi
function getMoonPhaseIndex(phase: string): number {
  const phases = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 
                  'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
  return phases.indexOf(phase);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 14,
  },
  small: {
    width: 155,
    height: 155,
  },
  medium: {
    width: 330,
    height: 155,
  },
  large: {
    width: 330,
    height: 330,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 11,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  moonContainer: {
    marginRight: 16,
  },
  moonEmoji: {
    fontSize: 48,
  },
  moonVisual: {
    position: 'relative',
    overflow: 'hidden',
  },
  moonBase: {
    position: 'absolute',
    backgroundColor: '#2C3E50',
    borderRadius: 100,
  },
  moonLight: {
    position: 'absolute',
    backgroundColor: '#F5F5DC',
  },
  moonInfo: {
    alignItems: 'flex-start',
  },
  phaseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  illumination: {
    fontSize: 14,
  },
  nextPhases: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  nextPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextPhaseEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  nextPhaseLabel: {
    fontSize: 10,
  },
  nextPhaseValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  extraInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  extraTitle: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  moonCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarItem: {
    padding: 4,
    borderRadius: 8,
  },
  calendarItemActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  calendarEmoji: {
    fontSize: 20,
  },
  cycleInfo: {
    fontSize: 11,
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default MoonPhaseWidget;
