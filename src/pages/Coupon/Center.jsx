import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCouponList, receiveCoupon } from '../../api/coupon';
import { CouponCard, EmptyState, LoadingState } from '../../components/Coupon';

/**
 * CouponCenter Page
 * 领券中心页面
 */
const CouponCenter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receivingIds, setReceivingIds] = useState(new Set());

  // 加载优惠券列表
  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getCouponList();
      
      if (response.code === 1 && response.data?.list) {
        // 按 sort 字段排序
        const sortedList = response.data.list.sort((a, b) => a.sort - b.sort);
        setCoupons(sortedList);
      } else {
        setError(response.msg || t('coupon.load_failed', '加载失败'));
      }
    } catch (err) {
      console.error('Load coupons error:', err);
      setError(t('coupon.network_error', '网络错误，请重试'));
    } finally {
      setIsLoading(false);
    }
  };

  // 领取优惠券
  const handleReceive = async (couponId) => {
    // 防止重复点击
    if (receivingIds.has(couponId)) {
      return;
    }

    try {
      // 添加到领取中列表
      setReceivingIds(prev => new Set(prev).add(couponId));

      const response = await receiveCoupon(couponId);
      
      if (response.code === 1) {
        // 领取成功 - 乐观更新 UI
        setCoupons(prevCoupons => 
          prevCoupons.map(coupon => 
            coupon.coupon_id === couponId
              ? { ...coupon, is_receive: true, state: { ...coupon.state, value: 0 } }
              : coupon
          )
        );
        
        // 显示成功提示
        showToast(t('coupon.receive_success', '领取成功'), 'success');
      } else {
        // 领取失败
        showToast(response.msg || t('coupon.receive_failed', '领取失败'), 'error');
      }
    } catch (err) {
      console.error('Receive coupon error:', err);
      showToast(t('coupon.network_error', '网络错误，请重试'), 'error');
    } finally {
      // 从领取中列表移除
      setReceivingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(couponId);
        return newSet;
      });
    }
  };

  // 简单的 Toast 提示
  const showToast = (message, type = 'info') => {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 2秒后移除
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  };

  // 下拉刷新
  const handleRefresh = () => {
    loadCoupons();
  };

  // 初始加载
  useEffect(() => {
    loadCoupons();
  }, []);

  return (
    <div className="coupon-center min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 pt-12 pb-6 px-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-white text-2xl hover:scale-110 transition-transform"
          >
            ←
          </button>
          <h1 className="text-white text-xl font-bold flex-1">
            {t('coupon.center_title', '领券中心')}
          </h1>
          <button
            onClick={handleRefresh}
            className="text-white hover:scale-110 transition-transform"
            disabled={isLoading}
          >
            <svg 
              className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {/* 加载状态 */}
        {isLoading && <LoadingState />}

        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={loadCoupons}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              {t('coupon.retry', '重试')}
            </button>
          </div>
        )}

        {/* 优惠券列表 */}
        {!isLoading && !error && coupons.length > 0 && (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.coupon_id}
                coupon={coupon}
                onReceive={handleReceive}
                isReceiving={receivingIds.has(coupon.coupon_id)}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !error && coupons.length === 0 && <EmptyState />}
      </div>

      {/* 提示信息 */}
      {!isLoading && !error && coupons.length > 0 && (
        <div className="px-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-2">
                  {t('coupon.tips_title', '温馨提示')}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t('coupon.tip1', '优惠券仅用于运费抵扣')}</li>
                  <li>• {t('coupon.tip2', '每张优惠券只能使用一次')}</li>
                  <li>• {t('coupon.tip3', '请在有效期内使用')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCenter;
