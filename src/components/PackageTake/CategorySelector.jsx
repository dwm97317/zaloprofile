import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import request from '../../utils/request';

/**
 * CategorySelector Component
 * Visual category selection with icons and multi-select support
 */
const CategorySelector = ({ selectedCategories = [], onSelect, maxSelections = 10 }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await request.get('category/lists&wxapp_id=10001');
      if (res.code === 1 && res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(cat =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const handleToggle = (category) => {
    console.log('🔘 Category clicked:', category.name, category.category_id);
    const isSelected = selectedCategories.some(c => c.category_id === category.category_id);
    console.log('📌 Is selected:', isSelected);
    
    if (isSelected) {
      const newSelection = selectedCategories.filter(c => c.category_id !== category.category_id);
      console.log('➖ Removing category, new selection:', newSelection);
      onSelect(newSelection);
    } else {
      if (selectedCategories.length >= maxSelections) {
        console.warn('⚠️ Max selections reached:', maxSelections);
        return; // Max selections reached
      }
      const newSelection = [...selectedCategories, category];
      console.log('➕ Adding category, new selection:', newSelection);
      onSelect(newSelection);
    }
  };

  const isSelected = (category) => {
    return selectedCategories.some(c => c.category_id === category.category_id);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {categories.length > 6 && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('packageTake.searchCategory', 'ค้นหาประเภทสินค้า')}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Selection Counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {t('packageTake.selectedCategories', 'เลือกแล้ว')}: <span className="font-bold text-blue-600">{selectedCategories.length}</span>
        </span>
        {selectedCategories.length > 0 && (
          <button
            onClick={() => onSelect([])}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {t('common.clearAll', 'ล้างทั้งหมด')}
          </button>
        )}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {filteredCategories.map((category) => {
          const selected = isSelected(category);
          return (
            <button
              key={category.category_id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle(category);
              }}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${selected
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                ${selected ? 'bg-blue-500' : 'bg-orange-100'}
              `}>
                {category.image?.file_path ? (
                  <img
                    src={category.image.file_path}
                    alt={category.name}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <svg
                    className={`w-7 h-7 ${selected ? 'text-white' : 'text-orange-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 text-left">
                <div className={`font-bold ${selected ? 'text-blue-900' : 'text-gray-800'}`}>
                  {category.name}
                </div>
              </div>

              {/* Checkbox */}
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}
              `}>
                {selected && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{t('packageTake.noCategoriesFound', 'ไม่พบประเภทสินค้า')}</p>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
