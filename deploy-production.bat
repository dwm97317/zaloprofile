@echo off
echo ========================================
echo LINE Mini App 生产环境部署
echo Production Deployment
echo ========================================
echo.

echo 1. 切换到生产环境...
echo Switching to production environment...
echo export const appEnv = "production"; > src\config\env.js
echo.

echo 2. 安装依赖...
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo 依赖安装失败！
    echo Dependency installation failed!
    pause
    exit /b 1
)
echo.

echo 3. 构建生产版本...
echo Building production version...
call npm run build
if errorlevel 1 (
    echo 构建失败！
    echo Build failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo 部署完成！
echo Deployment completed!
echo ========================================
echo.
echo 生产环境 API: https://longthai.itaoth.com/index.php?s=api/
echo Production API: https://longthai.itaoth.com/index.php?s=api/
echo.
echo 请将 dist 目录上传到服务器
echo Please upload the dist directory to your server
echo.
pause
