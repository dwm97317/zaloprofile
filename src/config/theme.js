/**
 * LINE Mini App 主题配置
 * 遵循 LINE 设计语言和泰国用户审美偏好
 */

export const lineTheme = {
  // LINE 品牌色
  primary: {
    DEFAULT: '#00B900',  // LINE 绿色
    light: '#00E600',
    dark: '#009900',
    50: '#E6F9E6',
    100: '#CCF3CC',
    200: '#99E699',
    300: '#66D966',
    400: '#33CC33',
    500: '#00B900',
    600: '#009900',
    700: '#007300',
    800: '#004D00',
    900: '#002600',
  },
  
  // 辅助色（泰国审美 - 鲜艳活泼）
  secondary: {
    orange: '#FF6B35',   // 橙色
    pink: '#FF006E',     // 粉色
    purple: '#8338EC',   // 紫色
    yellow: '#FFD60A',   // 黄色
    blue: '#00B4D8',     // 蓝色
  },
  
  // 状态色
  status: {
    success: '#00B900',
    warning: '#FFD60A',
    error: '#FF006E',
    info: '#00B4D8',
  },
  
  // 中性色
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 渐变色配置
  gradients: {
    primary: 'from-green-500 to-green-600',
    secondary: 'from-blue-500 to-blue-600',
    orange: 'from-orange-400 to-orange-500',
    pink: 'from-pink-400 to-pink-500',
    purple: 'from-purple-400 to-purple-500',
    yellow: 'from-yellow-400 to-yellow-500',
  },
};

export default lineTheme;
