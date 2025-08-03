<?php
/**
 * Goong API测试脚本
 * 用于验证后端API功能是否正常
 */

require_once __DIR__ . '/source/application/common/library/GoongApi/GoongApi.php';

use app\common\library\GoongApi\GoongApi;

// 测试配置
$testCases = [
    [
        'name' => '地址自动补全测试',
        'method' => 'autocomplete',
        'params' => ['胡志明市第一郡']
    ],
    [
        'name' => '地理编码测试',
        'method' => 'geocode',
        'params' => ['Hồ Chí Minh, Quận 1, Phường Bến Nghé']
    ],
    [
        'name' => '反向地理编码测试',
        'method' => 'reverseGeocode',
        'params' => [10.762622, 106.660172]
    ]
];

// 开始测试
echo "开始Goong API功能测试...\n\n";

$goongApi = new GoongApi();

foreach ($testCases as $index => $testCase) {
    echo "测试 " . ($index + 1) . ": " . $testCase['name'] . "\n";
    echo "参数: " . implode(', ', $testCase['params']) . "\n";
    
    try {
        $result = call_user_func_array([$goongApi, $testCase['method']], $testCase['params']);
        
        if ($result !== false) {
            echo "✅ 测试成功\n";
            echo "返回状态: " . ($result['status'] ?? 'Unknown') . "\n";
            
            // 显示部分结果
            if (isset($result['predictions'])) {
                echo "建议数量: " . count($result['predictions']) . "\n";
            } elseif (isset($result['results'])) {
                echo "结果数量: " . count($result['results']) . "\n";
            }
        } else {
            echo "❌ 测试失败: API返回false\n";
        }
    } catch (Exception $e) {
        echo "❌ 测试异常: " . $e->getMessage() . "\n";
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
}

echo "测试完成！\n";

// 测试地址解析功能
echo "测试地址解析功能...\n";

$testAddress = [
    'province' => 'Hồ Chí Minh',
    'district' => 'Quận 1',
    'ward' => 'Phường Bến Nghé',
    'street' => 'Đường Nguyễn Huệ',
    'house_number' => '123'
];

echo "测试地址: " . json_encode($testAddress, JSON_UNESCAPED_UNICODE) . "\n";

try {
    $formatted = $goongApi->formatVietnameseAddress($testAddress);
    echo "格式化结果: " . $formatted . "\n";
    echo "✅ 地址格式化成功\n";
} catch (Exception $e) {
    echo "❌ 地址格式化失败: " . $e->getMessage() . "\n";
}

echo "\n测试报告完成！\n";
?>