<?php
namespace app\common\library\ZaloSdk;
use app\common\library\http\Curl;

class Zalo {
    
    // 配置文件
    private $config = [
       'appid' => '3310500707791294854',
       'secret' => '1Y6G62fK4L6YgnGjm6eW',
    ];
     
    public function __construct() {
                  
    } 
    
    public function hmac_data($data,$key){
        $hash = hash_hmac("sha256",$data,$key,true);
        # 转换为16进制值
        return bin2hex($hash);
    }
    
    // token 换取 个人信息    
    public function getProfile($accessToken){
        $api = 'https://graph.zalo.me/v2.0/me';
        $appSecretProof = $this->hmac_data($accessToken,$this->config['secret']);
        $header = [
          'access_token:'.$accessToken,
          'appsecret_proof:'.$appSecretProof
        ];
        $curl = (new Curl());
        $body = [
          'fields' => "id,name,birthday,picture",    
        ];
        $response = $curl->get($api,$body,$header);
        if ($response){
            $responseJson = json_decode($response,true);
            if ($responseJson['error']==0){
                return $responseJson;
            }else{
                return false;
            }
        }
        // halt($response); die;
    }
}