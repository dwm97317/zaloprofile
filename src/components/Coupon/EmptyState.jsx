import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * EmptyState Component
 * 空状态组件
 */
const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* 空状态图标 */}
      <div className="w-32 h-32 mb-6 relative">
        <svg 
          className="w-full h-full text-gray-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" 
          />
        </svg>
      </div>

      {/* 提示文本 */}
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {t('coupon.no_coupons', '暂无可领取的优惠券')}
      </h3>
      <p className="text-sm text-gray-500 text-center">
        {t('coupon.no_coupons_desc', '请稍后再来查看')}
      </p>
    </div>
  );
};

export default EmptyState;
