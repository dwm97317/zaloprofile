/**
 * 早期兼容性修复 - 在任何其他脚本加载前执行
 * 专门处理 Zalo Mini App Studio 开发者真机模式的兼容性问题
 */

(function() {
  'use strict';
  
  console.log('早期兼容性修复开始执行...');
  
  // 1. 立即设置全局错误处理
  window.onerror = function(message, source, lineno, colno, error) {
    // 忽略 eruda 和其他调试工具的语法错误
    if (message && (
      message.indexOf('Unexpected reserved word') !== -1 ||
      message.indexOf('eruda') !== -1 ||
      (source && source.indexOf('eruda') !== -1) ||
      (source && source.indexOf('zmp.min.js') !== -1)
    )) {
      console.warn('[兼容性修复] 忽略已知错误:', {
        message: message,
        source: source,
        line: lineno,
        column: colno
      });
      return true; // 阻止错误显示
    }
    return false; // 允许其他错误正常处理
  };
  
  // 2. 处理 Promise 错误
  window.addEventListener('unhandledrejection', function(event) {
    var error = event.reason;
    if (error && error.message && (
      error.message.indexOf('Unexpected reserved word') !== -1 ||
      error.message.indexOf('eruda') !== -1
    )) {
      console.warn('[兼容性修复] 忽略 Promise 错误:', error);
      event.preventDefault();
    }
  });
  
  // 3. 重写 console.error 以过滤已知错误
  var originalConsoleError = console.error;
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var message = args.join(' ');
    
    if (message.indexOf('Unexpected reserved word') !== -1 ||
        message.indexOf('eruda') !== -1) {
      console.warn('[兼容性修复] 过滤控制台错误:', message);
      return;
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 4. 监听 DOM 加载，准备修复调试工具
  function fixDebugTools() {
    try {
      // 如果 eruda 已经加载，尝试修复它
      if (window.eruda) {
        console.log('[兼容性修复] 检测到 eruda，正在修复...');
        
        // 重写可能有问题的方法
        var originalMethods = ['init', 'show', 'hide'];
        originalMethods.forEach(function(methodName) {
          if (window.eruda[methodName]) {
            var originalMethod = window.eruda[methodName];
            window.eruda[methodName] = function() {
              try {
                return originalMethod.apply(this, arguments);
              } catch (e) {
                console.warn('[兼容性修复] eruda.' + methodName + ' 错误已处理:', e);
                return this;
              }
            };
          }
        });
        
        console.log('[兼容性修复] eruda 修复完成');
      }
    } catch (e) {
      console.warn('[兼容性修复] 修复调试工具时出错:', e);
    }
  }
  
  // 5. 在不同时机尝试修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixDebugTools);
  } else {
    fixDebugTools();
  }
  
  // 延迟修复，确保所有脚本都加载完成
  setTimeout(fixDebugTools, 100);
  setTimeout(fixDebugTools, 500);
  setTimeout(fixDebugTools, 1000);
  
  console.log('早期兼容性修复设置完成');
})();
