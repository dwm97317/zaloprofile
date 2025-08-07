<?php
/**
 * 切换到完整结构化修复的脚本
 * 如果最小化修复不工作，可以使用此脚本切换到完整的结构化修复
 */

echo "=== 切换到完整结构化修复 ===\n\n";

$filePath = 'source/application/common/library/ZaloSdk/ZaloOfficialApi.php';

if (!file_exists($filePath)) {
    echo "❌ 错误: 找不到文件 {$filePath}\n";
    exit(1);
}

// 读取文件内容
$content = file_get_contents($filePath);

// 查找并替换关注消息的按钮配置
$oldPattern = '/("type"=>\s*"oa\.open\.miniapp",\s*"title"=>\s*"Mở applet",\s*"payload"=>\s*\[\'url\'=>"https:\/\/zalo\.me\/s\/757872350750612320\/mine\?from=oa&oa_user_id="\.\$userId\])/';

$newReplacement = '"type"=> "oa.open.miniapp",
                            "title"=> "Mở applet",
                            "payload"=> [
                                \'app_id\' => \'757872350750612320\',
                                \'path\' => \'mine\',
                                \'params\' => [
                                    \'from\' => \'oa\',
                                    \'oa_user_id\' => $userId
                                ]
                            ]';

if (preg_match($oldPattern, $content)) {
    $newContent = preg_replace($oldPattern, $newReplacement, $content);
    
    // 备份原文件
    $backupFile = $filePath . '.backup.' . date('Y-m-d_H-i-s');
    copy($filePath, $backupFile);
    echo "✅ 已创建备份文件: {$backupFile}\n";
    
    // 写入新内容
    if (file_put_contents($filePath, $newContent)) {
        echo "✅ 成功切换到完整结构化修复\n\n";
        
        echo "📋 新的按钮配置:\n";
        echo "================\n";
        echo "按钮类型: oa.open.miniapp\n";
        echo "Payload结构:\n";
        echo "  - app_id: 757872350750612320\n";
        echo "  - path: mine\n";
        echo "  - params: {from: 'oa', oa_user_id: \$userId}\n\n";
        
        echo "🧪 请测试验证:\n";
        echo "==============\n";
        echo "1. 触发关注消息发送\n";
        echo "2. 点击消息中的'Mở applet'按钮\n";
        echo "3. 验证是否在Zalo应用内打开小程序\n";
        echo "4. 检查是否正确跳转到mine页面\n\n";
        
    } else {
        echo "❌ 错误: 无法写入文件\n";
        exit(1);
    }
} else {
    echo "⚠️  警告: 未找到匹配的按钮配置模式\n";
    echo "可能的原因:\n";
    echo "1. 文件已经是结构化修复版本\n";
    echo "2. 按钮配置格式已发生变化\n";
    echo "3. 需要手动检查文件内容\n\n";
    
    echo "📝 请手动检查文件中的按钮配置:\n";
    echo "文件位置: {$filePath}\n";
    echo "查找: sendfollowerMessage 方法中的 buttons 配置\n";
}

echo "\n=== 操作完成 ===\n";
