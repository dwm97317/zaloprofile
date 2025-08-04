<?php
$config = [
    'host' => '127.0.0.1',
    'database' => 'zalo_itaoth_com',
    'username' => 'zalo_itaoth_com',
    'password' => '2Kwi7STcaJ2R78Np',
    'port' => '3306',
    'charset' => 'utf8',
];

try {
    $pdo = new PDO("mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}", $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "数据库连接成功\n";
    
    // 查询用户ID为5490695128950901701的用户记录
    $stmt = $pdo->prepare('SELECT user_id, open_id, nickName, avatarUrl, avatar_id, last_login_time, create_time FROM yoshop_user WHERE open_id = ? OR user_id = ?');
    $stmt->execute(['5490695128950901701', '5490695128950901701']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "用户记录找到:\n";
        print_r($user);
    } else {
        echo "未找到用户ID为5490695128950901701的记录\n";
        
        // 查询最近的几个用户记录
        $stmt = $pdo->prepare('SELECT user_id, open_id, nickName, avatarUrl, avatar_id, last_login_time, create_time FROM yoshop_user ORDER BY create_time DESC LIMIT 5');
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\n最近的5个用户记录:\n";
        foreach ($users as $u) {
            print_r($u);
        }
    }
    
    // 查询oauth表中的记录
    $stmt = $pdo->prepare('SELECT * FROM yoshop_user_oauth WHERE oauth_id = ?');
    $stmt->execute(['5490695128950901701']);
    $oauth = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($oauth) {
        echo "\nOAuth记录找到:\n";
        print_r($oauth);
    } else {
        echo "\n未找到OAuth记录\n";
        
        // 查询最近的OAuth记录
        $stmt = $pdo->prepare('SELECT * FROM yoshop_user_oauth ORDER BY create_time DESC LIMIT 5');
        $stmt->execute();
        $oauths = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\n最近的5个OAuth记录:\n";
        foreach ($oauths as $o) {
            print_r($o);
        }
    }
    
} catch (PDOException $e) {
    echo "数据库连接错误: " . $e->getMessage() . "\n";
}
?>
