# 🚀 服务器同步命令

## 方法一：使用同步脚本（推荐）

### 1. 设置脚本权限
```bash
chmod +x sync_to_server.sh
```

### 2. 执行同步（需要输入服务器密码）
```bash
./sync_to_server.sh
```

## 方法二：手动同步命令

### 1. 同步后端PHP文件

```bash
# GoongAddress控制器
scp source/application/api/controller/GoongAddress.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/api/controller/

# GoongApi类库（整个目录）
scp -r source/application/common/library/GoongApi/ root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/common/library/

# API路由配置
scp source/route/api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/route/

# 测试脚本
scp test_goong_api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
```

### 2. 同步前端React文件

```bash
# 创建目录并同步GoongAddressPicker组件
ssh root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker"
scp zalo_mini_app-master/src/components/GoongAddressPicker/* root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/

# AddressApi工具类
scp zalo_mini_app-master/src/utils/addressApi.js root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils/

# 修复后的Create.jsx
scp zalo_mini_app-master/src/pages/Address/Create.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address/
```

### 3. 同步文档文件

```bash
# 使用指南
scp GOONG_ADDRESS_FIX_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
scp VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
```

### 4. 设置文件权限

```bash
ssh root@160.191.53.56 << 'EOF'
cd /www/wwwroot/zalonew.itaoth.com

# 设置PHP文件权限
chown -R www:www source/
chmod -R 755 source/

# 设置前端文件权限  
chown -R www:www zalo_mini_app-master/
chmod -R 755 zalo_mini_app-master/

# 设置文档权限
chown www:www *.md
chmod 644 *.md

# 设置测试脚本权限
chown www:www test_goong_api.php
chmod 755 test_goong_api.php

echo "✅ 文件权限设置完成"
EOF
```

## 同步完成后的验证

### 1. 测试后端API
```bash
ssh root@160.191.53.56
cd /www/wwwroot/zalonew.itaoth.com
php test_goong_api.php
```

### 2. 重建前端（如果需要）
```bash
ssh root@160.191.53.56
cd /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master
npm install  # 如果有新依赖
npm run build
```

### 3. 重启服务
```bash
# 根据服务器环境选择
systemctl restart nginx    # 如果使用Nginx
systemctl restart apache2  # 如果使用Apache
systemctl restart php-fpm  # 如果使用PHP-FPM
```

## 故障排除

### 权限问题
如果遇到权限问题：
```bash
ssh root@160.191.53.56
chmod -R 755 /www/wwwroot/zalonew.itaoth.com/source/runtime/
chown -R www:www /www/wwwroot/zalonew.itaoth.com/source/runtime/
```

### API测试失败
1. 检查Goong API密钥是否有效
2. 验证网络连接
3. 检查PHP错误日志

### 前端组件不显示
1. 确认文件路径正确
2. 检查浏览器控制台错误
3. 验证组件导入路径

---

**注意**: 执行同步命令时需要输入服务器密码 `dwm97310`