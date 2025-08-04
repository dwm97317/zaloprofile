<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>数据库迁移 - 地址字段长度修改</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>数据库迁移 - 地址字段长度修改</h1>
    <p>执行时间: <?php echo date('Y-m-d H:i:s'); ?></p>

<?php
/**
 * 数据库迁移脚本 - 修改地址字段长度
 * 执行时间: 2025-01-25
 */

// 数据库连接配置
$host = '127.0.0.1';  // 使用本地数据库
$port = '3306';
$database = 'zalo_itaoth_com';
$username = 'zalo_itaoth_com';
$password = '2Kwi7STcaJ2R78Np';

try {
    // 创建PDO连接
    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "<p class='success'>✅ 数据库连接成功</p>";
    
    // 检查当前 street 字段的结构
    echo "\n📋 检查当前表结构...\n";
    $stmt = $pdo->query("DESCRIBE yoshop_user_address");
    $columns = $stmt->fetchAll();
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'street') {
            echo "当前 street 字段: {$column['Type']}\n";
            break;
        }
    }
    
    // 修改 street 字段长度
    echo "\n🔧 修改 street 字段长度...\n";
    $sql = "ALTER TABLE `yoshop_user_address` 
            MODIFY COLUMN `street` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '街道地址'";
    
    $pdo->exec($sql);
    echo "✅ street 字段长度已修改为 varchar(255)\n";
    
    // 验证修改结果
    echo "\n✅ 验证修改结果...\n";
    $stmt = $pdo->query("DESCRIBE yoshop_user_address");
    $columns = $stmt->fetchAll();
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'street') {
            echo "修改后 street 字段: {$column['Type']}\n";
            break;
        }
    }
    
    // 检查是否有现有数据被截断
    echo "\n📊 检查现有数据...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM yoshop_user_address WHERE LENGTH(street) > 50");
    $result = $stmt->fetch();
    echo "长度超过50字符的地址记录数: {$result['total']}\n";
    
    echo "\n🎉 数据库迁移完成！\n";
    echo "现在可以支持最长255字符的越南地址了。\n";
    
} catch (PDOException $e) {
    echo "❌ 数据库错误: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ 执行错误: " . $e->getMessage() . "\n";
    exit(1);
}
?>
