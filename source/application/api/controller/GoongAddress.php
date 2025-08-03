<?php
namespace app\api\controller;

use app\common\library\GoongApi\GoongApi;

/**
 * Goong地址API控制器
 * 提供越南地址相关功能
 */
class GoongAddress extends \app\api\controller\Controller
{
    private $goongApi;
    
    public function __construct()
    {
        parent::__construct();
        $this->goongApi = new GoongApi();
    }
    
    /**
     * 地址自动补全
     * @return array
     */
    public function autocomplete()
    {
        $input = $this->request->param('input', '');
        $limit = $this->request->param('limit', 10);
        $lat = $this->request->param('lat');
        $lng = $this->request->param('lng');
        
        if (empty($input)) {
            return $this->renderError('请输入搜索关键词');
        }
        
        $options = [
            'limit' => min($limit, 20), // 限制最大20个结果
        ];
        
        // 如果提供了用户位置，添加位置偏好
        if ($lat && $lng) {
            $options['location'] = $lat . ',' . $lng;
            $options['radius'] = 50000; // 50km 半径
        }
        
        $result = $this->goongApi->autocomplete($input, $options);
        
        if ($result === false) {
            return $this->renderError('地址搜索失败，请重试');
        }
        
        // 格式化返回结果
        $suggestions = [];
        if (isset($result['predictions'])) {
            foreach ($result['predictions'] as $prediction) {
                $suggestions[] = [
                    'place_id' => $prediction['place_id'],
                    'description' => $prediction['description'],
                    'structured_formatting' => $prediction['structured_formatting'] ?? null,
                    'types' => $prediction['types'] ?? [],
                ];
            }
        }
        
        return $this->renderSuccess([
            'suggestions' => $suggestions,
            'status' => $result['status'] ?? 'OK',
        ]);
    }
    
    /**
     * 获取地点详情
     * @return array
     */
    public function placeDetail()
    {
        $placeId = $this->request->param('place_id', '');
        
        if (empty($placeId)) {
            return $this->renderError('请提供地点ID');
        }
        
        $result = $this->goongApi->placeDetail($placeId);
        
        if ($result === false) {
            return $this->renderError('获取地点详情失败');
        }
        
        // 解析为越南地址格式
        $vietnameseAddress = $this->goongApi->parseVietnameseAddress($result);
        
        $placeInfo = [];
        if (isset($result['result'])) {
            $place = $result['result'];
            $placeInfo = [
                'place_id' => $place['place_id'],
                'name' => $place['name'] ?? '',
                'formatted_address' => $place['formatted_address'] ?? '',
                'geometry' => $place['geometry'] ?? null,
                'vietnamese_address' => $vietnameseAddress,
                'address_components' => $place['address_components'] ?? [],
            ];
        }
        
        return $this->renderSuccess([
            'place' => $placeInfo,
            'status' => $result['status'] ?? 'OK',
        ]);
    }
    
    /**
     * 反向地理编码 - 根据坐标获取地址
     * @return array
     */
    public function reverseGeocode()
    {
        $lat = $this->request->param('lat');
        $lng = $this->request->param('lng');
        
        if (!$lat || !$lng) {
            return $this->renderError('请提供有效的经纬度坐标');
        }
        
        $result = $this->goongApi->reverseGeocode($lat, $lng);
        
        if ($result === false) {
            return $this->renderError('反向地理编码失败');
        }
        
        // 解析为越南地址格式
        $vietnameseAddress = $this->goongApi->parseVietnameseAddress($result);
        
        $addressInfo = [];
        if (isset($result['results']) && !empty($result['results'])) {
            $address = $result['results'][0];
            $addressInfo = [
                'formatted_address' => $address['formatted_address'] ?? '',
                'vietnamese_address' => $vietnameseAddress,
                'address_components' => $address['address_components'] ?? [],
                'geometry' => $address['geometry'] ?? null,
            ];
        }
        
        return $this->renderSuccess([
            'address' => $addressInfo,
            'status' => $result['status'] ?? 'OK',
        ]);
    }
    
    /**
     * 地理编码 - 根据地址获取坐标
     * @return array
     */
    public function geocode()
    {
        $address = $this->request->param('address', '');
        
        if (empty($address)) {
            return $this->renderError('请输入地址');
        }
        
        $result = $this->goongApi->geocode($address);
        
        if ($result === false) {
            return $this->renderError('地理编码失败');
        }
        
        $locationInfo = [];
        if (isset($result['results']) && !empty($result['results'])) {
            $location = $result['results'][0];
            $locationInfo = [
                'formatted_address' => $location['formatted_address'] ?? '',
                'geometry' => $location['geometry'] ?? null,
                'place_id' => $location['place_id'] ?? '',
            ];
        }
        
        return $this->renderSuccess([
            'location' => $locationInfo,
            'status' => $result['status'] ?? 'OK',
        ]);
    }
    
    /**
     * 获取越南省份列表
     * @return array
     */
    public function getProvinces()
    {
        $provinces = $this->goongApi->getVietnameseProvinces();
        
        return $this->renderSuccess([
            'provinces' => $provinces,
            'total' => count($provinces),
        ]);
    }
    
    /**
     * 验证并格式化越南地址
     * @return array
     */
    public function validateAddress()
    {
        $addressData = $this->request->param();
        
        $required = ['province', 'district', 'ward'];
        $missing = [];
        
        foreach ($required as $field) {
            if (empty($addressData[$field])) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            return $this->renderError('缺少必填字段: ' . implode(', ', $missing));
        }
        
        // 格式化地址
        $formattedAddress = $this->formatVietnameseAddress($addressData);
        
        return $this->renderSuccess([
            'formatted_address' => $formattedAddress,
            'is_valid' => true,
        ]);
    }
    
    /**
     * 格式化越南地址
     * @param array $addressData
     * @return string
     */
    private function formatVietnameseAddress($addressData)
    {
        $parts = [];
        
        // 按照越南地址格式排列: 门牌号 + 街道 + 坊/xã + 区/huyện + 省/thành phố
        if (!empty($addressData['house_number'])) {
            $parts[] = $addressData['house_number'];
        }
        
        if (!empty($addressData['street'])) {
            $parts[] = $addressData['street'];
        }
        
        if (!empty($addressData['ward'])) {
            $parts[] = $addressData['ward'];
        }
        
        if (!empty($addressData['district'])) {
            $parts[] = $addressData['district'];
        }
        
        if (!empty($addressData['province'])) {
            $parts[] = $addressData['province'];
        }
        
        return implode(', ', $parts);
    }
} 