<?php
/**
 * Zalo按钮类型验证脚本
 * 用于测试不同的按钮配置方案
 */

echo "=== Zalo按钮类型验证脚本 ===\n\n";

// 测试用户ID
$testUserId = '8890635404729405962';

echo "🔍 分析不同的按钮配置方案:\n";
echo "================================\n\n";

// 方案1: 原始配置（有问题的）
echo "❌ 方案1 - 原始配置（问题配置）:\n";
echo "-----------------------------------\n";
$originalConfig = [
    "type" => "oa.open.url",
    "title" => "Mở applet",
    "payload" => ['url' => "https://zalo.me/s/757872350750612320/mine?from=oa&oa_user_id=".$testUserId]
];

echo "按钮类型: " . $originalConfig['type'] . "\n";
echo "问题: 缺少必需的utm_source参数，导致跳转失败\n";
echo "Payload: " . json_encode($originalConfig['payload'], JSON_PRETTY_PRINT) . "\n\n";

// 方案2: 正确的修复（当前实施）
echo "✅ 方案2 - 正确的修复（当前实施）:\n";
echo "-----------------------------------\n";
$correctFix = [
    "type" => "oa.open.url",
    "title" => "Mở applet",
    "payload" => ['url' => "https://zalo.me/s/757872350750612320/mine?utm_source=zalo-oa&from=oa&oa_user_id=".$testUserId]
];

echo "按钮类型: " . $correctFix['type'] . "\n";
echo "修复: 添加了utm_source=zalo-oa参数\n";
echo "优点: 符合官方文档要求，应该能正确在Zalo应用内打开小程序\n";
echo "Payload: " . json_encode($correctFix['payload'], JSON_PRETTY_PRINT) . "\n\n";

// 方案3: 错误的尝试（已废弃）
echo "❌ 方案3 - 错误的尝试（已废弃）:\n";
echo "-----------------------------------\n";
$wrongAttempt = [
    "type" => "oa.open.miniapp",
    "title" => "Mở applet",
    "payload" => ['url' => "https://zalo.me/s/757872350750612320/mine?from=oa&oa_user_id=".$testUserId]
];

echo "按钮类型: " . $wrongAttempt['type'] . "\n";
echo "问题: oa.open.miniapp不是有效的按钮类型\n";
echo "错误: Button action type is invalid\n";
echo "Payload: " . json_encode($wrongAttempt['payload'], JSON_PRETTY_PRINT) . "\n\n";

// 生成完整的消息结构用于测试
echo "📋 完整消息结构示例（正确修复）:\n";
echo "================================\n";

$completeMessage = [
    'attachment' => [
        'type' => 'template',
        'payload' => [
            'template_type' => 'transaction_event',
            'language' => 'VI',
            'elements' => [
                [
                    "type" => "header",
                    "content" => "Chào mừng bạn đến với chương trình nhỏ của chúng tôi",
                    "align" => "left"
                ],
                [
                    "type" => "text",
                    "align" => "left",
                    "content" => "Chào mừng bạn đến với chương trình nhỏ của chúng tôi",
                ]
            ],
            'buttons' => [$correctFix]
        ]
    ]
];

echo json_encode($completeMessage, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// 测试建议
echo "🧪 测试建议:\n";
echo "=============\n";
echo "1. 测试修复后的深层链接\n";
echo "2. 发送测试消息给测试用户\n";
echo "3. 点击按钮验证是否在Zalo应用内打开小程序\n";
echo "4. 检查API响应是否还有错误\n\n";

echo "📝 验证要点:\n";
echo "=============\n";
echo "✓ API调用不再返回'Button action type is invalid'错误\n";
echo "✓ 点击按钮后直接在Zalo应用内打开小程序\n";
echo "✓ 正确跳转到mine页面\n";
echo "✓ 参数正确传递（utm_source=zalo-oa, from=oa, oa_user_id）\n\n";

echo "🔍 关键修复点:\n";
echo "===============\n";
echo "✓ 保持oa.open.url按钮类型（这是正确的）\n";
echo "✓ 添加utm_source=zalo-oa参数到深层链接\n";
echo "✓ 深层链接格式: https://zalo.me/s/{miniAppId}/{path}?utm_source=zalo-oa&...\n\n";

echo "=== 验证完成 ===\n";
