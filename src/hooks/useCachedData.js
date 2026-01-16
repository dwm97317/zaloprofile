/**
 * useCachedData Hook
 * 
 * A React hook that wraps CacheManager to provide automatic caching
 * for API calls with cache-first strategy and force refresh capability.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import CacheManager from '../utils/CacheManager';

/**
 * Hook for fetching data with automatic caching
 * 
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function that fetches the data
 * @param {string} type - Cache type (orderList, orderDetail, statistics, userInfo)
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether to fetch automatically (default: true)
 * @param {Array} options.dependencies - Dependencies that trigger refetch
 * @returns {Object} { data, loading, error, refresh, clearCache }
 */
export const useCachedData = (key, fetcher, type = 'orderList', options = {}) => {
  const { enabled = true, dependencies = [] } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  /**
   * Fetch data with cache-first strategy
   * @param {boolean} forceRefresh - Skip cache and fetch fresh data
   */
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!key || !fetcherRef.current) {
      return;
    }

    // Try to get from cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = CacheManager.get(key, type);
      if (cached !== null) {
        if (isMountedRef.current) {
          setData(cached);
          setError(null);
        }
        return cached;
      }
    }

    // Fetch from server
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await fetcherRef.current();
      
      // Store in cache
      CacheManager.set(key, result, type);
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
      }
      
      return result;
    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (isMountedRef.current) {
        setError(err);
        
        // Try to use stale cache data as fallback
        const staleCache = CacheManager.get(key, type);
        if (staleCache !== null) {
          setData(staleCache);
        }
      }
      
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [key, type]);

  /**
   * Force refresh data (skip cache)
   */
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  /**
   * Clear cache for this key
   */
  const clearCache = useCallback(() => {
    CacheManager.delete(key, type);
  }, [key, type]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache: data !== null && !loading
  };
};

/**
 * Hook for prefetching data into cache
 * 
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function that fetches the data
 * @param {string} type - Cache type
 * @returns {Function} prefetch - Function to trigger prefetch
 */
export const usePrefetch = (key, fetcher, type = 'orderList') => {
  const prefetch = useCallback(async () => {
    // Check if already in cache
    const cached = CacheManager.get(key, type);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    try {
      const result = await fetcher();
      CacheManager.set(key, result, type);
      return result;
    } catch (err) {
      console.error('Error prefetching data:', err);
      throw err;
    }
  }, [key, fetcher, type]);

  return prefetch;
};

/**
 * Hook for invalidating cache
 * 
 * @param {string} type - Cache type to invalidate
 * @returns {Function} invalidate - Function to invalidate cache
 */
export const useInvalidateCache = (type) => {
  const invalidate = useCallback((key) => {
    if (key) {
      CacheManager.delete(key, type);
    } else {
      CacheManager.clear(type);
    }
  }, [type]);

  return invalidate;
};

export default useCachedData;
