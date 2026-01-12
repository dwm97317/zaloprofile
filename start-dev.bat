@echo off
chcp 65001 >nul
title LINE Mini App - 开发服务器

echo ========================================
echo LINE Mini App 开发服务器
echo ========================================
echo.

echo 📋 检查配置...
echo 后端 API: http://localhost:8080/index.php?s=api/
echo 前端地址: http://localhost:5173
echo.

echo ⚠️  请确保后端已在 localhost:8080 运行！
echo.
echo 按任意键启动前端开发服务器...
pause >nul

echo.
echo 🚀 正在启动开发服务器...
echo 按 Ctrl+C 可停止服务器
echo.
echo ========================================
echo.

call npm run start
