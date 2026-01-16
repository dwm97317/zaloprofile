import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * CompactStatisticsWidget Component
 * 
 * Floating compact statistics widget in top-right corner.
 * Expandable on click to show detailed statistics.
 */
const CompactStatisticsWidget = ({ statistics }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!statistics || statistics.totalOrders === 0) {
    return null;
  }

  const {
    totalOrders,
    totalAmount,
    totalWeight,
    avgWeight,
    warehouseDistribution,
  } = statistics;

  // Get top 3 warehouses
  const topWarehouses = Object.entries(warehouseDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="fixed top-20 right-24 z-30">
      <AnimatePresence>
        {!isExpanded ? (
          // Compact View
          <motion.div
            key="compact"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={() => setIsExpanded(true)}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-bold text-gray-700">{t("statistics.title", "สถิติ")}</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">📦</span>
                <span className="text-sm font-bold text-gray-900">{totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">⚖️</span>
                <span className="text-sm font-bold text-blue-600">{totalWeight.toFixed(1)} kg</span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </motion.div>
        ) : (
          // Expanded View
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-64"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-bold text-gray-800">{t("statistics.title", "สถิติหน้านี้")}</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2.5 border border-blue-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">⚖️</span>
                  <p className="text-blue-600 text-xs font-medium">{t("statistics.weight", "น้ำหนัก")}</p>
                </div>
                <p className="text-blue-900 text-xl font-bold">{totalWeight.toFixed(1)} kg</p>
                {avgWeight > 0 && (
                  <p className="text-blue-600 text-xs mt-0.5">
                    ø {avgWeight.toFixed(1)} kg
                  </p>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2.5 border border-green-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">📦</span>
                  <p className="text-green-600 text-xs font-medium">{t("statistics.count", "จำนวน")}</p>
                </div>
                <p className="text-green-900 text-xl font-bold">{totalOrders}</p>
                {totalAmount > 0 && (
                  <p className="text-green-600 text-xs mt-0.5">
                    ฿{totalAmount.toFixed(0)}
                  </p>
                )}
              </div>
            </div>

            {/* Warehouse Distribution */}
            {topWarehouses.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-700 text-xs font-medium mb-2 flex items-center gap-1">
                  <span>🏢</span>
                  {t("statistics.warehouses", "คลัง")}
                </p>
                <div className="space-y-1.5">
                  {topWarehouses.map(([warehouse, count], index) => (
                    <div key={warehouse} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex-1 truncate">{warehouse}</span>
                      <span className="text-xs text-gray-900 font-semibold ml-2">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompactStatisticsWidget;
