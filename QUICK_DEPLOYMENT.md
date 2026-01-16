# 快速部署指南 / Quick Deployment Guide

## 🚀 一键部署到生产环境

### Windows 用户

双击运行：
```
deploy-production.bat
```

这个脚本会自动：
1. 切换到生产环境
2. 安装依赖
3. 构建生产版本

### 手动部署

```bash
# 1. 修改环境配置
# 编辑 src/config/env.js
export const appEnv = "production";

# 2. 构建
npm install
npm run build

# 3. 部署
# 将 dist/ 目录上传到服务器
```

---

## 📝 配置说明

### 已配置的 API 地址

| 环境 | API 地址 |
|------|----------|
| 开发环境 | `http://localhost:8080/index.php?s=api/` |
| 生产环境 | `https://longthai.itaoth.com/index.php?s=api/` |

### 环境切换

**开发环境**:
```javascript
// src/config/env.js
export const appEnv = "development";
```

**生产环境**:
```javascript
// src/config/env.js
export const appEnv = "production";
```

---

## 🧪 测试 API 连接

### 方法 1: 使用测试页面

在浏览器中打开：
```
test-production-api.html
```

点击"测试连接"按钮验证 API 是否可访问。

### 方法 2: 使用 curl

```bash
# 测试基础连接
curl -X GET "https://longthai.itaoth.com/index.php?s=api/" \
  -H "Content-Type: application/json" \
  -H "platform: LINE"

# 测试用户 API
curl -X GET "https://longthai.itaoth.com/index.php?s=api/user/index" \
  -H "Content-Type: application/json" \
  -H "platform: LINE"
```

### 方法 3: 浏览器控制台

```javascript
fetch('https://longthai.itaoth.com/index.php?s=api/user/index', {
  headers: {
    'Content-Type': 'application/json',
    'platform': 'LINE'
  }
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## ✅ 部署检查清单

### 前端配置
- [x] `src/config/config.js` - 生产环境 URL 已设置
- [x] `.env.production` - 环境变量文件已创建
- [ ] `src/config/env.js` - 切换到 `production`
- [ ] 运行 `npm run build` 构建

### 后端配置
- [ ] 后端可访问: https://longthai.itaoth.com
- [ ] CORS 配置正确
- [ ] API 端点正常工作

### 测试
- [ ] 使用 `test-production-api.html` 测试连接
- [ ] 测试用户登录
- [ ] 测试主要功能

---

## 🔧 常见问题

### CORS 错误

如果遇到跨域错误，需要在后端添加 CORS 头部。

**后端 PHP 配置** (`Lineminiapp/source/application/api/controller/Controller.php`):

```php
public function initialize()
{
    parent::initialize();
    
    // CORS 配置
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, platform, token');
    
    // 处理 OPTIONS 预检请求
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}
```

### API 404 错误

检查：
1. URL 是否正确
2. 后端路由配置
3. `.htaccess` 重写规则

---

## 📚 相关文档

- `PRODUCTION_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `test-production-api.html` - API 连接测试工具
- `deploy-production.bat` - 一键部署脚本
- `deploy-development.bat` - 开发环境脚本

---

## 📞 支持

- **后端 URL**: https://longthai.itaoth.com
- **API 路径**: /index.php?s=api/
- **平台**: LINE Mini App
