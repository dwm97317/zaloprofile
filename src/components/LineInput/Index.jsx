import React from 'react';
import PropTypes from 'prop-types';

/**
 * LINE 风格输入框组件
 * 支持多种输入类型、标签、错误提示、前缀和后缀
 */
const LineInput = ({
  label,
  required = false,
  error,
  placeholder,
  value,
  onChange,
  type = 'text',
  prefix,
  suffix,
  disabled = false,
  className = '',
  inputClassName = '',
  ...rest
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-base font-bold text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-2xl border-2 transition-all ${
          error
            ? 'border-red-500 ring-4 ring-red-100'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100'
        }`}
      >
        {prefix && (
          <div className="pl-4 text-gray-400 font-bold flex-shrink-0">
            {prefix}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-4 py-4 bg-transparent outline-none text-base font-medium placeholder-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 ${inputClassName}`}
          {...rest}
        />

        {suffix && (
          <div className="pr-4 text-gray-400 flex-shrink-0">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium animate-slide-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

LineInput.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  type: PropTypes.oneOf(['text', 'number', 'email', 'tel', 'date', 'time', 'password', 'url']),
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default LineInput;
