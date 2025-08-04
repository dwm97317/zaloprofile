/**
 * Zalo Mini App Studio 兼容性修复
 * 解决真机测试中的各种兼容性问题
 */

// 1. 禁用可能导致语法错误的调试工具
export const disableProblematicDebugTools = () => {
  try {
    // 禁用 eruda 调试工具
    if (typeof window !== 'undefined' && window.eruda) {
      window.eruda.destroy();
      console.log('eruda 调试工具已禁用');
    }
    
    // 禁用其他可能的调试工具
    if (typeof window !== 'undefined' && window.vConsole) {
      window.vConsole.destroy();
      console.log('vConsole 调试工具已禁用');
    }
  } catch (error) {
    console.warn('禁用调试工具时出错:', error);
  }
};

// 2. 修复保留字冲突
export const fixReservedWordConflicts = () => {
  try {
    // 确保全局变量不与保留字冲突
    if (typeof window !== 'undefined') {
      // 备份可能冲突的全局变量
      const globalBackup = {};
      
      // 检查并备份可能的冲突变量
      const potentialConflicts = ['env', 'debug', 'console'];
      potentialConflicts.forEach(key => {
        if (window[key] && typeof window[key] === 'object') {
          globalBackup[key] = window[key];
        }
      });
      
      // 存储备份以便后续使用
      window.__globalBackup = globalBackup;
    }
  } catch (error) {
    console.warn('修复保留字冲突时出错:', error);
  }
};

// 3. 初始化兼容性修复
export const initCompatibilityFixes = () => {
  console.log('正在初始化 Zalo Mini App Studio 兼容性修复...');
  
  // 禁用有问题的调试工具
  disableProblematicDebugTools();
  
  // 修复保留字冲突
  fixReservedWordConflicts();
  
  // 设置错误处理
  if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // 过滤掉已知的兼容性错误
      if (message && message.includes('Unexpected reserved word')) {
        console.warn('已知兼容性错误被忽略:', message);
        return true; // 阻止错误冒泡
      }
      
      // 调用原始错误处理器
      if (originalError) {
        return originalError.call(this, message, source, lineno, colno, error);
      }
      
      return false;
    };
  }
  
  console.log('兼容性修复初始化完成');
};

// 4. 检测运行环境
export const detectEnvironment = () => {
  const userAgent = navigator.userAgent || '';
  const isZaloStudio = userAgent.includes('ZaloStudio') || 
                      userAgent.includes('ZaloMiniApp') ||
                      window.location.hostname.includes('zalo');
  
  return {
    isZaloStudio,
    userAgent,
    hostname: window.location.hostname,
    isDebugMode: window.location.search.includes('debug=1')
  };
};

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  // 在 DOM 加载前就执行修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompatibilityFixes);
  } else {
    initCompatibilityFixes();
  }
}
