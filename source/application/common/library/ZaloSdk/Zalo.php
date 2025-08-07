<?php
namespace app\common\library\ZaloSdk;
use app\common\library\http\Curl;

class Zalo {
    
    // 配置文件
    private $config = [
       'appid' => '757872350750612320',
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

    /**
     * 生成OAuth授权URL (使用PKCE)
     * @param string $redirectUri 回调URL
     * @param string $state 状态参数，用于防CSRF攻击
     * @return array 包含oauth_url, code_verifier, code_challenge
     */
    public function getOAuthUrl($redirectUri, $state) {
        // 生成code_verifier (43个字符的随机字符串)
        $codeVerifier = $this->generateCodeVerifier();

        // 生成code_challenge
        $codeChallenge = $this->generateCodeChallenge($codeVerifier);

        $params = [
            'app_id' => $this->config['appid'],
            'redirect_uri' => $redirectUri,
            'code_challenge' => $codeChallenge,
            'state' => $state
        ];

        return [
            'oauth_url' => 'https://oauth.zaloapp.com/v4/permission?' . http_build_query($params),
            'code_verifier' => $codeVerifier,
            'code_challenge' => $codeChallenge
        ];
    }

    /**
     * 生成code_verifier
     * @return string
     */
    private function generateCodeVerifier() {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $codeVerifier = '';
        for ($i = 0; $i < 43; $i++) {
            $codeVerifier .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $codeVerifier;
    }

    /**
     * 生成code_challenge
     * @param string $codeVerifier
     * @return string
     */
    private function generateCodeChallenge($codeVerifier) {
        $hash = hash('sha256', $codeVerifier, true);
        return rtrim(strtr(base64_encode($hash), '+/', '-_'), '=');
    }

    /**
     * 使用authorization code换取access token (OAuth V4)
     * @param string $code 授权码
     * @param string $redirectUri 回调URL（必须与获取code时使用的相同）
     * @param string $codeVerifier code verifier用于PKCE验证
     * @return array
     * @throws Exception
     */
    public function getAccessTokenByCode($code, $redirectUri, $codeVerifier = null) {
        $url = "https://oauth.zaloapp.com/v4/access_token";

        $postData = [
            'code' => $code,
            'app_id' => $this->config['appid'],
            'grant_type' => 'authorization_code'
        ];

        // 如果提供了code_verifier，添加到请求中
        if ($codeVerifier) {
            $postData['code_verifier'] = $codeVerifier;
        }

        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($postData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
                'secret_key: ' . $this->config['secret']
            ]
        ]);

        $response = curl_exec($curl);

        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new \Exception("cURL Error: " . $error);
        }

        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode != 200) {
            throw new \Exception("API Request Error: HTTP Code " . $httpCode . ", Response: " . $response);
        }

        $decodedResponse = json_decode($response, true);

        if ($decodedResponse === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("JSON Decode Error: " . json_last_error_msg());
        }

        if (isset($decodedResponse['error'])) {
            throw new \Exception("OAuth Error: " . $decodedResponse['error'] . " - " . ($decodedResponse['error_description'] ?? 'Unknown error'));
        }

        return $decodedResponse;
    }

    /**
     * 获取用户信息
     * @param string $accessToken 访问令牌
     * @return array
     * @throws Exception
     */
    public function getUserInfo($accessToken) {
        $url = "https://graph.zalo.me/v2.0/me?fields=id,name,picture";

        $headers = [
            'access_token: ' . $accessToken
        ];

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        if ($error) {
            curl_close($curl);
            throw new \Exception("CURL Error: " . $error);
        }

        curl_close($curl);

        if ($httpCode != 200) {
            throw new \Exception("API Request Error: HTTP Code " . $httpCode . ", Response: " . $response);
        }

        $decodedResponse = json_decode($response, true);

        if ($decodedResponse === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("JSON Decode Error: " . json_last_error_msg());
        }

        if (isset($decodedResponse['error'])) {
            throw new \Exception("Graph API Error: " . $decodedResponse['error']['message'] ?? 'Unknown error');
        }

        return $decodedResponse;
    }
}