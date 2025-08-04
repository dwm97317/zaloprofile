<?php
declare (strict_types=1);

namespace app\api\controller;

use app\api\service\passport\Login as LoginService;

/**
 * 用户认证模块
 * Class Passport
 * @package app\api\controller
 */
class Passport extends Controller
{
    public function getCode(){
        $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx483d93f2c89fb198&redirect_uri=http%3A%2F%2Fzhuanyun.sllowly.cn/index.php?s=/api/passport/loginwx&wxapp_id=10001&response_type=code&scope=snsapi_userinfo&state=10001#wechat_redirect";
        
        return $url;
    }
    
    public function register(){
        $LoginService = new LoginService;
        $data = $this->postData();
        $data['wxapp_id'] = $this->wxapp_id;
        if (!$LoginService->registerMobile($data)) {
            return $this->renderError($LoginService->getError());
        }
        return $this->renderSuccess([],'注册成功，请前往登录');
    }
    
    /**
     * 找回密码
     * Class Passport
     * @package app\api\controller
     */
    public function findpassword(){
        $LoginService = new LoginService;
        if (!$LoginService->findpassword($this->postData())) {
            return $this->renderError($LoginService->getError());
        }
        return $this->renderSuccess([],'重置成功，请前往登录');
    }

    
    /**
     * 登录接口 (需提交手机号、短信验证码、第三方用户信息)
     * @return array|\think\response\Json
     * @throws \app\common\exception\BaseException
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function login()
    {
        // 执行登录
        $LoginService = new LoginService;
        if (!$LoginService->login($this->postData())) {
            return $this->renderError($LoginService->getError());
        }
        // 用户信息
        $userInfo = $LoginService->getUserInfo();
        return $this->renderSuccess([
            'userId' => (int)$userInfo['user_id'],
            'token' => $LoginService->getToken((int)$userInfo['user_id'])
        ], '登录成功');
    }

    /**
     * 微信小程序快捷登录 (需提交wx.login接口返回的code、微信用户公开信息)
     * 业务流程：判断openid是否存在 -> 存在:  更新用户登录信息 -> 返回userId和token
     *                          -> 不存在: 返回false, 跳转到注册页面
     * @return array|\think\response\Json
     * @throws \app\common\exception\BaseException
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function loginMpWx()
    {
        // 微信小程序一键登录
        $LoginService = new LoginService;
        if (!$LoginService->loginMpWx($this->postForm())) {
            return $this->renderError($LoginService->getError());
        }
        // 获取登录成功后的用户信息
        $userInfo = $LoginService->getUserInfo();
        return $this->renderSuccess([
            'userId' => (int)$userInfo['user_id'],
            'token' => $LoginService->getToken((int)$userInfo['user_id'])
        ], '登录成功');
    }
    
    /**
     * zalo小程序快捷登录 (需提交accessToken接口返回的code、微信用户公开信息)
     * 业务流程：判断openid是否存在 -> 存在:  更新用户登录信息 -> 返回userId和token
     *                          -> 不存在: 返回false, 跳转到注册页面
     * @return array|\think\response\Json
     * @throws \app\common\exception\BaseException
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function loginbyzalo(){
        // 微信小程序一键登录
        $LoginService = new LoginService;
        file_put_contents('token',var_export($this->postForm(),true));
        if (!$LoginService->loginMpZalo($this->postForm())) {
            return $this->renderError($LoginService->getError());
        }
        // 获取登录成功后的用户信息
        $userInfo = $LoginService->getUserInfo();
        return $this->renderSuccess([
            'userId' => (int)$userInfo['user_id'],
            'nickname' => (string) $userInfo['nickName'],
            'avatarUrl' => (string) $userInfo['avatarUrl'],
            'token' => $LoginService->getToken((int)$userInfo['user_id'])
        ], '登录成功');
    }

    /**
     * 获取Zalo OAuth授权URL和二维码
     * @return array|\think\response\Json
     */
    public function getZaloOAuthUrl(){
        try {
            // 生成唯一的state参数
            $state = md5(uniqid() . time());

            // 设置回调URL - 使用用户在开发者控制台配置的回调URL
            $redirectUri = 'https://zalonew.itaoth.com/index.php?s=/api/zaloapi/event';

            // 创建Zalo实例并生成OAuth URL (使用PKCE)
            $zalo = new \app\common\library\ZaloSdk\Zalo();
            $oauthData = $zalo->getOAuthUrl($redirectUri, $state);

            // 将state存储到缓存中，包括code_verifier用于后续验证
            \think\Cache::set('zalo_oauth_state_' . $state, [
                'created_at' => time(),
                'redirect_uri' => $redirectUri,
                'login_status' => 'pending',
                'code_verifier' => $oauthData['code_verifier']
            ], 600);

            return $this->renderSuccess([
                'oauth_url' => $oauthData['oauth_url'],
                'state' => $state,
                'qr_data' => $oauthData['oauth_url'], // 用于生成二维码的数据
                'expires_in' => 600 // 10分钟有效期
            ]);

        } catch (\Exception $e) {
            return $this->renderError('生成OAuth URL失败: ' . $e->getMessage());
        }
    }

    /**
     * Zalo OAuth回调处理
     * @return array|\think\response\Json
     */
    public function zaloCallback(){
        try {
            $code = $this->request->param('code');
            $state = $this->request->param('state');
            $error = $this->request->param('error');

            // 检查是否有错误
            if ($error) {
                $errorMsg = $this->request->param('error_description', '用户取消授权');
                // 更新缓存状态
                if ($state) {
                    \think\Cache::set('zalo_oauth_state_' . $state, [
                        'login_status' => 'error',
                        'error_message' => $errorMsg
                    ], 60);
                }
                return $this->renderError($errorMsg);
            }

            // 验证必要参数
            if (!$code || !$state) {
                return $this->renderError('缺少必要参数');
            }

            // 验证state参数
            $stateData = \think\Cache::get('zalo_oauth_state_' . $state);
            if (!$stateData) {
                return $this->renderError('无效的state参数或已过期');
            }

            // 使用code换取access token
            $zalo = new \app\common\library\ZaloSdk\Zalo();
            $tokenResponse = $zalo->getAccessTokenByCode($code, $stateData['redirect_uri']);

            if (!isset($tokenResponse['access_token'])) {
                throw new \Exception('获取access token失败');
            }

            // 使用access token获取用户信息并登录
            $LoginService = new LoginService;
            $loginData = [
                'accesstoken' => $tokenResponse['access_token']
            ];

            if (!$LoginService->loginMpZalo($loginData)) {
                throw new \Exception($LoginService->getError());
            }

            // 获取登录成功后的用户信息
            $userInfo = $LoginService->getUserInfo();

            // 更新缓存状态为成功
            \think\Cache::set('zalo_oauth_state_' . $state, [
                'login_status' => 'success',
                'user_id' => (int)$userInfo['user_id'],
                'nickname' => (string) $userInfo['nickName'],
                'avatarUrl' => (string) $userInfo['avatarUrl'],
                'token' => $LoginService->getToken((int)$userInfo['user_id']),
                'access_token' => $tokenResponse['access_token']
            ], 300); // 5分钟有效期

            // 返回成功页面
            $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>登录成功</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
        .message { color: #666; font-size: 16px; }
    </style>
</head>
<body>
    <div class="success">✓ 登录成功！</div>
    <div class="message">请返回原页面继续操作</div>
    <script>
        // 尝试关闭窗口（如果是弹窗）
        setTimeout(function() {
            if (window.opener) {
                window.close();
            }
        }, 2000);
    </script>
</body>
</html>';

            return response($html)->header('Content-Type', 'text/html; charset=utf-8');

        } catch (\Exception $e) {
            // 更新缓存状态为错误
            if (isset($state)) {
                \think\Cache::set('zalo_oauth_state_' . $state, [
                    'login_status' => 'error',
                    'error_message' => $e->getMessage()
                ], 60);
            }

            $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>登录失败</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
        .message { color: #666; font-size: 16px; }
    </style>
</head>
<body>
    <div class="error">✗ 登录失败</div>
    <div class="message">' . htmlspecialchars($e->getMessage()) . '</div>
    <script>
        setTimeout(function() {
            if (window.opener) {
                window.close();
            }
        }, 3000);
    </script>
</body>
</html>';

            return response($html)->header('Content-Type', 'text/html; charset=utf-8');
        }
    }

    /**
     * 检查OAuth登录状态（供前端轮询使用）
     * @return array|\think\response\Json
     */
    public function checkZaloOAuthStatus(){
        $state = $this->request->param('state');

        if (!$state) {
            return $this->renderError('缺少state参数');
        }

        $stateData = \think\Cache::get('zalo_oauth_state_' . $state);

        if (!$stateData) {
            return $this->renderError('无效的state参数或已过期');
        }

        $status = $stateData['login_status'] ?? 'pending';

        switch ($status) {
            case 'success':
                return $this->renderSuccess([
                    'status' => 'success',
                    'user_id' => $stateData['user_id'],
                    'nickname' => $stateData['nickname'],
                    'avatarUrl' => $stateData['avatarUrl'],
                    'token' => $stateData['token']
                ]);

            case 'error':
                return $this->renderError($stateData['error_message'] ?? '登录失败');

            case 'pending':
            default:
                return $this->renderSuccess([
                    'status' => 'pending',
                    'message' => '等待用户授权...'
                ]);
        }
    }

    public function loginClerk()
    {
        // 微信小程序一键登录
        $LoginService = new LoginService;
        $data = $this->request->param();
        // dump($data);die;
        if (!$LoginService->loginMpWxMobileClerk($data)) {
            return $this->renderError($LoginService->getError());
        }
        // 获取登录成功后的用户信息
        $userInfo = $LoginService->getUserInfo();
        return $this->renderSuccess([
            'wxapp_id'=>$userInfo['wxapp_id'],
            'userId' => (int)$userInfo['user_id'],
            'token' => $LoginService->getToken((int)$userInfo['user_id'])
        ], '登录成功');
    }
    
    /**
     * 微信公众号快捷登录 (需提交wx.login接口返回的code、微信用户公开信息)
     * 业务流程：判断openid是否存在 -> 存在:  更新用户登录信息 -> 返回userId和token
     *                          -> 不存在: 返回false, 跳转到注册页面
     * @return array|\think\response\Json
     * @throws \app\common\exception\BaseException
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function loginWxOfficial()
    {
        // 微信小程序一键登录
        $LoginService = new LoginService;
   
        if (!$LoginService->loginWxOfficial($this->postForm())) {
            return $this->renderError($LoginService->getError());
        }
        // 获取登录成功后的用户信息
        $userInfo = $LoginService->getUserInfo();
        return $this->renderSuccess([
            'userId' => (int)$userInfo['user_id'],
            'token' => $LoginService->getToken((int)$userInfo['user_id'])
        ], '微信授权登录成功');
    }

    /**
     * 快捷登录: 微信小程序授权手机号登录
     * @return array|\think\response\Json
     * @throws \app\common\exception\BaseException
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\DbException
     * @throws \think\db\exception\ModelNotFoundException
     */
    public function loginMpWxMobile()
    {
        // 微信小程序一键登录
        $LoginService = new LoginService;
        if (!$LoginService->loginMpWxMobile($this->request->param())) {
            return $this->renderError($LoginService->getError());
        }
        // 获取登录成功后的用户信息
        $userInfo = $LoginService->getUserInfo();
        return $this->renderSuccess([
            'userId' => (int)$userInfo['user_id'],
            'token' => $LoginService->getToken((int)$userInfo['user_id'])
        ], '登录成功');
    }
}