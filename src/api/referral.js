import request from '../utils/request';

/**
 * 推荐奖励系统 API 服务
 */

/**
 * 获取/生成推荐码
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getReferralCode = () => {
  return request.get('referral/code');
};

/**
 * 验证推荐码
 * @param {string} referralCode - 推荐码
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const validateReferralCode = (referralCode) => {
  return request.post('referral/validateCode', {
    referral_code: referralCode
  });
};

/**
 * 建立推荐关系
 * @param {string} referralCode - 推荐码
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const bindReferral = (referralCode) => {
  return request.post('referral/bind', {
    referral_code: referralCode
  });
};

/**
 * 查询推荐记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.status - 状态筛选 (all/pending/completed/expired)
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getReferralList = (params = {}) => {
  return request.get('referral/list', params);
};

/**
 * 查询推荐统计
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getReferralStatistics = () => {
  return request.get('referral/statistics');
};

/**
 * 查询排行榜
 * @param {Object} params - 查询参数
 * @param {string} params.period - 周期类型 (daily/weekly/monthly)
 * @param {string} params.date - 周期日期
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getReferralLeaderboard = (params = {}) => {
  return request.get('referral/leaderboard', params);
};
