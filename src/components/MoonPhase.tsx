import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../utils/themeUtils';
import { AppSettings } from '../types/settings';

interface MoonPhaseProps {
  theme: ThemeColors;
  settings: AppSettings;
}

const getMoonPhase = (date: Date = new Date()): { phase: number; name: string; emoji: string; illumination: number } => {
  // Calculate moon phase using the synodic month (29.53 days)
  const LUNAR_CYCLE = 29.53058867;
  
  // Reference new moon date: January 6, 2000
  const referenceNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const daysSinceReference = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentPhase = (daysSinceReference % LUNAR_CYCLE) / LUNAR_CYCLE;
  
  // Calculate illumination (0 at new moon, 1 at full moon)
  const illumination = Math.round((1 - Math.cos(currentPhase * 2 * Math.PI)) / 2 * 100);
  
  return {
    phase: currentPhase,
    ...getPhaseDetails(currentPhase),
    illumination,
  };
};

const getPhaseDetails = (phase: number): { name: string; emoji: string } => {
  if (phase < 0.0625) return { name: 'new_moon', emoji: '🌑' };
  if (phase < 0.1875) return { name: 'waxing_crescent', emoji: '🌒' };
  if (phase < 0.3125) return { name: 'first_quarter', emoji: '🌓' };
  if (phase < 0.4375) return { name: 'waxing_gibbous', emoji: '🌔' };
  if (phase < 0.5625) return { name: 'full_moon', emoji: '🌕' };
  if (phase < 0.6875) return { name: 'waning_gibbous', emoji: '🌖' };
  if (phase < 0.8125) return { name: 'last_quarter', emoji: '🌗' };
  if (phase < 0.9375) return { name: 'waning_crescent', emoji: '🌘' };
  return { name: 'new_moon', emoji: '🌑' };
};

const getPhaseTranslation = (name: string, language: 'tr' | 'en'): string => {
  const translations: Record<string, Record<string, string>> = {
    new_moon: { tr: 'Yeni Ay', en: 'New Moon' },
    waxing_crescent: { tr: 'Hilal (Büyüyen)', en: 'Waxing Crescent' },
    first_quarter: { tr: 'İlk Dördün', en: 'First Quarter' },
    waxing_gibbous: { tr: 'Şişkin Ay (Büyüyen)', en: 'Waxing Gibbous' },
    full_moon: { tr: 'Dolunay', en: 'Full Moon' },
    waning_gibbous: { tr: 'Şişkin Ay (Küçülen)', en: 'Waning Gibbous' },
    last_quarter: { tr: 'Son Dördün', en: 'Last Quarter' },
    waning_crescent: { tr: 'Hilal (Küçülen)', en: 'Waning Crescent' },
  };
  return translations[name]?.[language] || name;
};

export const MoonPhase: React.FC<MoonPhaseProps> = ({ theme, settings }) => {
  const moonInfo = getMoonPhase();
  const phaseName = getPhaseTranslation(moonInfo.name, settings.language);
  
  // Get next phases
  const getNextPhaseDate = (targetPhase: number): Date => {
    const now = new Date();
    const LUNAR_CYCLE = 29.53058867;
    const referenceNewMoon = new Date(2000, 0, 6, 18, 14, 0);
    const daysSinceReference = (now.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const currentPhase = (daysSinceReference % LUNAR_CYCLE) / LUNAR_CYCLE;
    
    let daysToTarget = (targetPhase - currentPhase) * LUNAR_CYCLE;
    if (daysToTarget < 0) daysToTarget += LUNAR_CYCLE;
    
    const targetDate = new Date(now.getTime() + daysToTarget * 24 * 60 * 60 * 1000);
    return targetDate;
  };
  
  const nextFullMoon = getNextPhaseDate(0.5);
  const nextNewMoon = getNextPhaseDate(0);
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };
  
  const daysUntil = (date: Date): number => {
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        🌙 {settings.language === 'tr' ? 'Ay Fazı' : 'Moon Phase'}
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.mainContent}>
          {/* Moon visual */}
          <View style={[styles.moonContainer, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Text style={styles.moonEmoji}>{moonInfo.emoji}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={[styles.phaseName, { color: theme.text }]}>{phaseName}</Text>
            <Text style={[styles.illumination, { color: theme.textSecondary }]}>
              {settings.language === 'tr' ? 'Aydınlanma' : 'Illumination'}: {moonInfo.illumination}%
            </Text>
            
            {/* Illumination bar */}
            <View style={[styles.illuminationBar, { backgroundColor: theme.secondary }]}>
              <View 
                style={[
                  styles.illuminationFill, 
                  { width: `${moonInfo.illumination}%`, backgroundColor: '#FFE082' }
                ]} 
              />
            </View>
          </View>
        </View>
        
        {/* Next phases */}
        <View style={styles.nextPhases}>
          <View style={styles.nextPhaseItem}>
            <Text style={styles.nextPhaseEmoji}>🌕</Text>
            <View style={styles.nextPhaseInfo}>
              <Text style={[styles.nextPhaseLabel, { color: theme.textSecondary }]}>
                {settings.language === 'tr' ? 'Sonraki Dolunay' : 'Next Full Moon'}
              </Text>
              <Text style={[styles.nextPhaseDate, { color: theme.text }]}>
                {formatDate(nextFullMoon)} ({daysUntil(nextFullMoon)} {settings.language === 'tr' ? 'gün' : 'days'})
              </Text>
            </View>
          </View>
          
          <View style={styles.nextPhaseItem}>
            <Text style={styles.nextPhaseEmoji}>🌑</Text>
            <View style={styles.nextPhaseInfo}>
              <Text style={[styles.nextPhaseLabel, { color: theme.textSecondary }]}>
                {settings.language === 'tr' ? 'Sonraki Yeni Ay' : 'Next New Moon'}
              </Text>
              <Text style={[styles.nextPhaseDate, { color: theme.text }]}>
                {formatDate(nextNewMoon)} ({daysUntil(nextNewMoon)} {settings.language === 'tr' ? 'gün' : 'days'})
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moonEmoji: {
    fontSize: 48,
  },
  infoContainer: {
    flex: 1,
  },
  phaseName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  illumination: {
    fontSize: 13,
    marginBottom: 8,
  },
  illuminationBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  illuminationFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextPhases: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    gap: 10,
  },
  nextPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextPhaseEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  nextPhaseInfo: {
    flex: 1,
  },
  nextPhaseLabel: {
    fontSize: 11,
  },
  nextPhaseDate: {
    fontSize: 13,
    fontWeight: '600',
  },
});
