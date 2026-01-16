import React, { useRef, useEffect } from "react";

/**
 * 通用下拉选择器组件
 * @param {string} label - 占位文本
 * @param {string} value - 当前选中值
 * @param {Array} options - 选项列表 [{value, label, data?}]
 * @param {Function} onChange - 选择回调 (value, data) => void
 * @param {boolean} open - 是否展开
 * @param {Function} onToggle - 切换展开状态
 */
const Dropdown = ({ label, value, options = [], onChange, open, onToggle }) => {
  const dropdownRef = useRef(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (open) onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 
                   flex items-center justify-between text-sm"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || label}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg 
                        border border-gray-100 z-20 max-h-48 overflow-y-auto">
          {options.map((opt, idx) => (
            <button
              key={opt.value || idx}
              onClick={() => {
                onChange(opt.value, opt.data);
                onToggle();
              }}
              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl
                ${value === opt.value || value === opt.label ? "text-primary-500 bg-primary-50" : "text-gray-700"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
