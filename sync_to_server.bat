@echo off
echo 🚀 开始同步越南地址修复文件到服务器...
echo 服务器: 160.191.53.56:4433
echo 目标路径: /www/wwwroot/zalonew.itaoth.com
echo.

REM 需要先安装 WinSCP 或 pscp 工具
REM 这里使用 scp 命令（需要 OpenSSH 客户端）

echo 📤 同步后端PHP文件...

REM GoongAddress控制器
scp -P 4433 source/application/api/controller/GoongAddress.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/api/controller/
echo ✅ GoongAddress.php 已同步

REM GoongApi类库
scp -P 4433 -r source/application/common/library/GoongApi/ root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/common/library/
echo ✅ GoongApi类库 已同步

REM API路由配置
scp -P 4433 source/route/api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/route/
echo ✅ API路由配置 已同步

REM 测试脚本
scp -P 4433 test_goong_api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
echo ✅ API测试脚本 已同步

echo.
echo 📤 同步前端React文件...

REM 创建目录并同步GoongAddressPicker组件
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker"
scp -P 4433 zalo_mini_app-master/src/components/GoongAddressPicker/* root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/
echo ✅ GoongAddressPicker组件 已同步

REM AddressApi工具类
scp -P 4433 zalo_mini_app-master/src/utils/addressApi.js root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils/
echo ✅ AddressApi工具类 已同步

REM 修复后的Create.jsx
scp -P 4433 zalo_mini_app-master/src/pages/Address/Create.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address/
echo ✅ 地址创建页面 已同步

echo.
echo 📤 同步文档文件...

scp -P 4433 GOONG_ADDRESS_FIX_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
scp -P 4433 VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
echo ✅ 文档文件 已同步

echo.
echo 🔧 设置文件权限...

ssh -p 4433 root@160.191.53.56 "cd /www/wwwroot/zalonew.itaoth.com && chown -R www:www source/ && chmod -R 755 source/ && chown -R www:www zalo_mini_app-master/ && chmod -R 755 zalo_mini_app-master/ && chown www:www *.md && chmod 644 *.md && chown www:www test_goong_api.php && chmod 755 test_goong_api.php"

echo ✅ 文件权限设置完成

echo.
echo 🎉 文件同步完成！
echo.
echo 📋 同步清单：
echo   ✅ GoongAddress控制器
echo   ✅ GoongApi类库
echo   ✅ API路由配置
echo   ✅ GoongAddressPicker组件
echo   ✅ AddressApi工具类
echo   ✅ 地址创建页面
echo   ✅ 文档和测试文件
echo.
echo 🔧 后续步骤：
echo 1. 测试API功能: ssh -p 4433 root@160.191.53.56 "php /www/wwwroot/zalonew.itaoth.com/test_goong_api.php"
echo 2. 重建前端: ssh -p 4433 root@160.191.53.56 "cd /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master && npm run build"
echo 3. 重启web服务器
echo.
pause