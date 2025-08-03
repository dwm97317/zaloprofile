@echo off
echo 🚀 开始同步越南地址修复文件到服务器...
echo 服务器: 160.191.53.56:4433
echo 目标路径: /www/wwwroot/zalonew.itaoth.com
echo.

echo 📤 第一步：创建必要的目录结构...

REM 创建所有必要的目录
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/source/application/api/controller"
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/source/application/common/library"
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/source/route"
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker"
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils"
ssh -p 4433 root@160.191.53.56 "mkdir -p /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address"

echo ✅ 目录结构创建完成
echo.

echo 📤 第二步：同步后端PHP文件...

REM GoongAddress控制器
scp -P 4433 source\application\api\controller\GoongAddress.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/api/controller/
if %errorlevel% equ 0 (
    echo ✅ GoongAddress.php 已同步
) else (
    echo ❌ GoongAddress.php 同步失败
)

REM GoongApi类库（整个目录）
scp -P 4433 -r source\application\common\library\GoongApi root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/application/common/library/
if %errorlevel% equ 0 (
    echo ✅ GoongApi类库 已同步
) else (
    echo ❌ GoongApi类库 同步失败
)

REM API路由配置
scp -P 4433 source\route\api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/source/route/
if %errorlevel% equ 0 (
    echo ✅ API路由配置 已同步
) else (
    echo ❌ API路由配置 同步失败
)

REM 测试脚本
scp -P 4433 test_goong_api.php root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
if %errorlevel% equ 0 (
    echo ✅ API测试脚本 已同步
) else (
    echo ❌ API测试脚本 同步失败
)

echo.
echo 📤 第三步：同步前端React文件...

REM GoongAddressPicker组件文件
scp -P 4433 zalo_mini_app-master\src\components\GoongAddressPicker\index.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/
if %errorlevel% equ 0 (
    echo ✅ GoongAddressPicker/index.jsx 已同步
) else (
    echo ❌ GoongAddressPicker/index.jsx 同步失败
)

scp -P 4433 zalo_mini_app-master\src\components\GoongAddressPicker\style.scss root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/
if %errorlevel% equ 0 (
    echo ✅ GoongAddressPicker/style.scss 已同步
) else (
    echo ❌ GoongAddressPicker/style.scss 同步失败
)

REM AddressApi工具类
scp -P 4433 zalo_mini_app-master\src\utils\addressApi.js root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/utils/
if %errorlevel% equ 0 (
    echo ✅ AddressApi工具类 已同步
) else (
    echo ❌ AddressApi工具类 同步失败
)

REM 修复后的Create.jsx
scp -P 4433 zalo_mini_app-master\src\pages\Address\Create.jsx root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/pages/Address/
if %errorlevel% equ 0 (
    echo ✅ 地址创建页面 已同步
) else (
    echo ❌ 地址创建页面 同步失败
)

echo.
echo 📤 第四步：同步文档文件...

scp -P 4433 GOONG_ADDRESS_FIX_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
if %errorlevel% equ 0 (
    echo ✅ GOONG_ADDRESS_FIX_GUIDE.md 已同步
) else (
    echo ❌ GOONG_ADDRESS_FIX_GUIDE.md 同步失败
)

scp -P 4433 VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md root@160.191.53.56:/www/wwwroot/zalonew.itaoth.com/
if %errorlevel% equ 0 (
    echo ✅ VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md 已同步
) else (
    echo ❌ VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md 同步失败
)

echo.
echo 🔧 第五步：设置文件权限...

ssh -p 4433 root@160.191.53.56 "cd /www/wwwroot/zalonew.itaoth.com && chown -R www:www source/ && chmod -R 755 source/ && chown -R www:www zalo_mini_app-master/ && chmod -R 755 zalo_mini_app-master/ && chown www:www *.md && chmod 644 *.md && chown www:www test_goong_api.php && chmod 755 test_goong_api.php && chmod -R 775 source/runtime/"

if %errorlevel% equ 0 (
    echo ✅ 文件权限设置完成
) else (
    echo ❌ 文件权限设置失败
)

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
echo 🔧 后续验证步骤：
echo 1. 测试API功能: ssh -p 4433 root@160.191.53.56 "php /www/wwwroot/zalonew.itaoth.com/test_goong_api.php"
echo 2. 检查文件是否存在: ssh -p 4433 root@160.191.53.56 "ls -la /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master/src/components/GoongAddressPicker/"
echo 3. 重建前端（如果需要）: ssh -p 4433 root@160.191.53.56 "cd /www/wwwroot/zalonew.itaoth.com/zalo_mini_app-master && npm run build"
echo 4. 重启web服务器
echo.

echo 按任意键退出...
pause >nul