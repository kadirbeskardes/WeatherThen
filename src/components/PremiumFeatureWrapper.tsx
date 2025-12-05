/**
 * Premium Feature Wrapper
 * Premium özellikler için sarmalayıcı bileşen
 * Premium olmayan kullanıcılara bulanık önizleme ve premium banner gösterir
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '../context/PremiumContext';
import { PremiumFeature } from '../types/premium';
import { ThemeColors } from '../utils/themeUtils';

interface PremiumFeatureWrapperProps {
  feature: PremiumFeature;
  theme: ThemeColors;
  language: 'tr' | 'en';
  children: React.ReactNode;
  onUpgradePress?: () => void;
  showPreview?: boolean;
}

export const PremiumFeatureWrapper: React.FC<PremiumFeatureWrapperProps> = ({
  feature,
  theme,
  language,
  children,
  onUpgradePress,
  showPreview = true,
}) => {
  const { hasFeature, getFeatureInfo } = usePremium();
  
  // Premium kullanıcı - direkt içeriği göster
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  const featureInfo = getFeatureInfo(feature, language);
  
  // Premium olmayan kullanıcı - bulanık önizleme ve upgrade banner
  return (
    <View style={styles.container}>
      {showPreview && (
        <View style={styles.previewContainer}>
          <View style={styles.blurOverlay}>
            {children}
          </View>
          <View style={[styles.overlay, { backgroundColor: theme.card }]} />
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.premiumBanner, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={onUpgradePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <Text style={styles.crownIcon}>👑</Text>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>
                  {featureInfo.emoji} {featureInfo.title}
                </Text>
                <Text style={styles.bannerSubtitle}>
                  {language === 'tr' ? 'Premium özellik' : 'Premium feature'}
                </Text>
              </View>
            </View>
            <View style={styles.unlockButton}>
              <Text style={styles.unlockText}>
                {language === 'tr' ? 'Aç' : 'Unlock'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Premium Badge
 * Küçük premium rozeti
 */
interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = 'medium', style }) => {
  const sizeStyles = {
    small: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
    medium: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 3 },
    large: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 4 },
  };
  
  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.badge, { paddingHorizontal: sizeStyles[size].paddingHorizontal, paddingVertical: sizeStyles[size].paddingVertical }, style]}
    >
      <Text style={[styles.badgeText, { fontSize: sizeStyles[size].fontSize }]}>
        👑 PRO
      </Text>
    </LinearGradient>
  );
};

/**
 * Premium Lock Icon
 * Kilit ikonu overlay'i
 */
interface PremiumLockOverlayProps {
  theme: ThemeColors;
  language: 'tr' | 'en';
  onPress?: () => void;
  compact?: boolean;
}

export const PremiumLockOverlay: React.FC<PremiumLockOverlayProps> = ({ 
  theme, 
  language, 
  onPress,
  compact = false,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.lockOverlay, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.lockContent}>
        <Text style={styles.lockIcon}>🔒</Text>
        {!compact && (
          <>
            <Text style={[styles.lockTitle, { color: theme.text }]}>
              {language === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
            </Text>
            <Text style={[styles.lockSubtitle, { color: theme.textSecondary }]}>
              {language === 'tr' ? 'Premium\'a yükselt' : 'Upgrade to Premium'}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  previewContainer: {
    position: 'relative',
    opacity: 0.3,
  },
  blurOverlay: {
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  premiumBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  premiumGradient: {
    padding: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crownIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#4A4A4A',
    marginTop: 2,
  },
  unlockButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  unlockText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  lockContent: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  lockSubtitle: {
    fontSize: 12,
  },
});
