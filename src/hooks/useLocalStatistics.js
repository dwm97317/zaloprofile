import { useMemo } from 'react';

/**
 * useLocalStatistics Hook
 * 
 * Calculates statistics from local order data without API calls.
 * All calculations are memoized for performance.
 */
export const useLocalStatistics = (orders = []) => {
  const statistics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalAmount: 0,
        totalWeight: 0,
        avgPrice: 0,
        avgWeight: 0,
        statusDistribution: {},
        warehouseDistribution: {},
        countryDistribution: {},
      };
    }

    // Calculate totals
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    const totalWeight = orders.reduce((sum, order) => sum + (parseFloat(order.weight) || 0), 0);

    // Calculate averages
    const avgPrice = totalOrders > 0 ? totalAmount / totalOrders : 0;
    const avgWeight = totalOrders > 0 ? totalWeight / totalOrders : 0;

    // Calculate status distribution
    const statusDistribution = orders.reduce((acc, order) => {
      const status = order.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate warehouse distribution
    const warehouseDistribution = orders.reduce((acc, order) => {
      const warehouse = order.storage?.shop_name || 'Unknown';
      acc[warehouse] = (acc[warehouse] || 0) + 1;
      return acc;
    }, {});

    // Calculate country distribution
    const countryDistribution = orders.reduce((acc, order) => {
      const country = order.country?.title || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return {
      totalOrders,
      totalAmount,
      totalWeight,
      avgPrice,
      avgWeight,
      statusDistribution,
      warehouseDistribution,
      countryDistribution,
    };
  }, [orders]);

  return statistics;
};

export default useLocalStatistics;
