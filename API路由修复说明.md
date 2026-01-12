# API 路由修复说明

## 🔍 问题原因

ThinkPHP 框架的 `url_convert` 配置设置为 `true`，会自动将 URL 中的控制器和方法名转换为小写加下划线格式。

### 配置位置
```php
// Lineminiapp/source/application/config.php
'url_convert' => true,  // 自动转换 URL
```

---

## ✅ 正确的 API 路由格式

### 控制器和方法名转换规则

| 后端类名/方法名 | URL 格式 | 说明 |
|----------------|----------|------|
| `LineApp::base()` | `line_app/base` | 驼峰转小写下划线 |
| `LineApp::parseAddress()` | `line_app/parse_address` | 驼峰转小写下划线 |
| `Passport::loginMpLine()` | `passport/login_mp_line` | 驼峰转小写下划线 |

---

## 📝 已修复的文件

### 1. 前端 API 调用

#### `src/utils/liff.js`
```javascript
// ❌ 错误
const response = await axios.get(`${BASE_URL}LineApp/base`);
const loginRes = await axios.post(`${BASE_URL}Passport/loginMpLine`, ...);

// ✅ 正确
const response = await axios.get(`${BASE_URL}line_app/base`);
const loginRes = await axios.post(`${BASE_URL}passport/login_mp_line`, ...);
```

#### `src/utils/addressParser.js`
```javascript
// ❌ 错误
const res = await request.post("LineApp/parseAddress&wxapp_id=10001", ...);

// ✅ 正确
const res = await request.post("line_app/parse_address&wxapp_id=10001", ...);
```

---

## 🧪 测试 API

### 1. 测试 LINE 配置接口

```bash
# 浏览器访问
http://localhost:8080/index.php?s=api/line_app/base&wxapp_id=10001
```

**预期返回**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "config": {
      "is_enable": 1,
      "liff_id": "your-liff-id",
      "liff_size": "full",
      "scopes": ["profile", "openid"],
      "bot_link": "Off",
      "google_maps_key": "your-maps-key",
      "pay_is_enable": 0
    }
  }
}
```

### 2. 测试地址解析接口

```bash
# 使用 curl 或 Postman
POST http://localhost:8080/index.php?s=api/line_app/parse_address&wxapp_id=10001
Content-Type: application/json

{
  "lat": 13.7563,
  "lng": 100.5018
}
```

### 3. 测试 LINE 登录接口

```bash
POST http://localhost:8080/index.php?s=api/passport/login_mp_line
Content-Type: application/json
platform: LINE

{
  "idToken": "your-line-id-token",
  "wxapp_id": 10001
}
```

---

## 🔧 如果仍然出错

### 方案 1: 禁用 URL 转换（不推荐）

编辑 `Lineminiapp/source/application/config.php`:

```php
// 禁用 URL 自动转换
'url_convert' => false,
```

然后使用驼峰命名的 URL：
```
http://localhost:8080/index.php?s=api/LineApp/base&wxapp_id=10001
```

**注意**: 这会影响所有 API 路由，不推荐修改。

### 方案 2: 使用路由配置（推荐）

编辑 `Lineminiapp/source/application/route.php`，添加明确的路由规则：

```php
use think\Route;

// LINE API 路由
Route::get('api/line_app/base', 'api/LineApp/base');
Route::post('api/line_app/parse_address', 'api/LineApp/parseAddress');
Route::post('api/passport/login_mp_line', 'api/Passport/loginMpLine');
```

---

## 📋 完整的 API 路由列表

### LINE 相关 API

| 功能 | 方法 | URL | 参数 |
|------|------|-----|------|
| 获取配置 | GET | `/api/line_app/base` | `wxapp_id=10001` |
| 地址解析 | POST | `/api/line_app/parse_address` | `lat`, `lng`, `wxapp_id=10001` |
| LINE 登录 | POST | `/api/passport/login_mp_line` | `idToken`, `wxapp_id=10001` |

### 其他常用 API

| 功能 | 方法 | URL | 说明 |
|------|------|-----|------|
| 包裹列表 | GET | `/api/package/index` | 获取用户包裹 |
| 提交包裹 | POST | `/api/package/submit` | 预报包裹 |
| 地址列表 | GET | `/api/address/lists` | 获取用户地址 |
| 添加地址 | POST | `/api/address/add` | 添加/更新地址 |
| 订单列表 | GET | `/api/order/lists` | 获取订单列表 |
| 订单详情 | GET | `/api/order/detail` | 获取订单详情 |

---

## ✅ 验证修复

### 1. 重启前端开发服务器

```cmd
# 按 Ctrl+C 停止
# 重新启动
npm run start
```

### 2. 清除浏览器缓存

按 `Ctrl+Shift+Delete` 清除缓存

### 3. 测试 API 调用

打开浏览器开发者工具（F12），查看 Network 标签：

- ✅ 请求 URL 应该是小写加下划线格式
- ✅ 响应状态应该是 200
- ✅ 响应数据应该包含正确的 JSON

---

## 📞 技术支持

如果仍然遇到问题：

1. 检查后端 PHP 错误日志
2. 检查浏览器控制台错误
3. 确认 `url_convert` 配置
4. 联系技术支持: support@vhuongtra.com

---

**修复日期**: 2025-01-10  
**修复状态**: ✅ 完成
