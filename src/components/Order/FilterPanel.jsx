import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * FilterPanel Component
 * 
 * A slide-in panel for filtering orders by multiple criteria
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {Function} props.onClose - Callback when panel closes
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onApply - Callback when filters are applied
 * @param {Array} props.availableWarehouses - List of available warehouses
 * @param {Array} props.availableCountries - List of available countries
 * @param {Array} props.availableStatuses - List of available statuses
 */
export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onApply,
  availableWarehouses = [],
  availableCountries = [],
  availableStatuses = [],
}) {
  const { t } = useTranslation();
  
  // Local state for filter inputs
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Status labels mapping
  const getStatusLabel = (status) => {
    const statusMap = {
      1: t('package.status.forecast', 'ยังไม่ถึงคลัง'),
      2: t('package.status.received', 'ถึงคลังแล้ว'),
      3: t('package.status.checked', 'ตรวจสอบแล้ว'),
      4: t('package.status.awaiting_pack', 'รอแพ็ค'),
      5: t('package.status.packed', 'แพ็คแล้ว'),
      7: t('package.status.awaiting_payment', 'รอชำระเงิน'),
      8: t('package.status.shipped', 'จัดส่งแล้ว'),
      9: t('package.status.completed', 'เสร็จสิ้น'),
      '-1': t('package.status.issue', 'มีปัญหา'),
    };
    return statusMap[status] || `Status ${status}`;
  };

  // Handle checkbox toggle
  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  // Handle apply filters
  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  // Handle reset filters
  const handleReset = () => {
    const resetFilters = {
      keyword: '',
      dateRange: { start: null, end: null },
      priceRange: { min: 0, max: Infinity },
      warehouses: [],
      countries: [],
      statuses: [],
      sortBy: 'created_time',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 flex items-center justify-between shadow-lg z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('filter.title', 'ตัวกรอง')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 pb-24">
          {/* Price Range */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('filter.price_range', 'ช่วงราคา')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{t('filter.min_price', 'ราคาต่ำสุด')}</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.priceRange.min === 0 ? '' : localFilters.priceRange.min}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{t('filter.max_price', 'ราคาสูงสุด')}</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.priceRange.max === Infinity ? '' : localFilters.priceRange.max}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parseFloat(e.target.value) || Infinity }
                  }))}
                  placeholder="∞"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('filter.date_range', 'ช่วงวันที่')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{t('filter.start_date', 'วันที่เริ่มต้น')}</label>
                <input
                  type="date"
                  value={localFilters.dateRange.start || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value || null }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{t('filter.end_date', 'วันที่สิ้นสุด')}</label>
                <input
                  type="date"
                  value={localFilters.dateRange.end || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value || null }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Warehouses */}
          {availableWarehouses.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('filter.warehouse', 'คลังสินค้า')}
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableWarehouses.map(warehouse => (
                  <label key={warehouse.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={localFilters.warehouses.includes(warehouse.id)}
                      onChange={() => setLocalFilters(prev => ({
                        ...prev,
                        warehouses: toggleArrayItem(prev.warehouses, warehouse.id)
                      }))}
                      className="w-5 h-5 rounded border-2 border-primary-500 text-primary-600 focus:ring-2 focus:ring-primary-200"
                    />
                    <span className="text-sm text-gray-700">{warehouse.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {availableCountries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('filter.country', 'ประเทศ')}
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableCountries.map(country => (
                  <label key={country.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={localFilters.countries.includes(country.id)}
                      onChange={() => setLocalFilters(prev => ({
                        ...prev,
                        countries: toggleArrayItem(prev.countries, country.id)
                      }))}
                      className="w-5 h-5 rounded border-2 border-primary-500 text-primary-600 focus:ring-2 focus:ring-primary-200"
                    />
                    <span className="text-sm text-gray-700">{country.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Statuses */}
          {availableStatuses.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('filter.status', 'สถานะ')}
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableStatuses.map(status => (
                  <label key={status} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={localFilters.statuses.includes(status)}
                      onChange={() => setLocalFilters(prev => ({
                        ...prev,
                        statuses: toggleArrayItem(prev.statuses, status)
                      }))}
                      className="w-5 h-5 rounded border-2 border-primary-500 text-primary-600 focus:ring-2 focus:ring-primary-200"
                    />
                    <span className="text-sm text-gray-700">{getStatusLabel(status)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {t('filter.sort', 'เรียงลำดับ')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{t('filter.sort_by', 'เรียงตาม')}</label>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                >
                  <option value="created_time">{t('filter.sort_by_date', 'วันที่สร้าง')}</option>
                  <option value="price">{t('filter.sort_by_price', 'ราคา')}</option>
                  <option value="weight">{t('filter.sort_by_weight', 'น้ำหนัก')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{t('filter.sort_order', 'ลำดับ')}</label>
                <select
                  value={localFilters.sortOrder}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                >
                  <option value="desc">{t('filter.sort_desc', 'มากไปน้อย')}</option>
                  <option value="asc">{t('filter.sort_asc', 'น้อยไปมาก')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-10">
          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('filter.reset', 'รีเซ็ต')}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {t('filter.apply', 'ใช้ตัวกรอง')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FilterPanel;
