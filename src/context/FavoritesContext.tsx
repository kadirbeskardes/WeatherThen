import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteLocation[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = async (location: LocationData) => {
    const exists = favorites.some(
      f => Math.abs(f.latitude - location.latitude) < 0.01 && 
           Math.abs(f.longitude - location.longitude) < 0.01
    );
    
    if (exists) return;
    
    const newFavorite: FavoriteLocation = {
      ...location,
      id: `${location.latitude}-${location.longitude}-${Date.now()}`,
      addedAt: Date.now(),
    };
    
    const newFavorites = [...favorites, newFavorite];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (latitude: number, longitude: number): boolean => {
    return favorites.some(
      f => Math.abs(f.latitude - latitude) < 0.01 && 
           Math.abs(f.longitude - longitude) < 0.01
    );
  };

  const reorderFavorites = async (newOrder: FavoriteLocation[]) => {
    await saveFavorites(newOrder);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      reorderFavorites,
    }}>
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
