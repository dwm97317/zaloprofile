import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SearchWithHistory Component
 * 
 * Search input with dropdown showing search history.
 * Supports click to reuse, remove individual items, and clear all.
 */
const SearchWithHistory = ({ 
  value, 
  onChange, 
  onSearch,
  history = [],
  onRemoveHistory,
  onClearHistory,
  placeholder 
}) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (history.length > 0) {
      setShowHistory(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay to allow click on history items
    setTimeout(() => setShowHistory(false), 200);
  };

  const handleHistoryClick = (term) => {
    onChange(term);
    setShowHistory(false);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleRemoveClick = (e, term) => {
    e.stopPropagation();
    if (onRemoveHistory) {
      onRemoveHistory(term);
    }
  };

  const handleClearClick = (e) => {
    e.stopPropagation();
    if (onClearHistory) {
      onClearHistory();
    }
    setShowHistory(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || t("package.search_placeholder", "ค้นหาเลขพัสดุ, เลขออเดอร์")}
        className="w-full bg-gray-100 text-gray-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      <svg 
        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      {/* History dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 animate-slide-in-bottom">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">
              {t("search.history", "ประวัติการค้นหา")}
            </span>
            <button
              onClick={handleClearClick}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              {t("search.clear_all", "ลบทั้งหมด")}
            </button>
          </div>

          {/* History items */}
          <div className="max-h-60 overflow-y-auto">
            {history.map((term, index) => (
              <div
                key={index}
                onClick={() => handleHistoryClick(term)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700 truncate">{term}</span>
                </div>
                <button
                  onClick={(e) => handleRemoveClick(e, term)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchWithHistory;
