# 生产环境部署指南 / Production Deployment Guide

## 后端地址 / Backend URL
`https://longthai.itaoth.com`

## 配置步骤 / Configuration Steps

### 1. 修改环境配置

**文件**: `src/config/env.js`

```javascript
// 开发环境
export const appEnv = "development";

// 生产环境 - 部署时改为这个
export const appEnv = "production";
```

### 2. 修改 API 配置

**文件**: `src/config/config.js`

#### 修改前 (当前配置)
```javascript
// 开发环境配置
const devBaseURL = "http://localhost:8080/index.php?s=api/";

// 生产环境配置
const proBaseURL = "http://localhost:8080/index.php?s=api/";
```

#### 修改后 (生产环境配置)
```javascript
// 开发环境配置
const devBaseURL = "http://localhost:8080/index.php?s=api/";

// 生产环境配置
const proBaseURL = "https://longthai.itaoth.com/index.php?s=api/";
```

### 3. 修改自动登录配置

**文件**: `src/config/config.js`

```javascript
// 开发环境自动登录配置
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development", // 只在开发环境启用
    userId: 15027, // 测试用户ID
    wxappId: 10001, // 商户ID
};
```

**注意**: 生产环境会自动禁用自动登录，用户必须通过 LINE 登录。

---

## 完整的配置文件示例

### src/config/env.js (生产环境)
```javascript
export const appEnv = "production";
```

### src/config/config.js (生产环境)
```javascript
import { appEnv } from "./env";

// 开发环境配置
const devBaseURL = "http://localhost:8080/index.php?s=api/";

// 生产环境配置
const proBaseURL = "https://longthai.itaoth.com/index.php?s=api/";

// 根据环境选择 API 地址
export const BASE_URL = appEnv === "development" ? devBaseURL : proBaseURL;

// 请求超时时间（毫秒）
export const TIMEOUT = 10000;

// 小程序 ID
export const WXAPP_ID = "10001";

// 是否启用调试模式
export const DEBUG = appEnv === "development";

// 开发环境自动登录配置
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development", // 只在开发环境启用
    userId: 15027, // 测试用户ID
    wxappId: 10001, // 商户ID
};
```

---

## 部署流程 / Deployment Process

### 方案 A: 手动修改配置文件

1. **修改环境**
   ```bash
   # 编辑 src/config/env.js
   export const appEnv = "production";
   ```

2. **构建生产版本**
   ```bash
   cd zalo_mini_app-master
   npm run build
   ```

3. **部署 dist 目录**
   - 将 `dist/` 目录上传到服务器
   - 配置 Web 服务器指向 dist 目录

### 方案 B: 使用环境变量 (推荐)

#### 1. 创建 .env 文件

**文件**: `zalo_mini_app-master/.env.development`
```env
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8080/index.php?s=api/
VITE_WXAPP_ID=10001
VITE_DEBUG=true
```

**文件**: `zalo_mini_app-master/.env.production`
```env
VITE_APP_ENV=production
VITE_API_BASE_URL=https://longthai.itaoth.com/index.php?s=api/
VITE_WXAPP_ID=10001
VITE_DEBUG=false
```

#### 2. 修改配置文件使用环境变量

**文件**: `src/config/env.js`
```javascript
export const appEnv = import.meta.env.VITE_APP_ENV || "development";
```

**文件**: `src/config/config.js`
```javascript
import { appEnv } from "./env";

// 从环境变量读取 API 地址
const devBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/index.php?s=api/";
const proBaseURL = import.meta.env.VITE_API_BASE_URL || "https://longthai.itaoth.com/index.php?s=api/";

// 根据环境选择 API 地址
export const BASE_URL = appEnv === "development" ? devBaseURL : proBaseURL;

// 请求超时时间（毫秒）
export const TIMEOUT = 10000;

// 小程序 ID
export const WXAPP_ID = import.meta.env.VITE_WXAPP_ID || "10001";

// 是否启用调试模式
export const DEBUG = import.meta.env.VITE_DEBUG === "true" || appEnv === "development";

// 开发环境自动登录配置
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development",
    userId: 15027,
    wxappId: 10001,
};
```

#### 3. 构建命令

```bash
# 开发环境
npm run dev

# 生产环境构建
npm run build
```

---

## 验证配置 / Verify Configuration

### 1. 检查 API 地址

在浏览器控制台运行：
```javascript
import { BASE_URL } from './src/config/config.js';
console.log('API Base URL:', BASE_URL);
```

或在任意组件中：
```javascript
import { BASE_URL } from '../config/config';
console.log('Current API URL:', BASE_URL);
```

### 2. 测试 API 连接

创建测试文件 `test-api-connection.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>API Connection Test</title>
</head>
<body>
    <h1>API Connection Test</h1>
    <button onclick="testAPI()">Test API</button>
    <div id="result"></div>

    <script>
        async function testAPI() {
            const apiUrl = 'https://longthai.itaoth.com/index.php?s=api/';
            const resultDiv = document.getElementById('result');
            
            try {
                resultDiv.innerHTML = 'Testing...';
                const response = await fetch(apiUrl + 'user/index', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'platform': 'LINE'
                    }
                });
                
                const data = await response.json();
                resultDiv.innerHTML = `
                    <h3>Success!</h3>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                resultDiv.innerHTML = `
                    <h3>Error!</h3>
                    <p>${error.message}</p>
                `;
            }
        }
    </script>
</body>
</html>
```

---

## CORS 配置 / CORS Configuration

如果遇到跨域问题，需要在后端配置 CORS。

### 后端 PHP 配置

**文件**: `Lineminiapp/source/application/api/controller/Controller.php`

在控制器基类中添加：
```php
<?php
namespace app\api\controller;

use think\Controller as ThinkController;

class Controller extends ThinkController
{
    public function initialize()
    {
        parent::initialize();
        
        // CORS 配置
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, platform, token');
        header('Access-Control-Max-Age: 86400');
        
        // 处理 OPTIONS 预检请求
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
        }
    }
}
```

或在 `.htaccess` 文件中添加：
```apache
# CORS Headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, platform, token"
Header set Access-Control-Max-Age "86400"

# Handle OPTIONS requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

---

## 部署检查清单 / Deployment Checklist

### 配置文件
- [ ] `src/config/env.js` - 设置为 `production`
- [ ] `src/config/config.js` - 生产环境 URL 设置为 `https://longthai.itaoth.com/index.php?s=api/`
- [ ] `.env.production` - 创建并配置环境变量（如果使用方案 B）

### 构建
- [ ] 运行 `npm install` 安装依赖
- [ ] 运行 `npm run build` 构建生产版本
- [ ] 检查 `dist/` 目录是否生成

### 后端
- [ ] 后端 API 可访问: `https://longthai.itaoth.com`
- [ ] CORS 配置正确
- [ ] API 端点正常工作

### 测试
- [ ] 测试 API 连接
- [ ] 测试用户登录
- [ ] 测试主要功能（包裹查询、地址管理等）

---

## 常见问题 / Troubleshooting

### 问题 1: CORS 错误
**错误**: `Access to fetch at 'https://longthai.itaoth.com' from origin 'xxx' has been blocked by CORS policy`

**解决方案**: 
1. 在后端添加 CORS 头部（见上文）
2. 确保后端正确处理 OPTIONS 预检请求

### 问题 2: API 404 错误
**错误**: `404 Not Found`

**检查**:
1. URL 是否正确: `https://longthai.itaoth.com/index.php?s=api/`
2. 后端路由是否配置正确
3. `.htaccess` 重写规则是否正确

### 问题 3: 连接超时
**错误**: `Network Error` 或 `Timeout`

**检查**:
1. 服务器是否在线
2. 防火墙是否阻止连接
3. SSL 证书是否有效（HTTPS）

### 问题 4: Token 失效
**错误**: `401 Unauthorized`

**解决方案**:
1. 清除浏览器 localStorage
2. 重新登录获取新 token
3. 检查后端 token 验证逻辑

---

## 快速切换环境 / Quick Environment Switch

### 开发环境
```bash
# 1. 修改 src/config/env.js
export const appEnv = "development";

# 2. 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 1. 修改 src/config/env.js
export const appEnv = "production";

# 2. 构建
npm run build

# 3. 部署 dist/ 目录
```

---

## 联系信息 / Contact

- **后端 URL**: https://longthai.itaoth.com
- **API 路径**: /index.php?s=api/
- **平台**: LINE Mini App
- **WXAPP_ID**: 10001

---

## 相关文档 / Related Documentation

- `src/config/config.js` - API 配置文件
- `src/config/env.js` - 环境配置
- `src/utils/request.js` - HTTP 请求工具
- `vite.config.js` - Vite 构建配置
