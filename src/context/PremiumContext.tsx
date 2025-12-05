/**
 * Premium Context
 * Premium abonelik durumunu yöneten context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  PremiumStatus, 
  PremiumFeature, 
  PremiumTier,
  FREE_FAVORITES_LIMIT,
  PREMIUM_FEATURE_INFO,
} from '../types/premium';

interface PremiumContextType {
  premiumStatus: PremiumStatus;
  isPremium: boolean;
  hasFeature: (feature: PremiumFeature) => boolean;
  canAddFavorite: (currentCount: number) => boolean;
  getFavoritesLimit: () => number;
  activatePremium: (expiresAt?: Date) => Promise<void>;
  deactivatePremium: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  getFeatureInfo: (feature: PremiumFeature, language: 'tr' | 'en') => { title: string; description: string; emoji: string };
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const PREMIUM_STORAGE_KEY = '@WeatherThen:premium_v1'; // Versiyonlu key - güvenlik için

const defaultPremiumStatus: PremiumStatus = {
  tier: 'free',
  isPremium: false,
};

// Basit bütünlük kontrolü
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>(defaultPremiumStatus);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      const storedChecksum = await AsyncStorage.getItem(`${PREMIUM_STORAGE_KEY}_checksum`);
      
      if (stored) {
        // Checksum doğrulaması
        const expectedChecksum = generateChecksum(stored);
        if (storedChecksum && storedChecksum !== expectedChecksum) {
          // Veri manipüle edilmiş, temizle
          console.warn('Premium data integrity check failed');
          await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
          await AsyncStorage.removeItem(`${PREMIUM_STORAGE_KEY}_checksum`);
          setIsLoaded(true);
          return;
        }
        
        const parsed = JSON.parse(stored);
        
        // Veri validasyonu
        if (typeof parsed.isPremium !== 'boolean' || 
            !['free', 'premium'].includes(parsed.tier)) {
          console.warn('Invalid premium data structure');
          await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
          await AsyncStorage.removeItem(`${PREMIUM_STORAGE_KEY}_checksum`);
          setIsLoaded(true);
          return;
        }
        
        // Check if premium has expired
        if (parsed.expiresAt) {
          const expiresAt = new Date(parsed.expiresAt);
          if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
            // Premium expired veya geçersiz tarih
            setPremiumStatus(defaultPremiumStatus);
            await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
            await AsyncStorage.removeItem(`${PREMIUM_STORAGE_KEY}_checksum`);
          } else {
            setPremiumStatus({
              ...parsed,
              expiresAt,
              purchasedAt: parsed.purchasedAt ? new Date(parsed.purchasedAt) : undefined,
            });
          }
        } else {
          // Lifetime premium
          setPremiumStatus(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
      // Hata durumunda güvenli mod
      await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
      await AsyncStorage.removeItem(`${PREMIUM_STORAGE_KEY}_checksum`);
    }
    setIsLoaded(true);
  };

  const isPremium = useMemo(() => premiumStatus.isPremium, [premiumStatus.isPremium]);

  const hasFeature = useCallback((feature: PremiumFeature): boolean => {
    // Premium kullanıcılar tüm özelliklere erişebilir
    if (premiumStatus.isPremium) {
      return true;
    }
    
    // Ücretsiz kullanıcılar için kısıtlı özellikler
    // Bazı temel özellikler ücretsiz
    const freeFeatures: PremiumFeature[] = [];
    return freeFeatures.includes(feature);
  }, [premiumStatus.isPremium]);

  const canAddFavorite = useCallback((currentCount: number): boolean => {
    if (premiumStatus.isPremium) {
      return true;
    }
    return currentCount < FREE_FAVORITES_LIMIT;
  }, [premiumStatus.isPremium]);

  const getFavoritesLimit = useCallback((): number => {
    if (premiumStatus.isPremium) {
      return Infinity;
    }
    return FREE_FAVORITES_LIMIT;
  }, [premiumStatus.isPremium]);

  const activatePremium = useCallback(async (expiresAt?: Date) => {
    const newStatus: PremiumStatus = {
      tier: 'premium',
      isPremium: true,
      expiresAt,
      purchasedAt: new Date(),
    };
    
    setPremiumStatus(newStatus);
    
    try {
      const dataToStore = JSON.stringify({
        ...newStatus,
        expiresAt: expiresAt?.toISOString(),
        purchasedAt: newStatus.purchasedAt?.toISOString(),
      });
      
      // Veriyi ve checksum'ı kaydet
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, dataToStore);
      await AsyncStorage.setItem(`${PREMIUM_STORAGE_KEY}_checksum`, generateChecksum(dataToStore));
    } catch (error) {
      console.error('Failed to save premium status:', error);
    }
  }, []);

  const deactivatePremium = useCallback(async () => {
    setPremiumStatus(defaultPremiumStatus);
    
    try {
      await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
      await AsyncStorage.removeItem(`${PREMIUM_STORAGE_KEY}_checksum`);
    } catch (error) {
      console.error('Failed to remove premium status:', error);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // Bu fonksiyon gerçek uygulamada App Store/Play Store ile iletişim kurar
    // Şimdilik simüle ediyoruz
    try {
      // TODO: Implement actual restore purchases logic
      // const purchases = await InAppPurchases.restorePurchases();
      // if (purchases.length > 0) { ... }
      return false;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    }
  }, []);

  const getFeatureInfo = useCallback((feature: PremiumFeature, language: 'tr' | 'en') => {
    const info = PREMIUM_FEATURE_INFO[feature];
    return {
      title: language === 'tr' ? info.titleTr : info.titleEn,
      description: language === 'tr' ? info.descriptionTr : info.descriptionEn,
      emoji: info.emoji,
    };
  }, []);

  const contextValue = useMemo(() => ({
    premiumStatus,
    isPremium,
    hasFeature,
    canAddFavorite,
    getFavoritesLimit,
    activatePremium,
    deactivatePremium,
    restorePurchases,
    getFeatureInfo,
  }), [
    premiumStatus,
    isPremium,
    hasFeature,
    canAddFavorite,
    getFavoritesLimit,
    activatePremium,
    deactivatePremium,
    restorePurchases,
    getFeatureInfo,
  ]);

  if (!isLoaded) {
    return null;
  }

  return (
    <PremiumContext.Provider value={contextValue}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
