import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../types/weather';

interface FavoriteLocation extends LocationData {
  id: string;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: FavoriteLocation[];
  addFavorite: (location: LocationData) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (latitude: number, longitude: number) => boolean;
  reorderFavorites: (newOrder: FavoriteLocation[]) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@WeatherThen:favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate data structure
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter(f => f && f.id && f.latitude && f.longitude));
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = useCallback(async (newFavorites: FavoriteLocation[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  const addFavorite = useCallback(async (location: LocationData) => {
    setFavorites(prevFavorites => {
      const exists = prevFavorites.some(
        f => Math.abs(f.latitude - location.latitude) < 0.01 && 
             Math.abs(f.longitude - location.longitude) < 0.01
      );
      
      if (exists) return prevFavorites;
      
      const newFavorite: FavoriteLocation = {
        ...location,
        id: `${location.latitude}-${location.longitude}-${Date.now()}`,
        addedAt: Date.now(),
      };
      
      const newFavorites = [...prevFavorites, newFavorite];
      // Save asynchronously without blocking
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites)).catch(console.error);
      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback(async (id: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.filter(f => f.id !== id);
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites)).catch(console.error);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((latitude: number, longitude: number): boolean => {
    return favorites.some(
      f => Math.abs(f.latitude - latitude) < 0.01 && 
           Math.abs(f.longitude - longitude) < 0.01
    );
  }, [favorites]);

  const reorderFavorites = useCallback(async (newOrder: FavoriteLocation[]) => {
    setFavorites(newOrder);
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newOrder)).catch(console.error);
  }, []);

  const contextValue = useMemo(() => ({
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    reorderFavorites,
  }), [favorites, addFavorite, removeFavorite, isFavorite, reorderFavorites]);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
