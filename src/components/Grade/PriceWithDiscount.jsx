import React from 'react';
import { useTranslation } from 'react-i18next';
import { getDiscountPrice } from '../../utils/gradeUtils';

/**
 * PriceWithDiscount Component
 * 带折扣的价格展示组件
 * 
 * @param {Object} props
 * @param {number} props.originalPrice - 原价
 * @param {number} props.discountRate - 折扣率 (0-10)
 */
const PriceWithDiscount = ({ originalPrice, discountRate = 10 }) => {
  const { t } = useTranslation();
  
  // No discount, show only original price
  if (discountRate >= 10) {
    return (
      <span className="price text-lg font-semibold text-gray-900">
        ¥{originalPrice.toFixed(2)}
      </span>
    );
  }
  
  const discountPrice = getDiscountPrice(originalPrice, discountRate);
  
  return (
    <div className="price-with-discount flex items-center gap-2 flex-wrap">
      {/* Original price (strikethrough) */}
      <span className="price-with-discount__original text-sm text-gray-400 line-through">
        ¥{originalPrice.toFixed(2)}
      </span>
      
      {/* Member discount price */}
      <span className="price-with-discount__member text-lg font-semibold text-orange-600">
        ¥{discountPrice}
      </span>
      
      {/* Member price tag */}
      <span className="price-with-discount__tag text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
        {t('grade.member_price')}
      </span>
    </div>
  );
};

export default PriceWithDiscount;
