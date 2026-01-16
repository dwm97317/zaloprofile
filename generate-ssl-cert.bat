@echo off
echo Generating SSL certificates for local LIFF development...
echo.

REM Check if OpenSSL is installed
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: OpenSSL is not installed or not in PATH
    echo.
    echo Please install OpenSSL:
    echo 1. Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Or use: choco install openssl
    echo 3. Or use: scoop install openssl
    echo.
    pause
    exit /b 1
)

REM Generate private key
echo [1/3] Generating private key...
openssl genrsa -out localhost-key.pem 2048

REM Generate certificate signing request
echo [2/3] Generating certificate signing request...
openssl req -new -key localhost-key.pem -out localhost.csr -subj "/C=TH/ST=Bangkok/L=Bangkok/O=VHunter/OU=Development/CN=localhost"

REM Generate self-signed certificate
echo [3/3] Generating self-signed certificate...
openssl x509 -req -days 365 -in localhost.csr -signkey localhost-key.pem -out localhost.pem

REM Clean up CSR file
del localhost.csr

echo.
echo ✅ SSL certificates generated successfully!
echo.
echo Files created:
echo   - localhost-key.pem (private key)
echo   - localhost.pem (certificate)
echo.
echo You can now run: liff-cli serve --liff-id YOUR_LIFF_ID --url http://localhost:3005/
echo.
pause
