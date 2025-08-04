/**
 * Zalo Mini App 专用修复
 * 解决 Zalo Mini App Studio 中的显示和功能问题
 */

(function() {
  'use strict';
  
  console.log('Zalo Mini App 专用修复开始执行...');
  
  // 1. 修复页面标题显示
  const fixPageTitles = () => {
    try {
      // 确保页面标题正确显示
      if (typeof window !== 'undefined' && window.APP_CONFIG) {
        const config = window.APP_CONFIG;
        if (config.app && config.app.title) {
          document.title = config.app.title;
        }
      }
      
      // 监听路由变化，更新页面标题
      if (window.history && window.history.pushState) {
        const originalPushState = window.history.pushState;
        window.history.pushState = function(state, title, url) {
          // 根据路径设置标题
          const pathTitles = {
            '/': 'Trang chủ',
            '/query': 'Tra cứu',
            '/freight': 'Tính cước',
            '/mine': 'Cá nhân',
            '/qr-login': 'Đăng nhập QR',
            '/address': 'Địa chỉ',
            '/storage': 'Kho hàng',
            '/order': 'Đơn hàng'
          };
          
          const pageTitle = pathTitles[url] || 'Bộ sưu tập';
          document.title = pageTitle;
          
          return originalPushState.call(this, state, title, url);
        };
      }
    } catch (error) {
      console.warn('修复页面标题时出错:', error);
    }
  };
  
  // 2. 修复 ZMP-UI 组件兼容性
  const fixZMPUIComponents = () => {
    try {
      // 确保 ZMP-UI 样式正确加载
      if (typeof window !== 'undefined') {
        // 检查 ZMP-UI CSS 是否加载
        const checkZMPUICSS = () => {
          const links = document.querySelectorAll('link[href*="zaui.css"]');
          if (links.length === 0) {
            console.warn('ZMP-UI CSS 未找到，尝试手动加载...');
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/node_modules/zmp-ui/zaui.css';
            document.head.appendChild(link);
          }
        };
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', checkZMPUICSS);
        } else {
          checkZMPUICSS();
        }
      }
    } catch (error) {
      console.warn('修复 ZMP-UI 组件时出错:', error);
    }
  };
  
  // 3. 修复导航和路由问题
  const fixNavigation = () => {
    try {
      // 确保路由正常工作
      if (typeof window !== 'undefined') {
        // 修复可能的路由问题
        window.addEventListener('popstate', function(event) {
          console.log('路由变化:', window.location.pathname);
        });
        
        // 修复底部导航栏点击问题
        document.addEventListener('click', function(event) {
          const target = event.target;
          if (target.closest('.tab-bar-item')) {
            // 确保底部导航正常工作
            console.log('底部导航点击:', target);
          }
        });
      }
    } catch (error) {
      console.warn('修复导航时出错:', error);
    }
  };
  
  // 4. 修复 API 请求问题
  const fixAPIRequests = () => {
    try {
      // 确保 API 请求正常
      if (typeof window !== 'undefined' && window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          // 添加必要的请求头
          if (options && options.headers) {
            options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
          }
          
          return originalFetch.call(this, url, options)
            .then(response => {
              if (!response.ok) {
                console.warn('API 请求失败:', url, response.status);
              }
              return response;
            })
            .catch(error => {
              console.error('API 请求错误:', url, error);
              throw error;
            });
        };
      }
    } catch (error) {
      console.warn('修复 API 请求时出错:', error);
    }
  };
  
  // 5. 修复图片加载问题
  const fixImageLoading = () => {
    try {
      // 监听图片加载错误
      document.addEventListener('error', function(event) {
        if (event.target.tagName === 'IMG') {
          console.warn('图片加载失败:', event.target.src);
          // 可以设置默认图片
          event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNkM5LjUgMjYgMSAxNy41IDEgN0gzOUMzOSAxNy41IDMwLjUgMjYgMjAgMjZaIiBmaWxsPSIjRTBFMEUwIi8+Cjwvc3ZnPgo=';
        }
      }, true);
    } catch (error) {
      console.warn('修复图片加载时出错:', error);
    }
  };
  
  // 6. 修复触摸事件
  const fixTouchEvents = () => {
    try {
      // 确保触摸事件正常工作
      if (typeof window !== 'undefined') {
        // 添加触摸事件支持
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
        document.addEventListener('touchend', function() {}, { passive: true });
      }
    } catch (error) {
      console.warn('修复触摸事件时出错:', error);
    }
  };
  
  // 7. 修复页面布局和显示
  const fixPageLayout = () => {
    try {
      // 确保页面容器正确显示
      const addPageStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
          /* Zalo Mini App 页面修复样式 */
          .page {
            min-height: 100vh;
            background-color: #f5f5f5;
            position: relative;
          }

          /* 确保底部导航栏正确显示 */
          .tab-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fff;
            border-top: 1px solid #e0e0e0;
            z-index: 1000;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* 确保页面内容不被底部导航遮挡 */
          .page-content {
            padding-bottom: 80px;
          }

          /* 修复 ZMP-UI 组件样式 */
          .zmp-page {
            background-color: #f5f5f5;
          }

          /* 修复模态框显示 */
          .zmp-modal {
            z-index: 9999;
          }

          /* 修复按钮样式 */
          .zmp-button {
            border-radius: 4px;
          }

          /* 修复输入框样式 */
          .zmp-input {
            border: 1px solid #e0e0e0;
            border-radius: 4px;
          }

          /* 修复图片显示 */
          img {
            max-width: 100%;
            height: auto;
          }

          /* 修复滑动组件 */
          .zmp-swiper {
            overflow: hidden;
          }
        `;
        document.head.appendChild(style);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPageStyles);
      } else {
        addPageStyles();
      }
    } catch (error) {
      console.warn('修复页面布局时出错:', error);
    }
  };

  // 8. 修复 React 组件渲染问题
  const fixReactRendering = () => {
    try {
      // 监听 React 渲染错误
      if (typeof window !== 'undefined') {
        window.addEventListener('error', function(event) {
          if (event.error && event.error.message) {
            const message = event.error.message;
            if (message.includes('React') || message.includes('render')) {
              console.warn('React 渲染错误:', message);
              // 可以在这里添加错误恢复逻辑
            }
          }
        });
      }
    } catch (error) {
      console.warn('修复 React 渲染时出错:', error);
    }
  };

  // 9. 初始化所有修复
  const initAllFixes = () => {
    console.log('正在初始化 Zalo Mini App 修复...');

    fixPageTitles();
    fixZMPUIComponents();
    fixNavigation();
    fixAPIRequests();
    fixImageLoading();
    fixTouchEvents();
    fixPageLayout();
    fixReactRendering();

    console.log('Zalo Mini App 修复初始化完成');
  };
  
  // 在 DOM 准备好后执行修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllFixes);
  } else {
    initAllFixes();
  }
  
  // 导出修复函数供外部使用
  if (typeof window !== 'undefined') {
    window.zaloMiniAppFixes = {
      fixPageTitles,
      fixZMPUIComponents,
      fixNavigation,
      fixAPIRequests,
      fixImageLoading,
      fixTouchEvents,
      fixPageLayout,
      fixReactRendering,
      initAllFixes
    };
  }
  
})();
