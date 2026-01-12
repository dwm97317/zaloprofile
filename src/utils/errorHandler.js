/**
 * 统一错误处理工具
 * 提供用户友好的错误消息和错误日志记录
 */

import { toast } from "./toast";
import { t } from "i18next";

/**
 * 错误类型枚举
 */
export const ErrorType = {
  NETWORK: "NETWORK",
  SERVER: "SERVER",
  VALIDATION: "VALIDATION",
  AUTH: "AUTH",
  UNKNOWN: "UNKNOWN",
};

/**
 * 错误代码映射到用户友好的消息
 */
const ERROR_MESSAGES = {
  // 网络错误
  NETWORK_ERROR: "network_error",
  TIMEOUT: "request_timeout",
  
  // 服务器错误
  500: "server_error",
  502: "bad_gateway",
  503: "service_unavailable",
  504: "gateway_timeout",
  
  // 客户端错误
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  
  // 业务错误
  VALIDATION_ERROR: "validation_error",
  INSUFFICIENT_BALANCE: "insufficient_balance",
  INVALID_COUPON: "invalid_coupon",
};

/**
 * 获取错误类型
 * @param {Error|Object} error - 错误对象
 * @returns {string} 错误类型
 */
export const getErrorType = (error) => {
  if (!error) return ErrorType.UNKNOWN;
  
  // 网络错误
  if (error.message === "Network Error" || !error.response) {
    return ErrorType.NETWORK;
  }
  
  // 认证错误
  if (error.response?.status === 401 || error.response?.data?.code === 401) {
    return ErrorType.AUTH;
  }
  
  // 验证错误
  if (error.response?.status === 400 || error.response?.data?.code === 400) {
    return ErrorType.VALIDATION;
  }
  
  // 服务器错误
  if (error.response?.status >= 500) {
    return ErrorType.SERVER;
  }
  
  return ErrorType.UNKNOWN;
};

/**
 * 获取用户友好的错误消息
 * @param {Error|Object} error - 错误对象
 * @param {string} defaultMessage - 默认消息
 * @returns {string} 用户友好的错误消息
 */
export const getErrorMessage = (error, defaultMessage = "เกิดข้อผิดพลาด") => {
  if (!error) return defaultMessage;
  
  // 如果后端返回了错误消息，优先使用
  if (error.response?.data?.msg) {
    return error.response.data.msg;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // 根据状态码获取消息
  const statusCode = error.response?.status || error.code;
  const messageKey = ERROR_MESSAGES[statusCode] || ERROR_MESSAGES[error.message];
  
  if (messageKey) {
    return t(`errors.${messageKey}`, defaultMessage);
  }
  
  return defaultMessage;
};

/**
 * 处理 API 错误
 * @param {Error|Object} error - 错误对象
 * @param {Object} options - 选项
 * @param {boolean} options.showToast - 是否显示 Toast 提示（默认 true）
 * @param {string} options.defaultMessage - 默认错误消息
 * @param {Function} options.onAuth - 认证错误回调
 * @param {Function} options.onError - 自定义错误处理回调
 * @returns {Object} 处理后的错误信息
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    defaultMessage = "เกิดข้อผิดพลาด",
    onAuth,
    onError,
  } = options;
  
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error, defaultMessage);
  
  // 记录错误日志（生产环境可以发送到日志服务）
  console.error("[API Error]", {
    type: errorType,
    message: errorMessage,
    error: error,
    timestamp: new Date().toISOString(),
  });
  
  // 处理认证错误
  if (errorType === ErrorType.AUTH) {
    if (showToast) {
      toast.error(t("errors.session_expired", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง"));
    }
    
    // 清除 token
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    
    // 调用认证错误回调
    if (onAuth) {
      onAuth();
    } else {
      // 默认行为：刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    
    return {
      type: errorType,
      message: errorMessage,
      handled: true,
    };
  }
  
  // 显示错误提示
  if (showToast) {
    switch (errorType) {
      case ErrorType.NETWORK:
        toast.error(t("errors.network_error", "ไม่สามารถเชื่อมต่อเครือข่าย"));
        break;
      case ErrorType.SERVER:
        toast.error(t("errors.server_error", "เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง"));
        break;
      case ErrorType.VALIDATION:
        toast.error(errorMessage);
        break;
      default:
        toast.error(errorMessage);
    }
  }
  
  // 调用自定义错误处理回调
  if (onError) {
    onError(error, errorType, errorMessage);
  }
  
  return {
    type: errorType,
    message: errorMessage,
    handled: true,
  };
};

/**
 * 创建带错误处理的 API 调用包装器
 * @param {Function} apiCall - API 调用函数
 * @param {Object} options - 错误处理选项
 * @returns {Function} 包装后的 API 调用函数
 */
export const withErrorHandling = (apiCall, options = {}) => {
  return async (...args) => {
    try {
      const result = await apiCall(...args);
      
      // 检查业务错误码
      if (result && result.code !== undefined && result.code !== 1) {
        const error = {
          response: {
            data: result,
          },
        };
        handleApiError(error, options);
        return null;
      }
      
      return result;
    } catch (error) {
      handleApiError(error, options);
      return null;
    }
  };
};

/**
 * 验证错误处理
 * @param {Object} errors - 验证错误对象
 * @param {boolean} showToast - 是否显示 Toast
 * @returns {boolean} 是否有错误
 */
export const handleValidationErrors = (errors, showToast = true) => {
  if (!errors || Object.keys(errors).length === 0) {
    return false;
  }
  
  // 获取第一个错误消息
  const firstError = Object.values(errors)[0];
  
  if (showToast && firstError) {
    toast.error(firstError);
  }
  
  return true;
};

export default {
  handleApiError,
  withErrorHandling,
  handleValidationErrors,
  getErrorType,
  getErrorMessage,
  ErrorType,
};
