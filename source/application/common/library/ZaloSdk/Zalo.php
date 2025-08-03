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
    
    public function hmac_data($data, $key) {
        $hash = hash_hmac("sha256", $data, $key, true);
        # 转换为16进制值
        return bin2hex($hash);
    }
    
    public function getLocationByToken($params){
        $api = 'https://graph.zalo.me/v2.0/me/info';
        $header = [
          'code:'.$params['code'],
          'access_token:'.$params['accesstoken'],
          'secret_key:'.$this->config['secret']
        ];
        $curl = curl_init();
        curl_setopt($curl,CURLOPT_URL,$api);
        curl_setopt($curl,CURLOPT_HTTPHEADER,$header);
        curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
        $response = curl_exec($curl);
        file_put_contents('err.txt',$response);
        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception("cURL Error: " . $error);
        }
          
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        if ($httpCode != 200) {
            throw new Exception("API Request Error: HTTP Code " . $httpCode);
        }
        
        $decodedResponse = json_decode($response, true);
        
        if ($decodedResponse === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON Decode Error: " . json_last_error_msg());
        }
        
        return $decodedResponse;
    }
    
    // token 换取 个人信息    
    function getProfile($accessToken) {
        $url = "https://graph.zalo.me/v2.0/me?fields=id,name,picture";
        
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'access_token: ' . $accessToken
            ]
        ]);
        
        $response = curl_exec($curl);
        
        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception("cURL Error: " . $error);
        }
        
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        curl_close($curl);
        
        if ($httpCode != 200) {
            throw new Exception("API Request Error: HTTP Code " . $httpCode);
        }
        
        $decodedResponse = json_decode($response, true);
        
        if ($decodedResponse === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON Decode Error: " . json_last_error_msg());
        }
        
        return $decodedResponse;
    }
}