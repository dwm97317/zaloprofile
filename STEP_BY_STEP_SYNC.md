# 🔧 逐步同步指南

## 问题说明
文件存在但同步失败的原因：
1. 新创建的文件，服务器上目录不存在
2. Windows路径分隔符问题
3. 通配符在某些情况下不工作

## ✅ 解决方案：分步执行

### 第一步：创建目录结构

```powershell
# 连接到服务器并创建目录
ssh -p 4433 root@160.191.53.56

# 在服务器上执行以下命令：
mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker
mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils
mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address
mkdir -p /www/wwwroot/zalonew.itaoth.com/source/application/common/library

# 退出SSH连接
exit
```

### 第二步：同步后端文件

```powershell
# 在本地zaloprofile目录下执行：

# 1. GoongAddress控制器
scp -P 4433 source/application/api/controller/GoongAddress.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/api/controller/

# 2. GoongApi类库
scp -P 4433 -r source/application/common/library/GoongApi root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/common/library/

# 3. API路由
scp -P 4433 source/route/api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/route/

# 4. 测试脚本
scp -P 4433 test_goong_api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
```

### 第三步：同步前端文件

```powershell
# GoongAddressPicker组件（逐个文件）
scp -P 4433 zalo_mini_app-master/src/components/GoongAddressPicker/index.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/

scp -P 4433 zalo_mini_app-master/src/components/GoongAddressPicker/style.scss root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/

# AddressApi工具类
scp -P 4433 zalo_mini_app-master/src/utils/addressApi.js root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils/

# 修复后的Create.jsx
scp -P 4433 zalo_mini_app-master/src/pages/Address/Create.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address/
```

### 第四步：同步文档文件

```powershell
scp -P 4433 GOONG_ADDRESS_FIX_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/

scp -P 4433 VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
```

### 第五步：设置权限（重要！）

```powershell
ssh -p 4433 root@160.191.53.56

# 在服务器上执行：
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
chmod -R 775 source/runtime/

echo "权限设置完成"
exit
```

### 第六步：验证同步结果

```powershell
# 检查文件是否正确上传
ssh -p 4433 root@160.191.53.56

# 检查关键文件
ls -la /www/wwwroot/zalonew.itaoth.com/source/application/api/controller/GoongAddress.php
ls -la /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/
ls -la /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils/addressApi.js

# 测试API功能
php /www/wwwroot/zalonew.itaoth.com/test_goong_api.php

exit
```

## 🎯 一键执行脚本

如果您想要一键执行，请使用新的修复版本：

```powershell
# 使用修复版本的批处理脚本
sync_to_server_fixed.bat
```

这个版本会：
1. 自动创建所需目录
2. 逐个同步文件
3. 提供详细的成功/失败反馈
4. 自动设置正确的权限

## 🔍 故障排除

### 如果仍然出现"No such file or directory"：

1. **检查本地文件是否存在**：
```powershell
dir zalo_mini_app-master\src\components\GoongAddressPicker\
dir zalo_mini_app-master\src\utils\addressApi.js
```

2. **使用绝对路径**：
```powershell
scp -P 4433 D:\2025profile\zaloprofile\zalo_mini_app-master\src\components\GoongAddressPicker\index.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/
```

3. **检查当前工作目录**：
```powershell
pwd
cd D:\2025profile\zaloprofile
```

## 📞 完成后的验证清单

- [ ] GoongAddress.php 文件存在
- [ ] GoongApi 目录和文件存在
- [ ] GoongAddressPicker 组件文件存在
- [ ] addressApi.js 文件存在
- [ ] Create.jsx 文件已更新
- [ ] 文件权限设置正确（www:www）
- [ ] API测试脚本运行成功
- [ ] 前端页面可以正常访问

完成这些步骤后，越南地址功能应该完全正常工作！