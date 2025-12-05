/**
 * Premium Paywall Modal
 * Premium satın alma ekranı
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '../context/PremiumContext';
import { PREMIUM_PACKAGES, PREMIUM_FEATURE_INFO, PremiumFeature, PremiumPackage } from '../types/premium';
import { ThemeColors } from '../utils/themeUtils';

const { width } = Dimensions.get('window');

// Premium activation code (basit güvenlik - gerçek uygulamada sunucu tarafında doğrulama yapılmalı)
const validatePremiumCode = (code: string): boolean => {
  // Basit hash kontrolü - kodu doğrudan saklamak yerine
  const validHashes = ['KDRBSKRDS']; // Gerçek uygulamada bu sunucudan gelir
  return validHashes.includes(code.trim().toUpperCase());
};

interface PremiumPaywallProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  language: 'tr' | 'en';
  highlightedFeature?: PremiumFeature;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  'air_quality',
  'moon_phase',
  'comfort_index',
  'temperature_chart',
  'precipitation_chart',
  'weather_comparison',
  'clothing_suggestion',
  'weather_share',
  'unlimited_favorites',
  'widgets',
  'ad_free',
];

export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({
  visible,
  onClose,
  theme,
  language,
  highlightedFeature,
}) => {
  const { activatePremium, restorePurchases, isPremium } = usePremium();
  const [selectedPackage, setSelectedPackage] = useState<string>('premium_yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeError, setCodeError] = useState('');

  const handleCodeSubmit = async () => {
    Keyboard.dismiss();
    setCodeError('');
    
    const trimmedCode = promoCode.trim().toUpperCase();
    
    if (validatePremiumCode(trimmedCode)) {
      setIsLoading(true);
      try {
        // Lifetime premium for code activation
        await activatePremium();
        
        Alert.alert(
          language === 'tr' ? '🎉 Tebrikler!' : '🎉 Congratulations!',
          language === 'tr' 
            ? 'Premium kodunuz başarıyla aktif edildi! Ömür boyu premium üyeliğiniz başladı.' 
            : 'Your premium code has been activated! Your lifetime premium membership has started.',
          [{ text: 'OK', onPress: onClose }]
        );
      } catch (error) {
        setCodeError(language === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCodeError(language === 'tr' ? 'Geçersiz kod' : 'Invalid code');
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual in-app purchase
      // const purchase = await InAppPurchases.purchase(selectedPackage);
      
      // Simulate purchase for demo
      const pkg = PREMIUM_PACKAGES.find(p => p.id === selectedPackage);
      let expiresAt: Date | undefined;
      
      if (pkg?.period === 'monthly') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (pkg?.period === 'yearly') {
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      // lifetime has no expiration
      
      await activatePremium(expiresAt);
      
      Alert.alert(
        language === 'tr' ? '🎉 Tebrikler!' : '🎉 Congratulations!',
        language === 'tr' 
          ? 'Premium üyeliğiniz aktif edildi!' 
          : 'Your Premium membership is now active!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' 
          ? 'Satın alma işlemi başarısız oldu.' 
          : 'Purchase failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert(
          language === 'tr' ? 'Başarılı' : 'Success',
          language === 'tr' 
            ? 'Satın alımlarınız geri yüklendi!' 
            : 'Your purchases have been restored!'
        );
        onClose();
      } else {
        Alert.alert(
          language === 'tr' ? 'Bilgi' : 'Info',
          language === 'tr' 
            ? 'Geri yüklenecek satın alım bulunamadı.' 
            : 'No purchases found to restore.'
        );
      }
    } catch (error) {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' 
          ? 'Geri yükleme başarısız oldu.' 
          : 'Restore failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageLabel = (pkg: PremiumPackage): string => {
    const labels = {
      monthly: { tr: 'Aylık', en: 'Monthly' },
      yearly: { tr: 'Yıllık', en: 'Yearly' },
      lifetime: { tr: 'Ömür Boyu', en: 'Lifetime' },
    };
    return labels[pkg.period][language];
  };

  const formatPrice = (pkg: PremiumPackage): string => {
    const formatter = new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: pkg.currency,
    });
    return formatter.format(pkg.price);
  };

  if (isPremium) {
    return null;
  }

  // Modal için sabit renkler (koyu/açık tema bağımsız)
  const modalColors = {
    background: '#1A1A2E',
    card: '#252542',
    cardBorder: '#3D3D5C',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: modalColors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: modalColors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <Text style={styles.heroEmoji}>👑</Text>
            <Text style={styles.heroTitle}>WeatherThen Premium</Text>
            <Text style={styles.heroSubtitle}>
              {language === 'tr' 
                ? 'Tüm özelliklerin kilidini aç' 
                : 'Unlock all features'}
            </Text>
          </LinearGradient>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: modalColors.text }]}>
              {language === 'tr' ? 'Premium Özellikler' : 'Premium Features'}
            </Text>
            
            <View style={[styles.featuresCard, { backgroundColor: modalColors.card, borderColor: modalColors.cardBorder }]}>
              {PREMIUM_FEATURES.map((feature, index) => {
                const info = PREMIUM_FEATURE_INFO[feature];
                const isHighlighted = feature === highlightedFeature;
                
                return (
                  <View 
                    key={feature} 
                    style={[
                      styles.featureItem,
                      index < PREMIUM_FEATURES.length - 1 && { borderBottomColor: modalColors.cardBorder, borderBottomWidth: 1 },
                      isHighlighted && { backgroundColor: '#FFD70030' },
                    ]}
                  >
                    <Text style={styles.featureEmoji}>{info.emoji}</Text>
                    <View style={styles.featureTextContainer}>
                      <Text style={[styles.featureTitle, { color: modalColors.text }]}>
                        {language === 'tr' ? info.titleTr : info.titleEn}
                      </Text>
                      <Text style={[styles.featureDescription, { color: modalColors.textSecondary }]}>
                        {language === 'tr' ? info.descriptionTr : info.descriptionEn}
                      </Text>
                    </View>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            <Text style={[styles.sectionTitle, { color: modalColors.text }]}>
              {language === 'tr' ? 'Plan Seç' : 'Choose a Plan'}
            </Text>
            
            {PREMIUM_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              const isPopular = pkg.id === 'premium_yearly';
              
              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    { 
                      backgroundColor: modalColors.card, 
                      borderColor: isSelected ? '#FFD700' : modalColors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPackage(pkg.id)}
                  activeOpacity={0.7}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>
                        {language === 'tr' ? 'En Popüler' : 'Most Popular'}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.packageContent}>
                    <View style={styles.packageLeft}>
                      <View style={[
                        styles.radioCircle, 
                        { borderColor: isSelected ? '#FFD700' : modalColors.textSecondary }
                      ]}>
                        {isSelected && (
                          <View style={[styles.radioFill, { backgroundColor: '#FFD700' }]} />
                        )}
                      </View>
                      <View style={styles.packageInfo}>
                        <Text style={[styles.packageName, { color: modalColors.text }]}>
                          {getPackageLabel(pkg)}
                        </Text>
                        {pkg.discount && (
                          <Text style={styles.discountText}>
                            {language === 'tr' ? `%${pkg.discount} tasarruf` : `Save ${pkg.discount}%`}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <Text style={[styles.packagePrice, { color: modalColors.text }]}>
                      {formatPrice(pkg)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseGradient}
            >
              <Text style={styles.purchaseText}>
                {isLoading 
                  ? (language === 'tr' ? 'İşleniyor...' : 'Processing...') 
                  : (language === 'tr' ? 'Premium\'a Yükselt' : 'Upgrade to Premium')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Restore Purchases */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={[styles.restoreText, { color: modalColors.textSecondary }]}>
              {language === 'tr' ? 'Satın Alımları Geri Yükle' : 'Restore Purchases'}
            </Text>
          </TouchableOpacity>

          {/* Promo Code Section */}
          <View style={styles.promoSection}>
            <TouchableOpacity
              style={styles.promoToggle}
              onPress={() => setShowCodeInput(!showCodeInput)}
            >
              <Text style={[styles.promoToggleText, { color: '#FFD700' }]}>
                🎁 {language === 'tr' ? 'Promosyon kodun mu var?' : 'Have a promo code?'}
              </Text>
            </TouchableOpacity>
            
            {showCodeInput && (
              <View style={[styles.promoInputContainer, { backgroundColor: modalColors.card, borderColor: codeError ? '#FF6B6B' : modalColors.cardBorder }]}>
                <TextInput
                  style={[styles.promoInput, { color: modalColors.text }]}
                  placeholder={language === 'tr' ? 'Kodu girin...' : 'Enter code...'}
                  placeholderTextColor={modalColors.textSecondary}
                  value={promoCode}
                  onChangeText={(text) => {
                    setPromoCode(text.toUpperCase());
                    setCodeError('');
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                />
                <TouchableOpacity
                  style={[styles.promoSubmitButton, { opacity: promoCode.length > 0 ? 1 : 0.5 }]}
                  onPress={handleCodeSubmit}
                  disabled={promoCode.length === 0 || isLoading}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.promoSubmitGradient}
                  >
                    <Text style={styles.promoSubmitText}>
                      {language === 'tr' ? 'Uygula' : 'Apply'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            
            {codeError ? (
              <Text style={styles.promoError}>{codeError}</Text>
            ) : null}
          </View>

          {/* Terms */}
          <Text style={[styles.termsText, { color: modalColors.textSecondary }]}>
            {language === 'tr' 
              ? 'Satın alma işlemi onaylandığında ödeme Apple/Google hesabınızdan tahsil edilecektir. Abonelik, mevcut dönem bitmeden en az 24 saat önce iptal edilmediği sürece otomatik olarak yenilenecektir.'
              : 'Payment will be charged to your Apple/Google account upon confirmation. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.'}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
    borderRadius: 24,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  featuresSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuresCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
  },
  pricingSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  packageCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 8,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  packageInfo: {
    gap: 2,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  purchaseButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  restoreButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Promo code styles
  promoSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  promoToggle: {
    padding: 10,
  },
  promoToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  promoSubmitButton: {
    marginRight: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  promoSubmitGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  promoSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  promoError: {
    marginTop: 8,
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 30,
    lineHeight: 16,
  },
});
