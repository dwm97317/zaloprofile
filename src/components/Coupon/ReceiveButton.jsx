import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ReceiveButton Component
 * 优惠券领取按钮组件
 * 
 * @param {Object} props
 * @param {boolean} props.isReceived - 是否已领取
 * @param {boolean} props.canReceive - 是否可领取
 * @param {boolean} props.isLoading - 是否加载中
 * @param {Function} props.onClick - 点击回调
 */
const ReceiveButton = ({ isReceived, canReceive, isLoading, onClick }) => {
  const { t } = useTranslation();

  // 确定按钮状态
  const getButtonState = () => {
    if (isLoading) {
      return {
        text: t('coupon.receiving', '领取中...'),
        className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-not-allowed opacity-70',
        disabled: true
      };
    }
    
    if (isReceived) {
      return {
        text: t('coupon.received', '已领取'),
        className: 'bg-gray-300 text-gray-600 cursor-not-allowed',
        disabled: true
      };
    }
    
    if (!canReceive) {
      return {
        text: t('coupon.sold_out', '已抢光'),
        className: 'bg-gray-300 text-gray-600 cursor-not-allowed',
        disabled: true
      };
    }
    
    return {
      text: t('coupon.receive_now', '立即领取'),
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-95',
      disabled: false
    };
  };

  const buttonState = getButtonState();

  return (
    <button
      onClick={onClick}
      disabled={buttonState.disabled}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200
        ${buttonState.className}
      `}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {buttonState.text}
    </button>
  );
};

export default ReceiveButton;
