/**
 * CacheManager Tests
 * 
 * Feature: order-frontend-optimization
 * Tests cache expiration, storage fallback, and basic operations
 */

import CacheManager from '../CacheManager';

describe('CacheManager', () => {
  beforeEach(() => {
    // Clear all cache before each test
    CacheManager.clear();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    CacheManager.clear();
    localStorage.clear();
  });

  describe('Basic Operations', () => {
    test('should set and get value from memory cache', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      
      CacheManager.set(key, value, 'orderList');
      const retrieved = CacheManager.get(key, 'orderList');
      
      expect(retrieved).toEqual(value);
    });

    test('should set and get value from local storage', () => {
      const key = 'test-detail';
      const value = { id: 123, name: 'Test Order' };
      
      CacheManager.set(key, value, 'orderDetail');
      const retrieved = CacheManager.get(key, 'orderDetail');
      
      expect(retrieved).toEqual(value);
    });

    test('should return null for non-existent key', () => {
      const retrieved = CacheManager.get('non-existent', 'orderList');
      expect(retrieved).toBeNull();
    });

    test('should delete value from cache', () => {
      const key = 'test-delete';
      const value = { data: 'to-delete' };
      
      CacheManager.set(key, value, 'orderList');
      expect(CacheManager.get(key, 'orderList')).toEqual(value);
      
      CacheManager.delete(key, 'orderList');
      expect(CacheManager.get(key, 'orderList')).toBeNull();
    });
  });

  describe('Property 2: Cache Expiration Correctness', () => {
    /**
     * Feature: order-frontend-optimization, Property 2: Cache Expiration Correctness
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4
     * 
     * For any cached data with TTL T, retrieving the data after time T has elapsed
     * should return null and trigger a fresh fetch.
     */
    
    test('should return null for expired memory cache', async () => {
      // Override TTL for testing (1ms)
      const originalConfig = CacheManager.cacheConfig.orderList;
      CacheManager.cacheConfig.orderList = { ttl: 1, storage: 'memory' };
      
      const key = 'test-expire';
      const value = { data: 'will-expire' };
      
      CacheManager.set(key, value, 'orderList');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const retrieved = CacheManager.get(key, 'orderList');
      expect(retrieved).toBeNull();
      
      // Restore original config
      CacheManager.cacheConfig.orderList = originalConfig;
    });

    test('should return null for expired local storage cache', async () => {
      // Override TTL for testing (1ms)
      const originalConfig = CacheManager.cacheConfig.orderDetail;
      CacheManager.cacheConfig.orderDetail = { ttl: 1, storage: 'local' };
      
      const key = 'test-expire-local';
      const value = { id: 456, data: 'will-expire' };
      
      CacheManager.set(key, value, 'orderDetail');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const retrieved = CacheManager.get(key, 'orderDetail');
      expect(retrieved).toBeNull();
      
      // Restore original config
      CacheManager.cacheConfig.orderDetail = originalConfig;
    });

    test('should return value before expiration', async () => {
      // Override TTL for testing (100ms)
      const originalConfig = CacheManager.cacheConfig.orderList;
      CacheManager.cacheConfig.orderList = { ttl: 100, storage: 'memory' };
      
      const key = 'test-not-expired';
      const value = { data: 'still-valid' };
      
      CacheManager.set(key, value, 'orderList');
      
      // Wait but not long enough to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const retrieved = CacheManager.get(key, 'orderList');
      expect(retrieved).toEqual(value);
      
      // Restore original config
      CacheManager.cacheConfig.orderList = originalConfig;
    });

    test('should respect different TTLs for different cache types', async () => {
      // Override TTLs for testing
      const originalOrderList = CacheManager.cacheConfig.orderList;
      const originalOrderDetail = CacheManager.cacheConfig.orderDetail;
      
      CacheManager.cacheConfig.orderList = { ttl: 10, storage: 'memory' };
      CacheManager.cacheConfig.orderDetail = { ttl: 100, storage: 'local' };
      
      const key1 = 'short-ttl';
      const key2 = 'long-ttl';
      const value1 = { data: 'short' };
      const value2 = { data: 'long' };
      
      CacheManager.set(key1, value1, 'orderList');
      CacheManager.set(key2, value2, 'orderDetail');
      
      // Wait for short TTL to expire
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(CacheManager.get(key1, 'orderList')).toBeNull();
      expect(CacheManager.get(key2, 'orderDetail')).toEqual(value2);
      
      // Restore original configs
      CacheManager.cacheConfig.orderList = originalOrderList;
      CacheManager.cacheConfig.orderDetail = originalOrderDetail;
    });
  });

  describe('Property 12: Cache Storage Fallback', () => {
    /**
     * Feature: order-frontend-optimization, Property 12: Cache Storage Fallback
     * Validates: Requirements 3.4
     * 
     * For any cache write operation, if local storage is full, the cache manager
     * should clear expired entries before attempting to store new data.
     */
    
    test('should clear old cache when storage is full', () => {
      // Mock localStorage to simulate quota exceeded
      const originalSetItem = Storage.prototype.setItem;
      let callCount = 0;
      
      Storage.prototype.setItem = function(key, value) {
        callCount++;
        if (callCount === 1) {
          // First call throws QuotaExceededError
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          error.code = 22;
          throw error;
        }
        // Second call (after cleanup) succeeds
        return originalSetItem.call(this, key, value);
      };
      
      // Add some expired entries to localStorage
      const expiredData = {
        value: 'old-data',
        timestamp: Date.now() - 1000000, // Very old
        ttl: 1000
      };
      localStorage.setItem('expired-1', JSON.stringify(expiredData));
      localStorage.setItem('expired-2', JSON.stringify(expiredData));
      
      const key = 'new-data';
      const value = { data: 'new' };
      
      // This should trigger cleanup and retry
      CacheManager.set(key, value, 'orderDetail');
      
      // Verify the new data was stored
      const retrieved = CacheManager.get(key, 'orderDetail');
      expect(retrieved).toEqual(value);
      
      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
    });

    test('should fall back to memory cache if local storage fails completely', () => {
      // Mock localStorage to always fail
      const originalSetItem = Storage.prototype.setItem;
      
      Storage.prototype.setItem = function() {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        error.code = 22;
        throw error;
      };
      
      const key = 'fallback-test';
      const value = { data: 'fallback' };
      
      // This should fall back to memory cache
      CacheManager.set(key, value, 'orderDetail');
      
      // Verify the data was stored in memory cache
      const retrieved = CacheManager.get(key, 'orderDetail');
      expect(retrieved).toEqual(value);
      
      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Cache Clearing', () => {
    test('should clear all cache', () => {
      CacheManager.set('key1', 'value1', 'orderList');
      CacheManager.set('key2', 'value2', 'orderDetail');
      
      CacheManager.clear();
      
      expect(CacheManager.get('key1', 'orderList')).toBeNull();
      expect(CacheManager.get('key2', 'orderDetail')).toBeNull();
    });

    test('should clear only expired entries', () => {
      // Add expired entry
      const expiredData = {
        value: 'old',
        timestamp: Date.now() - 1000000,
        ttl: 1000
      };
      localStorage.setItem('expired', JSON.stringify(expiredData));
      
      // Add valid entry
      const validData = {
        value: 'new',
        timestamp: Date.now(),
        ttl: 1000000
      };
      localStorage.setItem('valid', JSON.stringify(validData));
      
      CacheManager.clearOldCache();
      
      expect(localStorage.getItem('expired')).toBeNull();
      expect(localStorage.getItem('valid')).not.toBeNull();
    });
  });

  describe('Cache Statistics', () => {
    test('should return correct cache statistics', () => {
      CacheManager.set('mem1', 'value1', 'orderList');
      CacheManager.set('mem2', 'value2', 'orderList');
      CacheManager.set('local1', 'value3', 'orderDetail');
      
      const stats = CacheManager.getStats();
      
      expect(stats.memoryCache).toBeGreaterThan(0);
      expect(stats.localStorage).toBeGreaterThan(0);
      expect(stats.total).toBe(stats.memoryCache + stats.localStorage);
    });
  });
});
