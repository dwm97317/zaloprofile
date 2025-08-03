<?php
namespace app\api\controller;
use think\Db;
use app\common\library\ZaloSdk\ZaloOfficialApi;
/**
 * zaloApi 控制器
 * */
class Zaloapi {
    
    public function event(){
      if (isset($_GET['verify_token']) && $_GET['verify_token'] === 'YOUR_VERIFY_TOKEN') {
          echo $_GET['challenge']; // 返回 challenge 字符串完成验证
          exit;
      }
       ZaloOfficialApi::sendfollowerMessage('8890635404729405962');
       die;
      // 获取原始 POST 数据
      $input = file_get_contents('php://input');
    //   $input = '{"oa_id":"140130397183308120","follower":{"id":"8890635404729405962"},"user_id_by_app":"6655413641204889003","event_name":"follow","source":"zalo","app_id":"3310500707791294854","timestamp":"1752295684665"}';
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
    
}