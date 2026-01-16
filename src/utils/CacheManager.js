/**
 * CacheManager - Multi-tier caching system with configurable TTL
 * 
 * Supports both memory cache (Map) and local storage cache with automatic expiration.
 * Different cache types have different TTL and storage strategies.
 */

class CacheManager {
  constructor() {
    // Memory cache using Map for fast access
    this.memoryCache = new Map();
    
    // Local storage reference
    this.storageCache = window.localStorage;
    
    // Cache configuration for different data types
    this.cacheConfig = {
      orderList: { ttl: 5 * 60 * 1000, storage: 'memory' },      // 5 minutes
      orderDetail: { ttl: 10 * 60 * 1000, storage: 'local' },    // 10 minutes
      statistics: { ttl: 15 * 60 * 1000, storage: 'local' },     // 15 minutes
      userInfo: { ttl: 60 * 60 * 1000, storage: 'local' }        // 1 hour
    };
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {string} type - Cache type (orderList, orderDetail, statistics, userInfo)
   */
  set(key, value, type = 'orderList') {
    const config = this.cacheConfig[type];
    if (!config) {
      console.warn(`Unknown cache type: ${type}`);
      return;
    }

    const cacheData = {
      value,
      timestamp: Date.now(),
      ttl: config.ttl
    };

    if (config.storage === 'memory') {
      this.memoryCache.set(key, cacheData);
    } else {
      try {
        this.storageCache.setItem(key, JSON.stringify(cacheData));
      } catch (e) {
        // Handle QuotaExceededError
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.warn('LocalStorage full, clearing old cache');
          this.clearOldCache();
          // Retry after clearing
          try {
            this.storageCache.setItem(key, JSON.stringify(cacheData));
          } catch (retryError) {
            console.error('Failed to store in cache after cleanup:', retryError);
            // Fall back to memory cache
            this.memoryCache.set(key, cacheData);
          }
        } else {
          console.error('Error storing in cache:', e);
        }
      }
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @param {string} type - Cache type
   * @returns {*} Cached value or null if not found/expired
   */
  get(key, type = 'orderList') {
    const config = this.cacheConfig[type];
    if (!config) {
      console.warn(`Unknown cache type: ${type}`);
      return null;
    }

    let cacheData;

    if (config.storage === 'memory') {
      cacheData = this.memoryCache.get(key);
    } else {
      try {
        const stored = this.storageCache.getItem(key);
        cacheData = stored ? JSON.parse(stored) : null;
      } catch (e) {
        console.error('Error parsing cache data:', e);
        return null;
      }
    }

    if (!cacheData) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - cacheData.timestamp > cacheData.ttl) {
      this.delete(key, type);
      return null;
    }

    return cacheData.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @param {string} type - Cache type
   */
  delete(key, type = 'orderList') {
    const config = this.cacheConfig[type];
    if (!config) {
      console.warn(`Unknown cache type: ${type}`);
      return;
    }

    if (config.storage === 'memory') {
      this.memoryCache.delete(key);
    } else {
      this.storageCache.removeItem(key);
    }
  }

  /**
   * Clear old/expired cache entries from local storage
   */
  clearOldCache() {
    const now = Date.now();
    const keysToRemove = [];

    // Iterate through all localStorage keys
    for (let i = 0; i < this.storageCache.length; i++) {
      const key = this.storageCache.key(i);
      if (!key) continue;

      try {
        const data = JSON.parse(this.storageCache.getItem(key));
        // Check if it's a cache entry with timestamp and ttl
        if (data && data.timestamp && data.ttl) {
          if (now - data.timestamp > data.ttl) {
            keysToRemove.push(key);
          }
        }
      } catch (e) {
        // Ignore non-JSON data or parsing errors
      }
    }

    // Remove expired entries
    keysToRemove.forEach(key => {
      this.storageCache.removeItem(key);
    });

    console.log(`Cleared ${keysToRemove.length} expired cache entries`);
  }

  /**
   * Clear cache by type or all cache
   * @param {string} type - Cache type to clear, or undefined to clear all
   */
  clear(type) {
    if (type) {
      const config = this.cacheConfig[type];
      if (!config) {
        console.warn(`Unknown cache type: ${type}`);
        return;
      }

      if (config.storage === 'memory') {
        // Clear all memory cache entries (we don't track by type in memory)
        this.memoryCache.clear();
      } else {
        // Clear local storage entries that match the type
        const keysToRemove = [];
        for (let i = 0; i < this.storageCache.length; i++) {
          const key = this.storageCache.key(i);
          if (key && key.startsWith(type)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          this.storageCache.removeItem(key);
        });
      }
    } else {
      // Clear all cache
      this.memoryCache.clear();
      this.storageCache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;

    for (let i = 0; i < this.storageCache.length; i++) {
      const key = this.storageCache.key(i);
      if (key) {
        try {
          const data = JSON.parse(this.storageCache.getItem(key));
          if (data && data.timestamp && data.ttl) {
            localStorageSize++;
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    return {
      memoryCache: memorySize,
      localStorage: localStorageSize,
      total: memorySize + localStorageSize
    };
  }
}

// Export singleton instance
export default new CacheManager();
