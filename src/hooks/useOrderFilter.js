import { useMemo, useState, useCallback } from 'react';

/**
 * Custom hook for filtering and sorting orders on the client side
 * 
 * @param {Array} orders - Array of order objects to filter
 * @returns {Object} - Filtered orders, filter state, and filter setters
 */
export function useOrderFilter(orders = []) {
  const [filters, setFilters] = useState({
    keyword: '',
    dateRange: { start: null, end: null },
    priceRange: { min: 0, max: Infinity },
    warehouses: [], // Array of storage_id
    countries: [], // Array of country_id
    statuses: [], // Array of status codes
    sortBy: 'created_time', // 'created_time' | 'price' | 'weight'
    sortOrder: 'desc', // 'asc' | 'desc'
  });

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    setFilters({
      keyword: '',
      dateRange: { start: null, end: null },
      priceRange: { min: 0, max: Infinity },
      warehouses: [],
      countries: [],
      statuses: [],
      sortBy: 'created_time',
      sortOrder: 'desc',
    });
  }, []);

  /**
   * Filter and sort orders based on current filter state
   */
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return [];
    }

    let result = [...orders];

    // 1. Keyword filtering (case-insensitive, multiple fields)
    if (filters.keyword && filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase().trim();
      result = result.filter(order => {
        const searchableFields = [
          order.order_sn,
          order.express_num,
          order.class_name,
          order.storage?.shop_name,
          order.country?.title,
        ];
        
        return searchableFields.some(field => 
          field && String(field).toLowerCase().includes(keyword)
        );
      });
    }

    // 2. Date range filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(order => {
        if (!order.created_time) return false;
        
        const orderDate = new Date(order.created_time);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        
        return true;
      });
    }

    // 3. Price range filtering
    if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
      result = result.filter(order => {
        const price = parseFloat(order.price) || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // 4. Warehouse filtering (multi-select)
    if (filters.warehouses.length > 0) {
      result = result.filter(order => 
        filters.warehouses.includes(order.storage_id)
      );
    }

    // 5. Country filtering (multi-select)
    if (filters.countries.length > 0) {
      result = result.filter(order => 
        filters.countries.includes(order.country_id)
      );
    }

    // 6. Status filtering (multi-select)
    if (filters.statuses.length > 0) {
      result = result.filter(order => 
        filters.statuses.includes(order.status)
      );
    }

    // 7. Sorting
    result.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'price':
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case 'weight':
          aValue = parseFloat(a.weight) || 0;
          bValue = parseFloat(b.weight) || 0;
          break;
        case 'created_time':
        default:
          aValue = new Date(a.created_time || 0).getTime();
          bValue = new Date(b.created_time || 0).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return result;
  }, [orders, filters]);

  /**
   * Get unique warehouses from orders
   */
  const availableWarehouses = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    const warehouseMap = new Map();
    orders.forEach(order => {
      if (order.storage_id && order.storage?.shop_name) {
        warehouseMap.set(order.storage_id, order.storage.shop_name);
      }
    });
    
    return Array.from(warehouseMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [orders]);

  /**
   * Get unique countries from orders
   */
  const availableCountries = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    const countryMap = new Map();
    orders.forEach(order => {
      if (order.country_id && order.country?.title) {
        countryMap.set(order.country_id, order.country.title);
      }
    });
    
    return Array.from(countryMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [orders]);

  /**
   * Get unique statuses from orders
   */
  const availableStatuses = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    const statusSet = new Set();
    orders.forEach(order => {
      if (order.status !== undefined && order.status !== null) {
        statusSet.add(order.status);
      }
    });
    
    return Array.from(statusSet).sort((a, b) => a - b);
  }, [orders]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.keyword.trim() !== '' ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.priceRange.min > 0 ||
      filters.priceRange.max < Infinity ||
      filters.warehouses.length > 0 ||
      filters.countries.length > 0 ||
      filters.statuses.length > 0
    );
  }, [filters]);

  return {
    filteredOrders,
    filters,
    updateFilters,
    resetFilters,
    availableWarehouses,
    availableCountries,
    availableStatuses,
    hasActiveFilters,
  };
}

export default useOrderFilter;
