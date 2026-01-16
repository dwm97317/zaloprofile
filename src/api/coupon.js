import request from '../utils/request';

/**
 * 优惠券 API 服务
 */

/**
 * 获取优惠券列表
 * @param {Object} params - 查询参数
 * @param {number} params.coupon_type - 优惠券类型 (可选)
 * @returns {Promise<{code: number, msg: string, data: {list: Array}}>}
 */
export const getCouponList = (params = {}) => {
  return request.get('coupon/lists', params);
};

/**
 * 领取优惠券
 * @param {number} couponId - 优惠券ID
 * @returns {Promise<{code: number, msg: string, data: any}>}
 */
export const receiveCoupon = (couponId) => {
  return request.post('coupon/receive', {
    coupon_id: couponId
  });
};

/**
 * 获取用户可用优惠券
 * @param {number} totalFree - 订单金额
 * @returns {Promise<{code: number, msg: string, data: {list: Array}}>}
 */
export const getEnableCoupons = (totalFree) => {
  return request.get('coupon/enablecoupon', {
    total_free: totalFree
  });
};

/**
 * 获取优惠券详情
 * @param {number} couponId - 用户优惠券ID
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getCouponDetail = (couponId) => {
  return request.get('coupon/couponDetail', {
    coupon_id: couponId
  });
};
