import React from 'react';
import { useTranslation } from 'react-i18next';
import ReceiveButton from './ReceiveButton';

/**
 * CouponCard Component
 * 优惠券卡片组件
 * 
 * @param {Object} props
 * @param {Object} props.coupon - 优惠券数据
 * @param {Function} props.onReceive - 领取回调
 * @param {boolean} props.isReceiving - 是否正在领取
 */
const CouponCard = ({ coupon, onReceive, isReceiving }) => {
  const { t } = useTranslation();

  // 颜色映射
  const getColorClass = (colorValue) => {
    const colorMap = {
      10: 'from-blue-500 to-blue-600',      // blue
      20: 'from-red-500 to-red-600',        // red
      30: 'from-purple-500 to-purple-600',  // violet
      40: 'from-yellow-500 to-yellow-600'   // yellow
    };
    return colorMap[colorValue] || colorMap[10];
  };

  // 格式化金额
  const formatAmount = (amount) => {
    return `¥${parseFloat(amount).toFixed(0)}`;
  };

  // 获取有效期文本
  const getExpireText = () => {
    if (coupon.expire_type === 10) {
      // 领取后N天有效
      return t('coupon.valid_days', { days: coupon.expire_day }, `领取后${coupon.expire_day}天内有效`);
    } else if (coupon.expire_type === 20) {
      // 固定时间段
      return `${coupon.start_time?.text || ''} - ${coupon.end_time?.text || ''}`;
    }
    return '';
  };

  // 获取优惠信息
  const getDiscountInfo = () => {
    if (coupon.coupon_type?.value === 10) {
      // 满减券
      return {
        amount: formatAmount(coupon.reduce_price),
        condition: t('coupon.min_amount', { amount: formatAmount(coupon.min_price) }, `满${formatAmount(coupon.min_price)}可用`)
      };
    } else if (coupon.coupon_type?.value === 20) {
      // 折扣券
      return {
        amount: `${coupon.discount}折`,
        condition: t('coupon.min_amount', { amount: formatAmount(coupon.min_price) }, `满${formatAmount(coupon.min_price)}可用`)
      };
    }
    return {
      amount: formatAmount(coupon.reduce_price),
      condition: ''
    };
  };

  const colorClass = getColorClass(coupon.color?.value);
  const discountInfo = getDiscountInfo();
  const canReceive = coupon.state?.value === 1;

  return (
    <div className="coupon-card bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="flex">
        {/* 左侧：优惠金额区域 */}
        <div className={`w-32 bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center text-white p-4 relative`}>
          {/* 装饰圆点 */}
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full" />
          
          <div className="text-3xl font-bold mb-1">
            {discountInfo.amount}
          </div>
          <div className="text-xs opacity-90">
            {coupon.coupon_type?.text || t('coupon.freight_coupon', '运费券')}
          </div>
        </div>

        {/* 右侧：详细信息区域 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* 优惠券名称 */}
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
              {coupon.name}
            </h3>
            
            {/* 使用条件 */}
            <p className="text-sm text-gray-600 mb-2">
              {discountInfo.condition}
            </p>
            
            {/* 有效期 */}
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{getExpireText()}</span>
            </div>
          </div>

          {/* 领取按钮 */}
          <div className="mt-3 flex justify-end">
            <ReceiveButton
              isReceived={coupon.is_receive}
              canReceive={canReceive}
              isLoading={isReceiving}
              onClick={() => onReceive(coupon.coupon_id)}
            />
          </div>
        </div>
      </div>

      {/* 虚线分割效果 */}
      <div className="absolute left-32 top-0 bottom-0 w-px border-l-2 border-dashed border-white/30" />
    </div>
  );
};

export default CouponCard;
