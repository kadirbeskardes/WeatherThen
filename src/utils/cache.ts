import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
const CACHE_KEYS = {
  WEATHER: '@WeatherThen:weatherCache',
  LOCATION: '@WeatherThen:lastLocation',
  SETTINGS: '@WeatherThen:settings',
};

// Cache durations (in milliseconds)
const CACHE_DURATION = {
  WEATHER: 10 * 60 * 1000, // 10 minutes
  LOCATION: 24 * 60 * 60 * 1000, // 24 hours
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  key: string;
}

const MAX_MEMORY_CACHE_SIZE = 50;

class CacheManager {
  private memoryCache: Map<string, CacheItem<any>> = new Map();

  // Ensure memory cache doesn't grow too large
  private enforceMemoryCacheLimit(): void {
    while (this.memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
  }

  // Get from memory cache first, then AsyncStorage
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      return memoryItem.data as T;
    }

    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as CacheItem<T>;
        // Validate parsed data structure
        if (parsed && typeof parsed.timestamp === 'number' && parsed.data !== undefined) {
          // Store in memory cache
          this.memoryCache.set(key, parsed);
          this.enforceMemoryCacheLimit();
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }
    return null;
  }

  // Set to both memory and AsyncStorage
  async set<T>(key: string, data: T): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      key,
    };

    // Set in memory cache
    this.memoryCache.set(key, cacheItem);
    this.enforceMemoryCacheLimit();

    try {
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  // Check if cache is valid
  async isValid(key: string, duration: number): Promise<boolean> {
    try {
      // Check memory cache first
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem) {
        return Date.now() - memoryItem.timestamp < duration;
      }

      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as CacheItem<any>;
        const isValid = Date.now() - parsed.timestamp < duration;
        if (isValid) {
          // Store in memory for faster access
          this.memoryCache.set(key, parsed);
        }
        return isValid;
      }
    } catch (error) {
      console.warn('Cache validity check error:', error);
    }
    return false;
  }

  // Get with validity check
  async getIfValid<T>(key: string, duration: number): Promise<T | null> {
    const isValid = await this.isValid(key, duration);
    if (isValid) {
      return this.get<T>(key);
    }
    return null;
  }

  // Clear specific cache
  async clear(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // Clear all weather caches
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const weatherKeys = keys.filter(k => k.startsWith('@WeatherThen:'));
      await AsyncStorage.multiRemove(weatherKeys);
    } catch (error) {
      console.warn('Cache clear all error:', error);
    }
  }

  // Preload cache into memory
  async preload(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      const results = await AsyncStorage.multiGet(keys);
      
      results.forEach(([key, value]) => {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            this.memoryCache.set(key, parsed);
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    } catch (error) {
      console.warn('Cache preload error:', error);
    }
  }
}

export const cacheManager = new CacheManager();
export { CACHE_KEYS, CACHE_DURATION };
