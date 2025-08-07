<?php
/**
 * Zalo小程序ID更新总结脚本
 * 验证所有文件中的小程序ID是否已正确更新
 */

echo "=== Zalo小程序ID更新验证 ===\n\n";

$oldId = '3310500707791294854';
$newId = '757872350750612320';

echo "旧小程序ID: {$oldId}\n";
echo "新小程序ID: {$newId}\n\n";

// 需要检查的文件列表
$filesToCheck = [
    'source/application/common/library/ZaloSdk/Zalo.php',
    'source/application/common/library/ZaloSdk/ZaloOfficialApi.php',
    'source/application/api/controller/Zaloapi.php',
    'ZALO_DEEP_LINK_FIX_GUIDE.md',
    'FINAL_ZALO_DEEP_LINK_FIX_SUMMARY.md',
    'test_zalo_deep_link_fix.php',
    'validate_zalo_button_types.php',
    'switch_to_structured_fix.php',
    'CODE_ANALYSIS_REPORT.md'
];

echo "📋 检查文件更新状态:\n";
echo "========================\n";

$totalFiles = 0;
$updatedFiles = 0;
$filesWithOldId = [];

foreach ($filesToCheck as $file) {
    $totalFiles++;
    
    if (!file_exists($file)) {
        echo "⚠️  {$file} - 文件不存在\n";
        continue;
    }
    
    $content = file_get_contents($file);
    $hasOldId = strpos($content, $oldId) !== false;
    $hasNewId = strpos($content, $newId) !== false;
    
    if ($hasOldId) {
        echo "❌ {$file} - 仍包含旧ID\n";
        $filesWithOldId[] = $file;
    } elseif ($hasNewId) {
        echo "✅ {$file} - 已更新为新ID\n";
        $updatedFiles++;
    } else {
        echo "ℹ️  {$file} - 不包含小程序ID\n";
        $updatedFiles++; // 不包含ID的文件也算作正常
    }
}

echo "\n";

// 统计结果
echo "📊 更新统计:\n";
echo "=============\n";
echo "总文件数: {$totalFiles}\n";
echo "已更新文件: {$updatedFiles}\n";
echo "未更新文件: " . count($filesWithOldId) . "\n";

if (empty($filesWithOldId)) {
    echo "\n🎉 所有文件已成功更新！\n";
} else {
    echo "\n⚠️  以下文件仍需要手动检查:\n";
    foreach ($filesWithOldId as $file) {
        echo "   - {$file}\n";
    }
}

echo "\n";

// 验证关键配置
echo "🔍 验证关键配置:\n";
echo "==================\n";

// 检查Zalo.php配置
$zaloConfigFile = 'source/application/common/library/ZaloSdk/Zalo.php';
if (file_exists($zaloConfigFile)) {
    $content = file_get_contents($zaloConfigFile);
    if (preg_match("/\'appid\'\s*=>\s*\'(\d+)\'/", $content, $matches)) {
        $configId = $matches[1];
        if ($configId === $newId) {
            echo "✅ Zalo.php - 小程序ID配置正确: {$configId}\n";
        } else {
            echo "❌ Zalo.php - 小程序ID配置错误: {$configId}\n";
        }
    } else {
        echo "⚠️  Zalo.php - 未找到appid配置\n";
    }
}

// 检查深层链接URL
$apiFile = 'source/application/common/library/ZaloSdk/ZaloOfficialApi.php';
if (file_exists($apiFile)) {
    $content = file_get_contents($apiFile);
    $linkCount = preg_match_all("/https:\/\/zalo\.me\/s\/(\d+)\//", $content, $matches);
    
    if ($linkCount > 0) {
        $allCorrect = true;
        $uniqueIds = array_unique($matches[1]);
        
        foreach ($uniqueIds as $foundId) {
            if ($foundId !== $newId) {
                $allCorrect = false;
                echo "❌ ZaloOfficialApi.php - 发现错误的深层链接ID: {$foundId}\n";
            }
        }
        
        if ($allCorrect) {
            echo "✅ ZaloOfficialApi.php - 所有深层链接ID正确 (共{$linkCount}个)\n";
        }
    } else {
        echo "⚠️  ZaloOfficialApi.php - 未找到深层链接\n";
    }
}

echo "\n";

// 提供测试建议
echo "🧪 测试建议:\n";
echo "=============\n";
echo "1. 运行验证脚本: php validate_zalo_button_types.php\n";
echo "2. 测试关注消息发送功能\n";
echo "3. 验证深层链接是否正确跳转到新的小程序\n";
echo "4. 检查所有消息类型的按钮功能\n";

echo "\n=== 更新验证完成 ===\n";
