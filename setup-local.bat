@echo off
chcp 65001 >nul
echo ========================================
echo LINE Mini App 本地开发环境配置
echo ========================================
echo.

echo [1/4] 配置后端 API 地址...
echo 设置为: http://localhost:8080/index.php?s=api/
echo.

REM 更新配置文件
powershell -Command "(Get-Content src\config\config.js) -replace 'https://zalonew.itaoth.com/index.php\?s=api/', 'http://localhost:8080/index.php?s=api/' | Set-Content src\config\config.js"

echo [2/4] 检查 Node.js 和 npm...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未安装 Node.js
    echo 请访问 https://nodejs.org/ 下载并安装 Node.js
    pause
    exit /b 1
)
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: npm 不可用
    pause
    exit /b 1
)
echo ✅ Node.js 和 npm 已安装
echo.

echo [3/4] 安装依赖包...
echo 这可能需要几分钟时间，请耐心等待...
call npm install
if errorlevel 1 (
    echo ❌ 错误: 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

echo [4/4] 配置完成！
echo.
echo ========================================
echo 📋 配置摘要
echo ========================================
echo 后端 API: http://localhost:8080/index.php?s=api/
echo 前端端口: http://localhost:5173
echo 环境模式: development
echo.
echo ========================================
echo 🚀 启动说明
echo ========================================
echo 1. 确保后端已在 localhost:8080 运行
echo 2. 运行命令: npm run start
echo 3. 浏览器访问: http://localhost:5173
echo.
echo 是否现在启动开发服务器？(Y/N)
set /p choice=请选择: 

if /i "%choice%"=="Y" (
    echo.
    echo 正在启动开发服务器...
    echo 按 Ctrl+C 可停止服务器
    echo.
    call npm run start
) else (
    echo.
    echo 配置完成！稍后可运行 'npm run start' 启动服务器
    pause
)
