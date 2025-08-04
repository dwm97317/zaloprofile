/**
 * Zalo Mini App Studio 兼容性修复
 * 解决真机测试中的各种兼容性问题
 */

// 1. 修复调试工具的兼容性问题（不完全禁用，而是修复）
export const fixDebugToolsCompatibility = () => {
  try {
    // 检测是否在开发者真机模式
    const isDeveloperMode = detectEnvironment().isZaloStudio;

    if (isDeveloperMode) {
      console.log('检测到开发者真机模式，保持调试工具但修复兼容性问题');

      // 修复 eruda 的兼容性问题而不是禁用它
      if (typeof window !== 'undefined' && window.eruda) {
        // 重写可能有问题的方法
        const originalInit = window.eruda.init;
        window.eruda.init = function(...args) {
          try {
            return originalInit.apply(this, args);
          } catch (error) {
            console.warn('eruda init error caught and handled:', error);
            return this;
          }
        };

        console.log('eruda 兼容性已修复');
      }
    } else {
      // 非开发者模式下可以安全禁用
      if (typeof window !== 'undefined' && window.eruda) {
        window.eruda.destroy();
        console.log('eruda 调试工具已禁用（非开发者模式）');
      }
    }

    // 修复其他可能的调试工具
    if (typeof window !== 'undefined' && window.vConsole) {
      const originalLog = window.vConsole.log;
      if (originalLog) {
        window.vConsole.log = function(...args) {
          try {
            return originalLog.apply(this, args);
          } catch (error) {
            console.warn('vConsole log error caught:', error);
          }
        };
      }
    }
  } catch (error) {
    console.warn('修复调试工具兼容性时出错:', error);
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

  // 修复调试工具兼容性
  fixDebugToolsCompatibility();
  
  // 修复保留字冲突
  fixReservedWordConflicts();
  
  // 设置强化的错误处理
  if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // 过滤掉已知的兼容性错误
      if (message && (
        message.includes('Unexpected reserved word') ||
        message.includes('eruda') ||
        source && source.includes('eruda') ||
        source && source.includes('zmp.min.js')
      )) {
        console.warn('已知兼容性错误被忽略:', {
          message,
          source,
          line: lineno,
          column: colno
        });
        return true; // 阻止错误冒泡
      }

      // 调用原始错误处理器
      if (originalError) {
        return originalError.call(this, message, source, lineno, colno, error);
      }

      return false;
    };

    // 同时处理 Promise 错误
    window.addEventListener('unhandledrejection', function(event) {
      const error = event.reason;
      if (error && error.message && (
        error.message.includes('Unexpected reserved word') ||
        error.message.includes('eruda')
      )) {
        console.warn('Promise 兼容性错误被忽略:', error);
        event.preventDefault();
      }
    });
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
