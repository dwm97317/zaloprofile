@echo off
echo ========================================
echo LINE Mini App 开发环境
echo Development Environment
echo ========================================
echo.

echo 1. 切换到开发环境...
echo Switching to development environment...
echo export const appEnv = "development"; > src\config\env.js
echo.

echo 2. 启动开发服务器...
echo Starting development server...
call npm run dev
