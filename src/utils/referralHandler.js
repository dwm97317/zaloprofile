import { validateReferralCode, bindReferral } from '../api/referral';

/**
 * 推荐码处理工具
 */

const REFERRAL_CODE_KEY = 'pending_referral_code';

/**
 * 从URL中提取推荐码
 */
export const extractReferralCodeFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || urlParams.get('referral_code');
};

/**
 * 保存待处理的推荐码到本地存储
 */
export const savePendingReferralCode = (code) => {
  if (code) {
    localStorage.setItem(REFERRAL_CODE_KEY, code);
  }
};

/**
 * 获取待处理的推荐码
 */
export const getPendingReferralCode = () => {
  return localStorage.getItem(REFERRAL_CODE_KEY);
};

/**
 * 清除待处理的推荐码
 */
export const clearPendingReferralCode = () => {
  localStorage.removeItem(REFERRAL_CODE_KEY);
};

/**
 * 处理推荐码绑定
 * @param {string} code - 推荐码
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const handleReferralBinding = async (code) => {
  try {
    // 1. 验证推荐码
    const validateRes = await validateReferralCode(code);
    if (validateRes.code !== 200 || !validateRes.data.is_valid) {
      return {
        success: false,
        message: validateRes.msg || '推荐码无效'
      };
    }

    // 2. 建立推荐关系
    const bindRes = await bindReferral(code);
    if (bindRes.code === 200) {
      clearPendingReferralCode();
      return {
        success: true,
        message: '推荐关系建立成功',
        data: bindRes.data
      };
    } else {
      return {
        success: false,
        message: bindRes.msg || '绑定失败'
      };
    }
  } catch (error) {
    console.error('处理推荐码失败:', error);
    return {
      success: false,
      message: error.message || '处理失败'
    };
  }
};

/**
 * 在应用启动时检查并处理推荐码
 */
export const initReferralHandler = async () => {
  // 1. 检查URL中是否有推荐码
  const urlCode = extractReferralCodeFromUrl();
  if (urlCode) {
    savePendingReferralCode(urlCode);
    // 清除URL参数
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    url.searchParams.delete('referral_code');
    window.history.replaceState({}, '', url.toString());
  }

  // 2. 检查是否有待处理的推荐码
  const pendingCode = getPendingReferralCode();
  if (pendingCode) {
    // 注意: 这里不立即处理，而是在用户登录后处理
    return pendingCode;
  }

  return null;
};

/**
 * 在用户登录后处理待处理的推荐码
 */
export const processReferralAfterLogin = async () => {
  const pendingCode = getPendingReferralCode();
  if (pendingCode) {
    const result = await handleReferralBinding(pendingCode);
    if (result.success) {
      // 可以显示成功提示
      console.log('推荐关系建立成功:', result.data);
    } else {
      // 可以显示错误提示
      console.error('推荐关系建立失败:', result.message);
    }
    return result;
  }
  return null;
};
