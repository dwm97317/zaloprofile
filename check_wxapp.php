<?php
$config = [
    'host' => '160.191.53.56',
    'database' => 'zalo_itaoth_com',
    'username' => 'zalo_itaoth_com',
    'password' => '2Kwi7STcaJ2R78Np',
    'port' => '3389',
    'charset' => 'utf8',
];

try {
    $pdo = new PDO("mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}", $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "数据库连接成功\n";
    
    // 查询yoshop_wxapp表的内容
    $stmt = $pdo->prepare('SELECT * FROM yoshop_wxapp LIMIT 10');
    $stmt->execute();
    $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "yoshop_wxapp表内容:\n";
    foreach ($apps as $app) {
        echo "wxapp_id: {$app['wxapp_id']}, name: {$app['name']}, app_id: {$app['app_id']}\n";
        echo "is_delete: {$app['is_delete']}, create_time: {$app['create_time']}\n";
        echo "---\n";
    }
    
    // 查询管理员表
    $stmt = $pdo->prepare('SELECT * FROM yoshop_store_user LIMIT 5');
    $stmt->execute();
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n管理员账户信息:\n";
    foreach ($admins as $admin) {
        echo "user_id: {$admin['user_id']}, user_name: {$admin['user_name']}, wxapp_id: {$admin['wxapp_id']}\n";
    }
    
} catch (PDOException $e) {
    echo "数据库连接错误: " . $e->getMessage() . "\n";
}
?>
