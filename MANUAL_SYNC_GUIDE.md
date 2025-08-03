# 📋 手动同步文件到服务器指南

## 🎯 服务器信息
- **IP地址**: 160.191.53.56
- **端口**: 4433
- **用户**: root
- **密码**: dwm97310
- **目标目录**: /www/wwwroot/zalonew.itaoth.com
- **文件所有者**: www

## 🚀 推荐方法：使用WinSCP（图形界面）

### 1. 下载安装WinSCP
- 下载地址：https://winscp.net/eng/download.php
- 安装并运行WinSCP

### 2. 连接服务器
```
主机名: 160.191.53.56
用户名: root
密码: dwm97310
端口: 4433
协议: SFTP
```

### 3. 同步文件列表

#### 后端PHP文件
```
本地文件 → 服务器路径

source/application/api/controller/GoongAddress.php
→ /www/wwwroot/zalonew.itaoth.com/source/application/api/controller/GoongAddress.php

source/application/common/library/GoongApi/ (整个目录)
→ /www/wwwroot/zalonew.itaoth.com/source/application/common/library/GoongApi/

source/route/api.php
→ /www/wwwroot/zalonew.itaoth.com/source/route/api.php

test_goong_api.php
→ /www/wwwroot/zalonew.itaoth.com/test_goong_api.php
```

#### 前端React文件
```
zalo_mini_app-master/src/components/GoongAddressPicker/ (整个目录)
→ /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/

zalo_mini_app-master/src/utils/addressApi.js
→ /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils/addressApi.js

zalo_mini_app-master/src/pages/Address/Create.jsx
→ /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address/Create.jsx
```

#### 文档文件
```
GOONG_ADDRESS_FIX_GUIDE.md
→ /www/wwwroot/zalonew.itaoth.com/GOONG_ADDRESS_FIX_GUIDE.md

VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md
→ /www/wwwroot/zalonew.itaoth.com/VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md
```

## 🖥️ 方法二：使用命令行（如果有ssh客户端）

### Windows PowerShell 命令

如果您已安装OpenSSH客户端：

```powershell
# 设置变量
$server = "root@160.191.53.56"
$basePath = "/www/wwwroot/zalonew.itaoth.com"

# 同步后端文件
scp -P 4433 "source/application/api/controller/GoongAddress.php" "${server}:${basePath}/source/application/api/controller/"
scp -P 4433 -r "source/application/common/library/GoongApi" "${server}:${basePath}/source/application/common/library/"
scp -P 4433 "source/route/api.php" "${server}:${basePath}/source/route/"
scp -P 4433 "test_goong_api.php" "${server}:${basePath}/"

# 创建前端目录
ssh -p 4433 $server "mkdir -p ${basePath}/zalo_mini_app-master/src/components/GoongAddressPicker"

# 同步前端文件
scp -P 4433 -r "zalo_mini_app-master/src/components/GoongAddressPicker/*" "${server}:${basePath}/zalo_mini_app-master/src/components/GoongAddressPicker/"
scp -P 4433 "zalo_mini_app-master/src/utils/addressApi.js" "${server}:${basePath}/zalo_mini_app-master/src/utils/"
scp -P 4433 "zalo_mini_app-master/src/pages/Address/Create.jsx" "${server}:${basePath}/zalo_mini_app-master/src/pages/Address/"

# 同步文档
scp -P 4433 "GOONG_ADDRESS_FIX_GUIDE.md" "${server}:${basePath}/"
scp -P 4433 "VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md" "${server}:${basePath}/"
```

## 🔧 同步后必须执行的权限设置

使用SSH连接到服务器执行以下命令：

```bash
ssh -p 4433 root@160.191.53.56

# 连接成功后执行：
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

# 确保运行时目录权限正确
chmod -R 775 source/runtime/cache/
chmod -R 775 source/runtime/temp/
chmod -R 775 source/runtime/log/

echo "✅ 权限设置完成"
```

## ✅ 同步完成后的验证

### 1. 测试后端API功能
```bash
ssh -p 4433 root@160.191.53.56
cd /www/wwwroot/zalonew.itaoth.com
php test_goong_api.php
```

期望看到类似输出：
```
开始Goong API功能测试...

测试 1: 地址自动补全测试
参数: 胡志明市第一郡
✅ 测试成功
返回状态: OK
建议数量: 5
```

### 2. 验证文件是否正确上传
```bash
ssh -p 4433 root@160.191.53.56

# 检查关键文件是否存在
ls -la /www/wwwroot/zalonew.itaoth.com/source/application/api/controller/GoongAddress.php
ls -la /www/wwwroot/zalonew.itaoth.com/source/application/common/library/GoongApi/GoongApi.php
ls -la /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/index.jsx
```

### 3. 重启相关服务
```bash
# 重启PHP-FPM（如果使用）
systemctl restart php-fpm

# 重启Web服务器
systemctl restart nginx
# 或
systemctl restart apache2

# 重启后检查服务状态
systemctl status nginx
systemctl status php-fpm
```

## 🔍 故障排除

### 权限问题
如果遇到权限拒绝错误：
```bash
# 确保runtime目录权限
chmod -R 775 /www/wwwroot/zalonew.itaoth.com/source/runtime/
chown -R www:www /www/wwwroot/zalonew.itaoth.com/source/runtime/
```

### API测试失败
1. 检查PHP错误日志：
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/php-fpm/www-error.log
```

2. 验证Goong API密钥
3. 检查网络连接

### 前端构建（如果需要）
```bash
ssh -p 4433 root@160.191.53.56
cd /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master
npm install
npm run build
```

## 📞 技术支持清单

同步完成后，以下功能应该正常工作：
- ✅ 地址搜索自动补全
- ✅ 地图选点功能
- ✅ 当前位置获取
- ✅ 地址验证和保存
- ✅ 前后端数据格式匹配

如有问题，请检查服务器错误日志和浏览器控制台。