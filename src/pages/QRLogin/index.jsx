import React, { useEffect } from 'react';
import { Page, Header, useNavigate } from 'zmp-ui';
import { useSetRecoilState } from 'recoil';
import { userState } from '../../state';
import ZaloQRLogin from '../../components/ZaloQRLogin';
import { setStorage, showToast } from 'zmp-sdk';
import './index.scss';

const QRLoginPage = () => {
  const navigate = useNavigate();
  const setUserState = useSetRecoilState(userState);

  // 处理二维码登录成功
  const handleQRLoginSuccess = async (loginData) => {
    console.log("二维码登录成功:", loginData);
    
    try {
      const { user_id, nickname, avatarUrl, token } = loginData;
      
      // 构建用户信息
      const userInfo = {
        isLogin: true,
        user_id: user_id,
        nickname: nickname || '',
        avatarUrl: avatarUrl || '',
        token: token
      };

      // 存储用户信息
      await setStorage({
        data: {
          isLogin: true,
          nickname: nickname || '',
          avatarUrl: avatarUrl || '',
          token: token,
          user_id: user_id,
          userInfo: userInfo
        }
      });

      // 更新Recoil状态
      setUserState({
        token: token,
        user_id: user_id,
        nickname: nickname || '',
        avatarUrl: avatarUrl || ''
      });

      showToast({
        message: "登录成功！",
        type: "success"
      });

      // 延迟跳转到个人中心
      setTimeout(() => {
        navigate('/mine', { replace: true });
      }, 1500);

    } catch (error) {
      console.error("处理二维码登录成功回调失败:", error);
      showToast({
        message: "登录处理失败，请重试",
        type: "fail"
      });
    }
  };

  // 处理二维码登录失败
  const handleQRLoginError = (error) => {
    console.error("二维码登录失败:", error);
    showToast({
      message: error.message || "登录失败，请重试",
      type: "fail"
    });
  };

  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };

  return (
    <Page className="qr-login-page">
      <Header 
        title="扫码登录" 
        showBackIcon={true}
        onBackClick={goBack}
      />
      
      <div className="qr-login-container">
        <div className="qr-login-header">
          <h2>使用Zalo扫码登录</h2>
          <p>请使用手机Zalo应用扫描下方二维码完成登录</p>
        </div>

        <ZaloQRLogin
          onLoginSuccess={handleQRLoginSuccess}
          onLoginError={handleQRLoginError}
        />

        <div className="qr-login-footer">
          <div className="login-tips">
            <h4>登录说明：</h4>
            <ul>
              <li>确保您的手机已安装Zalo应用</li>
              <li>打开Zalo，点击扫一扫功能</li>
              <li>扫描上方二维码并确认授权</li>
              <li>授权成功后将自动完成登录</li>
            </ul>
          </div>

          <div className="alternative-login">
            <p>也可以使用其他方式登录：</p>
            <button 
              className="mini-app-login-btn"
              onClick={() => navigate('/mine')}
            >
              返回Mini App登录
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default QRLoginPage;
