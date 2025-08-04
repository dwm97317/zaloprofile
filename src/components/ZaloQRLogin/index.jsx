import React, { useState, useEffect, useRef } from 'react';
import { showToast } from 'zmp-ui';
import QRCode from 'qrcode';
import { request } from '../../utils/util';
import './index.scss';

const ZaloQRLogin = ({ onLoginSuccess, onLoginError, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [status, setStatus] = useState('loading'); // loading, ready, scanning, success, error, expired
  const [message, setMessage] = useState('正在生成二维码...');
  const [oauthState, setOauthState] = useState('');
  const canvasRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // 生成二维码
  const generateQRCode = async () => {
    try {
      setStatus('loading');
      setMessage('正在生成二维码...');

      const response = await request({
        url: '/api/passport/getZaloOAuthUrl',
        method: 'GET'
      });

      if (response.code === 1) {
        const { oauth_url, state, expires_in } = response.data;
        
        // 生成二维码
        const canvas = canvasRef.current;
        await QRCode.toCanvas(canvas, oauth_url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(oauth_url);
        setOauthState(state);
        setStatus('ready');
        setMessage('请使用Zalo扫描二维码登录');

        // 开始轮询检查登录状态
        startPolling(state);

        // 设置过期时间
        timeoutRef.current = setTimeout(() => {
          setStatus('expired');
          setMessage('二维码已过期，请刷新重试');
          stopPolling();
        }, expires_in * 1000);

      } else {
        throw new Error(response.msg || '生成二维码失败');
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
      setStatus('error');
      setMessage('生成二维码失败: ' + error.message);
      if (onLoginError) {
        onLoginError(error);
      }
    }
  };

  // 开始轮询检查登录状态
  const startPolling = (state) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await request({
          url: '/api/passport/checkZaloOAuthStatus',
          method: 'GET',
          data: { state }
        });

        if (response.code === 1) {
          const { status: loginStatus } = response.data;

          if (loginStatus === 'success') {
            setStatus('success');
            setMessage('登录成功！');
            stopPolling();

            // 调用成功回调
            if (onLoginSuccess) {
              onLoginSuccess(response.data);
            }

            showToast({
              message: '登录成功！',
              type: 'success'
            });

          } else if (loginStatus === 'pending') {
            if (status !== 'scanning') {
              setStatus('scanning');
              setMessage('检测到扫码，等待授权...');
            }
          }
        } else {
          // 登录失败
          setStatus('error');
          setMessage(response.msg || '登录失败');
          stopPolling();

          if (onLoginError) {
            onLoginError(new Error(response.msg || '登录失败'));
          }
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        // 不中断轮询，继续尝试
      }
    }, 2000); // 每2秒检查一次
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 刷新二维码
  const refreshQRCode = () => {
    stopPolling();
    generateQRCode();
  };

  // 组件挂载时生成二维码
  useEffect(() => {
    generateQRCode();

    // 组件卸载时清理
    return () => {
      stopPolling();
    };
  }, []);

  // 获取状态图标
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'ready':
        return '📱';
      case 'scanning':
        return '👀';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '📱';
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
      case 'expired':
        return '#f44336';
      case 'scanning':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <div className="zalo-qr-login">
      <div className="qr-login-header">
        <h3>Zalo扫码登录</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="qr-code-container">
        <canvas
          ref={canvasRef}
          className={`qr-canvas ${status}`}
          style={{
            opacity: status === 'loading' ? 0.5 : 1,
            filter: status === 'expired' ? 'grayscale(100%)' : 'none'
          }}
        />
        
        {status === 'loading' && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <div className="status-info">
        <div 
          className="status-icon"
          style={{ color: getStatusColor() }}
        >
          {getStatusIcon()}
        </div>
        <div 
          className="status-message"
          style={{ color: getStatusColor() }}
        >
          {message}
        </div>
      </div>

      <div className="qr-actions">
        {(status === 'expired' || status === 'error') && (
          <button 
            className="refresh-btn"
            onClick={refreshQRCode}
          >
            🔄 刷新二维码
          </button>
        )}
        
        {status === 'ready' && (
          <div className="qr-tips">
            <p>1. 打开Zalo应用</p>
            <p>2. 扫描上方二维码</p>
            <p>3. 确认授权登录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZaloQRLogin;
