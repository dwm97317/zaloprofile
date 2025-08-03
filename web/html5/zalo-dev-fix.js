/**
 * Zalo小程序开发环境修复脚本
 * 解决token过期导致的自动返回问题
 */
(function() {
    'use strict';
    
    // 检查是否为开发环境
    function isDevelopmentEnv() {
        const userAgent = navigator.userAgent || '';
        const hostname = window.location.hostname;
        const search = window.location.search;
        
        return (
            userAgent.indexOf('ZaloStudio') !== -1 ||
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.indexOf('mini-app-studio') !== -1 ||
            search.indexOf('debug_mode=1') !== -1 ||
            search.indexOf('dev=1') !== -1
        );
    }
    
    // 开发环境标志
    const IS_DEV = isDevelopmentEnv();
    
    console.log('Zalo开发环境修复脚本已加载，开发模式:', IS_DEV);
    
    // 如果不是开发环境，不进行任何修改
    if (!IS_DEV) {
        return;
    }
    
    // 存储原始的uni方法
    const originalUniMethods = {};
    
    // 等待uni对象可用
    function waitForUni(callback) {
        if (typeof uni !== 'undefined') {
            callback();
        } else {
            setTimeout(() => waitForUni(callback), 100);
        }
    }
    
    waitForUni(function() {
        // 存储原始方法
        originalUniMethods.showModal = uni.showModal;
        originalUniMethods.reLaunch = uni.reLaunch;
        originalUniMethods.navigateBack = uni.navigateBack;
        originalUniMethods.request = uni.request;
        
        // 重写uni.showModal方法
        uni.showModal = function(options) {
            // 检查是否为登录过期提示
            if (options && options.content && 
                (options.content.indexOf('登录状态已过期') !== -1 || 
                 options.content.indexOf('请重新登录') !== -1)) {
                
                console.log('开发环境：拦截登录过期提示', options);
                
                // 在开发环境中，显示友好的提示而不是强制跳转
                const newOptions = {
                    ...options,
                    title: '开发环境提示',
                    content: '检测到token过期，在开发环境中已自动处理。\n如需测试登录流程，请手动刷新页面。',
                    showCancel: true,
                    cancelText: '继续',
                    confirmText: '刷新页面',
                    success: function(res) {
                        if (res.confirm) {
                            // 用户选择刷新页面
                            window.location.reload();
                        } else {
                            // 用户选择继续，不做任何操作
                            console.log('开发环境：用户选择继续，跳过登录验证');
                        }
                        
                        // 调用原始回调（如果存在）
                        if (options.success && typeof options.success === 'function') {
                            options.success({ cancel: !res.confirm, confirm: res.confirm });
                        }
                    }
                };
                
                return originalUniMethods.showModal(newOptions);
            }
            
            // 其他情况正常调用
            return originalUniMethods.showModal(options);
        };
        
        // 重写uni.reLaunch方法
        uni.reLaunch = function(options) {
            console.log('开发环境：拦截reLaunch调用', options);
            
            // 在开发环境中，将reLaunch转换为navigateTo（如果可能）
            if (options && options.url) {
                // 检查是否为登录相关的跳转
                if (options.url.indexOf('/pages/my/my') !== -1 || 
                    options.url.indexOf('/pages/login') !== -1) {
                    
                    console.log('开发环境：阻止登录相关的强制跳转');
                    
                    // 显示提示而不是强制跳转
                    uni.showToast({
                        title: '开发环境：已阻止自动跳转',
                        icon: 'none',
                        duration: 2000
                    });
                    return;
                }
            }
            
            // 非登录相关的跳转正常执行
            return originalUniMethods.reLaunch(options);
        };
        
        // 重写uni.request方法，添加开发环境的错误处理
        uni.request = function(options) {
            const originalSuccess = options.success;
            const originalFail = options.fail;
            
            // 重写success回调
            options.success = function(res) {
                // 检查响应中的登录状态
                if (res.data && res.data.code === -1) {
                    console.log('开发环境：检测到API返回登录失效', res);
                    
                    // 在开发环境中，修改响应以避免触发登录跳转
                    res.data = {
                        ...res.data,
                        code: -999, // 使用特殊的错误码，避免触发默认的登录跳转
                        msg: '开发环境：token验证失败，已自动处理'
                    };
                }
                
                if (originalSuccess) {
                    originalSuccess(res);
                }
            };
            
            // 重写fail回调
            options.fail = function(err) {
                console.log('开发环境：API请求失败', err);
                
                if (originalFail) {
                    originalFail(err);
                }
            };
            
            return originalUniMethods.request(options);
        };
        
        // 添加开发环境的全局错误处理
        window.addEventListener('error', function(e) {
            console.log('开发环境：捕获到错误', e);
        });
        
        // 添加调试信息
        console.log('Zalo开发环境修复已激活:');
        console.log('- 已重写uni.showModal方法');
        console.log('- 已重写uni.reLaunch方法');
        console.log('- 已重写uni.request方法');
        console.log('- 登录过期将显示友好提示而不是强制跳转');
        
        // 在控制台添加调试工具
        window.zaloDevTools = {
            // 模拟token过期
            simulateTokenExpire: function() {
                uni.showModal({
                    title: '',
                    content: '您的登录状态已过期，请重新登录！',
                    showCancel: false,
                    confirmText: '去登录',
                    success: function(res) {
                        if (res.confirm) {
                            uni.reLaunch({url: '/pages/my/my'});
                        }
                    }
                });
            },
            
            // 重置修复
            resetFix: function() {
                uni.showModal = originalUniMethods.showModal;
                uni.reLaunch = originalUniMethods.reLaunch;
                uni.request = originalUniMethods.request;
                console.log('已重置为原始方法');
            },
            
            // 获取当前环境信息
            getEnvInfo: function() {
                return {
                    isDev: IS_DEV,
                    userAgent: navigator.userAgent,
                    hostname: window.location.hostname,
                    search: window.location.search
                };
            }
        };
        
        console.log('调试工具已添加到 window.zaloDevTools');
    });
    
})(); 