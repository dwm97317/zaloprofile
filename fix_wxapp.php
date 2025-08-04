<?php
// 修复 wxapp_id = 10001 记录的脚本

// 数据库配置
$config = [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'zhuanyun_sllowly',
    'username' => 'root',
    'password' => 'root',
    'charset' => 'utf8'
];

try {
    $pdo = new PDO("mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}", $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "数据库连接成功\n";
    
    // 检查是否存在 wxapp_id = 10001 的记录
    $stmt = $pdo->prepare('SELECT * FROM yoshop_wxapp WHERE wxapp_id = 10001');
    $stmt->execute();
    $app = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($app) {
        echo "找到 wxapp_id = 10001 的记录:\n";
        echo "name: {$app['name']}\n";
        echo "is_delete: {$app['is_delete']}\n";
        echo "is_recycle: {$app['is_recycle']}\n";
        
        // 如果记录被删除或回收，恢复它
        if ($app['is_delete'] == 1 || $app['is_recycle'] == 1) {
            echo "记录被标记为删除或回收，正在恢复...\n";
            $updateStmt = $pdo->prepare('UPDATE yoshop_wxapp SET is_delete = 0, is_recycle = 0 WHERE wxapp_id = 10001');
            $updateStmt->execute();
            echo "记录已恢复\n";
        } else {
            echo "记录状态正常\n";
        }
    } else {
        echo "未找到 wxapp_id = 10001 的记录，正在创建...\n";
        
        // 创建默认的 wxapp 记录
        $insertStmt = $pdo->prepare('
            INSERT INTO yoshop_wxapp (
                wxapp_id, name, app_id, app_secret, app_wxname, 
                is_delete, is_recycle, create_time, update_time,
                other_url, version
            ) VALUES (
                10001, "默认小程序", "", "", "默认小程序",
                0, 0, ?, ?,
                "http://localhost:3000", "1.0.0"
            )
        ');
        
        $currentTime = time();
        $insertStmt->execute([$currentTime, $currentTime]);
        echo "默认 wxapp 记录已创建\n";
    }
    
    // 验证记录
    $stmt = $pdo->prepare('SELECT wxapp_id, name, is_delete, is_recycle FROM yoshop_wxapp WHERE wxapp_id = 10001');
    $stmt->execute();
    $app = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($app && $app['is_delete'] == 0 && $app['is_recycle'] == 0) {
        echo "✅ wxapp_id = 10001 记录验证成功\n";
        echo "记录详情: name={$app['name']}, is_delete={$app['is_delete']}, is_recycle={$app['is_recycle']}\n";
    } else {
        echo "❌ wxapp_id = 10001 记录验证失败\n";
    }
    
} catch (PDOException $e) {
    echo "数据库错误: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>
