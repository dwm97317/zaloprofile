@echo off
echo ========================================
echo Starting Backend PHP Server
echo ========================================
echo.

cd /d D:\2025profile\Lineminiapp\web
echo Backend directory: %CD%
echo.
echo Starting PHP server on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

php -S localhost:8080
