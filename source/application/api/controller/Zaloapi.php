<?php
namespace app\api\controller;
use think\Db;
use app\common\library\ZaloSdk\ZaloOfficialApi;
/**
 * zaloApi 控制器
 * */
class Zaloapi {
    
    public function event(){
      // 处理OAuth回调 - 检查是否有code和state参数
      if (isset($_GET['code']) && isset($_GET['state'])) {
          return $this->handleOAuthCallback();
      }

      if (isset($_GET['verify_token']) && $_GET['verify_token'] === 'YOUR_VERIFY_TOKEN') {
          echo $_GET['challenge']; // 返回 challenge 字符串完成验证
          exit;
      }
       ZaloOfficialApi::sendfollowerMessage('8890635404729405962');
       die;
      // 获取原始 POST 数据
      $input = file_get_contents('php://input');
    //   $input = '{"oa_id":"140130397183308120","follower":{"id":"8890635404729405962"},"user_id_by_app":"6655413641204889003","event_name":"follow","source":"zalo","app_id":"757872350750612320","timestamp":"1752295684665"}';
      file_put_contents('debug.txt',$input."\r\n");
      $data = json_decode($input, true);
      
    //   file_put_contents('debug.txt',var_export($_SERVER,true),FILE_APPEND);
        
      // 验证事件签名（可选但推荐）
      $secretKey = 'g9dDV1yXv1McHITsyu5A';
    //   $signature = $_SERVER['HTTP_X_ZEVENT_SIGNATURE'];
      $signature = 'mac=d99bf3594a7e3ea2f03432af132c1eb9df618ad1e919efc3b210e72d800e1965';
    //   file_put_contents('debug.txt',$signature,FILE_APPEND);
    //   if (hash_hmac('sha256', $input, $secretKey) !== $signature) {
    //         http_response_code(403);
    //         exit('Invalid signature');
    //   }
      // 处理关注事件
      if ($data['event_name'] === 'follow') {
            $userId = $data['follower']['id'];
            file_put_contents('debug.txt','收到关注事件信息:'.$userId."用户ID关注了公众号\r\n",FILE_APPEND);
            if (!Db::name('zaloa_user')->where('oa_user_id',$userId)->find()){
                Db::name('zaloa_user')->insert([
                  'oa_user_id' => $userId,
                  'create_time' => time(),
                  'update_time' => time()
                ]);
            }
            ZaloOfficialApi::sendfollowerMessage($userId);
            // 存储用户关注状态（数据库操作）
            // // 例如：发送欢迎消息
            // $client->post('/v3.0/oa/message/send', [
            //     'headers' => ['access_token' => 'YOUR_OA_TOKEN'],
            //     'json' => [
            //         'recipient' => ['user_id' => $userId],
            //         'message' => ['text' => '感谢关注！']
            //     ]
            // ]);
        }
        
        // 处理取消关注事件
        else if ($data['event_name'] === 'user_unfollow') {
            $userId = $data['user_id'];
            // 更新用户状态为“未关注”
        }
        http_response_code(200);
        echo "ok";
        exit; 
    }
    
    public function update(){
        
    }
    
    //从zalo获取accessToken
    public function getZaloAccessToken(){
        file_put_contents('debug.log',var_dump(1111));
    }

    /**
     * 处理OAuth回调
     * @return \think\response\Json
     */
    private function handleOAuthCallback(){
        try {
            $code = $_GET['code'];
            $state = $_GET['state'];
            $error = $_GET['error'] ?? null;

            // 记录回调日志
            file_put_contents('oauth_callback.log', date('Y-m-d H:i:s') . " - OAuth Callback: code={$code}, state={$state}, error={$error}\n", FILE_APPEND);

            if ($error) {
                // 处理授权错误
                \think\Cache::set('zalo_oauth_state_' . $state, [
                    'login_status' => 'error',
                    'error' => $error,
                    'updated_at' => time()
                ], 600);

                // 返回错误页面或重定向
                return $this->renderError('授权失败: ' . $error);
            }

            // 验证state参数
            $stateData = \think\Cache::get('zalo_oauth_state_' . $state);
            if (!$stateData) {
                file_put_contents('oauth_callback.log', date('Y-m-d H:i:s') . " - Invalid state: {$state}\n", FILE_APPEND);
                return $this->renderError('无效的授权状态');
            }

            // 使用授权码获取访问令牌 (使用code_verifier)
            $zalo = new \app\common\library\ZaloSdk\Zalo();
            $redirectUri = 'https://zalonew.itaoth.com/index.php?s=/api/zaloapi/event';
            $codeVerifier = $stateData['code_verifier'] ?? null;
            $tokenResult = $zalo->getAccessTokenByCode($code, $redirectUri, $codeVerifier);

            if (!$tokenResult || !isset($tokenResult['access_token'])) {
                file_put_contents('oauth_callback.log', date('Y-m-d H:i:s') . " - Token exchange failed\n", FILE_APPEND);
                return $this->renderError('获取访问令牌失败');
            }

            // 获取用户信息
            $userInfo = $zalo->getUserInfo($tokenResult['access_token']);
            if (!$userInfo || !isset($userInfo['id'])) {
                file_put_contents('oauth_callback.log', date('Y-m-d H:i:s') . " - Get user info failed\n", FILE_APPEND);
                return $this->renderError('获取用户信息失败');
            }

            // 更新缓存状态为成功
            \think\Cache::set('zalo_oauth_state_' . $state, [
                'login_status' => 'success',
                'user_info' => $userInfo,
                'access_token' => $tokenResult['access_token'],
                'updated_at' => time()
            ], 600);

            file_put_contents('oauth_callback.log', date('Y-m-d H:i:s') . " - OAuth success for user: " . $userInfo['id'] . "\n", FILE_APPEND);

            // 返回成功页面
            return $this->renderSuccess('授权成功！请返回应用继续操作。');

        } catch (\Exception $e) {
            file_put_contents('oauth_callback.log', date('Y-m-d H:i:s') . " - Exception: " . $e->getMessage() . "\n", FILE_APPEND);
            return $this->renderError('处理授权回调时发生错误: ' . $e->getMessage());
        }
    }

    /**
     * 渲染成功响应
     */
    private function renderSuccess($message) {
        return json([
            'code' => 1,
            'msg' => $message
        ]);
    }

    /**
     * 渲染错误响应
     */
    private function renderError($message) {
        return json([
            'code' => 0,
            'msg' => $message
        ]);
    }

}