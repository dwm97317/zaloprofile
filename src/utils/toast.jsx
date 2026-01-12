/**
 * LINE 风格 Toast 通知工具
 * 提供简洁优雅的消息提示
 */

let toastContainer = null;

// 初始化 Toast 容器
const initToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none';
    toastContainer.style.width = 'calc(100% - 32px)';
    toastContainer.style.maxWidth = '400px';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

/**
 * 显示 Toast 消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型: 'success' | 'error' | 'info' | 'warning'
 * @param {number} duration - 显示时长（毫秒），默认 3000
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  const container = initToastContainer();

  // 颜色配置
  const colors = {
    success: {
      bg: 'bg-primary-500',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',
    },
    error: {
      bg: 'bg-red-500',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',
    },
    info: {
      bg: 'bg-blue-500',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
    },
  };

  const config = colors[type] || colors.info;

  // 创建 Toast 元素
  const toast = document.createElement('div');
  toast.className = `${config.bg} text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-base flex items-center gap-3 pointer-events-auto animate-slide-in-bottom`;

  // 创建图标
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'flex-shrink-0';
  iconWrapper.innerHTML = config.icon || '';

  // 创建消息文本
  const messageText = document.createElement('span');
  messageText.className = 'flex-1';
  messageText.textContent = message;

  toast.appendChild(iconWrapper);
  toast.appendChild(messageText);
  container.appendChild(toast);

  // 自动移除
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // 如果容器为空，移除容器
      if (container.children.length === 0 && container.parentNode) {
        container.parentNode.removeChild(container);
        toastContainer = null;
      }
    }, 300);
  }, duration);

  return toast;
};

// 便捷方法
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
};

// 添加淡出动画到全局样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
  `;
  document.head.appendChild(style);
}

export default toast;
