<?php
namespace app\common\library\GoongApi;

/**
 * Goong API集成类
 * 用于越南地址补全、地理编码等功能
 */
class GoongApi 
{
    private $apiKey;
    private $baseUrl = 'https://rsapi.goong.io';
    
    public function __construct($apiKey = null) 
    {
        $this->apiKey = $apiKey ?: '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
    }
    
    /**
     * 地址自动补全
     * @param string $input 输入的地址关键词
     * @param array $options 额外选项
     * @return array|false
     */
    public function autocomplete($input, $options = [])
    {
        $params = [
            'api_key' => $this->apiKey,
            'input' => $input,
            'limit' => $options['limit'] ?? 10,
        ];
        
        // 添加位置偏好（如果提供）
        if (isset($options['location'])) {
            $params['location'] = $options['location'];
            $params['radius'] = $options['radius'] ?? 50000; // 50km 默认半径
        }
        
        // 限制搜索类型
        if (isset($options['types'])) {
            $params['types'] = $options['types'];
        }
        
        $url = $this->baseUrl . '/Place/AutoComplete?' . http_build_query($params);
        
        return $this->makeRequest($url);
    }
    
    /**
     * 地理编码 - 地址转坐标
     * @param string $address 地址
     * @return array|false
     */
    public function geocode($address)
    {
        $params = [
            'api_key' => $this->apiKey,
            'address' => $address,
        ];
        
        $url = $this->baseUrl . '/Geocode?' . http_build_query($params);
        
        return $this->makeRequest($url);
    }
    
    /**
     * 反向地理编码 - 坐标转地址
     * @param float $lat 纬度
     * @param float $lng 经度
     * @return array|false
     */
    public function reverseGeocode($lat, $lng)
    {
        $params = [
            'api_key' => $this->apiKey,
            'latlng' => $lat . ',' . $lng,
        ];
        
        $url = $this->baseUrl . '/Geocode?' . http_build_query($params);
        
        return $this->makeRequest($url);
    }
    
    /**
     * 获取地点详情
     * @param string $placeId 地点ID
     * @return array|false
     */
    public function placeDetail($placeId)
    {
        $params = [
            'api_key' => $this->apiKey,
            'place_id' => $placeId,
        ];
        
        $url = $this->baseUrl . '/Place/Detail?' . http_build_query($params);
        
        return $this->makeRequest($url);
    }
    
    /**
     * 解析地址为越南标准格式
     * @param array $addressComponents Goong返回的地址组件
     * @return array
     */
    public function parseVietnameseAddress($addressComponents)
    {
        $result = [
            'province' => '',
            'district' => '',
            'ward' => '',
            'street' => '',
            'house_number' => '',
            'formatted_address' => '',
        ];
        
        if (!isset($addressComponents['results']) || empty($addressComponents['results'])) {
            return $result;
        }
        
        $addressResult = $addressComponents['results'][0];
        $result['formatted_address'] = $addressResult['formatted_address'] ?? '';
        
        if (isset($addressResult['address_components'])) {
            foreach ($addressResult['address_components'] as $component) {
                $types = $component['types'];
                $longName = $component['long_name'];
                
                if (in_array('administrative_area_level_1', $types)) {
                    $result['province'] = $longName; // Tỉnh/Thành phố
                } elseif (in_array('administrative_area_level_2', $types)) {
                    $result['district'] = $longName; // Quận/Huyện
                } elseif (in_array('administrative_area_level_3', $types)) {
                    $result['ward'] = $longName; // Phường/Xã
                } elseif (in_array('route', $types)) {
                    $result['street'] = $longName; // Đường
                } elseif (in_array('street_number', $types)) {
                    $result['house_number'] = $longName; // Số nhà
                }
            }
        }
        
        return $result;
    }
    
    /**
     * 获取越南省份列表
     * @return array
     */
    public function getVietnameseProvinces()
    {
        // 越南63个省市列表
        return [
            ['name' => 'An Giang', 'code' => 'AG'],
            ['name' => 'Bà Rịa - Vũng Tàu', 'code' => 'BR-VT'],
            ['name' => 'Bắc Giang', 'code' => 'BG'],
            ['name' => 'Bắc Kạn', 'code' => 'BK'],
            ['name' => 'Bạc Liêu', 'code' => 'BL'],
            ['name' => 'Bắc Ninh', 'code' => 'BN'],
            ['name' => 'Bến Tre', 'code' => 'BT'],
            ['name' => 'Bình Định', 'code' => 'BD'],
            ['name' => 'Bình Dương', 'code' => 'BI'],
            ['name' => 'Bình Phước', 'code' => 'BP'],
            ['name' => 'Bình Thuận', 'code' => 'BTH'],
            ['name' => 'Cà Mau', 'code' => 'CM'],
            ['name' => 'Cao Bằng', 'code' => 'CB'],
            ['name' => 'Đắk Lắk', 'code' => 'DL'],
            ['name' => 'Đắk Nông', 'code' => 'DN'],
            ['name' => 'Điện Biên', 'code' => 'DB'],
            ['name' => 'Đồng Nai', 'code' => 'DNA'],
            ['name' => 'Đồng Tháp', 'code' => 'DT'],
            ['name' => 'Gia Lai', 'code' => 'GL'],
            ['name' => 'Hà Giang', 'code' => 'HG'],
            ['name' => 'Hà Nam', 'code' => 'HNA'],
            ['name' => 'Hà Tĩnh', 'code' => 'HT'],
            ['name' => 'Hải Dương', 'code' => 'HD'],
            ['name' => 'Hậu Giang', 'code' => 'HGI'],
            ['name' => 'Hòa Bình', 'code' => 'HB'],
            ['name' => 'Hưng Yên', 'code' => 'HY'],
            ['name' => 'Khánh Hòa', 'code' => 'KH'],
            ['name' => 'Kiên Giang', 'code' => 'KG'],
            ['name' => 'Kon Tum', 'code' => 'KT'],
            ['name' => 'Lai Châu', 'code' => 'LC'],
            ['name' => 'Lâm Đồng', 'code' => 'LD'],
            ['name' => 'Lạng Sơn', 'code' => 'LS'],
            ['name' => 'Lào Cai', 'code' => 'LCA'],
            ['name' => 'Long An', 'code' => 'LA'],
            ['name' => 'Nam Định', 'code' => 'ND'],
            ['name' => 'Nghệ An', 'code' => 'NA'],
            ['name' => 'Ninh Bình', 'code' => 'NB'],
            ['name' => 'Ninh Thuận', 'code' => 'NT'],
            ['name' => 'Phú Thọ', 'code' => 'PT'],
            ['name' => 'Quảng Bình', 'code' => 'QB'],
            ['name' => 'Quảng Nam', 'code' => 'QN'],
            ['name' => 'Quảng Ngãi', 'code' => 'QNG'],
            ['name' => 'Quảng Ninh', 'code' => 'QNI'],
            ['name' => 'Quảng Trị', 'code' => 'QT'],
            ['name' => 'Sóc Trăng', 'code' => 'ST'],
            ['name' => 'Sơn La', 'code' => 'SL'],
            ['name' => 'Tây Ninh', 'code' => 'TN'],
            ['name' => 'Thái Bình', 'code' => 'TB'],
            ['name' => 'Thái Nguyên', 'code' => 'TNG'],
            ['name' => 'Thanh Hóa', 'code' => 'TH'],
            ['name' => 'Thừa Thiên Huế', 'code' => 'TTH'],
            ['name' => 'Tiền Giang', 'code' => 'TG'],
            ['name' => 'Trà Vinh', 'code' => 'TV'],
            ['name' => 'Tuyên Quang', 'code' => 'TQ'],
            ['name' => 'Vĩnh Long', 'code' => 'VL'],
            ['name' => 'Vĩnh Phúc', 'code' => 'VP'],
            ['name' => 'Yên Bái', 'code' => 'YB'],
            // 5 thành phố trực thuộc trung ương
            ['name' => 'Hà Nội', 'code' => 'HN'],
            ['name' => 'Thành phố Hồ Chí Minh', 'code' => 'HCM'],
            ['name' => 'Hải Phòng', 'code' => 'HP'],
            ['name' => 'Đà Nẵng', 'code' => 'DN'],
            ['name' => 'Cần Thơ', 'code' => 'CT'],
        ];
    }
    
    /**
     * 执行HTTP请求
     * @param string $url
     * @return array|false
     */
    private function makeRequest($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'User-Agent: ZaloMiniApp/1.0',
            'Accept: application/json',
        ]);
        
        // 开发环境可以禁用SSL验证，生产环境应该启用
        if (config('app_debug')) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($response === false || $httpCode !== 200) {
            \think\Log::error('Goong API Error: ' . $response . ' HTTP Code: ' . $httpCode);
            return false;
        }
        
        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            \think\Log::error('Goong API JSON Error: ' . json_last_error_msg());
            return false;
        }
        
        return $data;
    }
} 