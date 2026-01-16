# 🔧 ThinkPHP URL 路由修复

## 📋 问题根源

### ❌ 错误信息
```
POST http://localhost:8080/index.php?s=api/package/details_pack&wxapp_id=10001&token=...
响应: 方法不存在: app\api\controller\Package->DetailsPack()
```

### 🔍 问题分析

**后端方法名**: `details_pack` (带下划线)
```php
// Package.php Line 1852
public function details_pack() {
    // ...
}
```

**ThinkPHP 路由规则**:
- URL 中的下划线 `_` 会被自动转换为驼峰命名
- `details_pack` → `DetailsPack`
- 但后端方法是 `details_pack`，不是 `DetailsPack`

**结果**: 路由找不到对应的方法

---

## ✅ 解决方案

### 方案：使用驼峰命名的 URL

**前端调用**:
```javascript
// ❌ 错误 - 使用下划线
request.post("package/details_pack", { id: 123 })
// ThinkPHP 会查找: DetailsPack() 方法 ❌

// ✅ 正确 - 使用驼峰
request.post("package/detailsPack", { id: 123 })
// ThinkPHP 会查找: details_pack() 方法 ✅
```

**最终 URL**:
```
POST http://localhost:8080/index.php?s=api/package/detailsPack&wxapp_id=10001&token=...
```

---

## 🔄 ThinkPHP URL 路由规则

### 规则说明

| URL 格式 | ThinkPHP 查找的方法 | 说明 |
|----------|-------------------|------|
| `package/details_pack` | `DetailsPack()` | 下划线转驼峰（首字母大写） |
| `package/detailsPack` | `details_pack()` | 驼峰转下划线（小写） |
| `package/details` | `details()` | 直接匹配 |
| `package/canclePack` | `cancle_pack()` | 驼峰转下划线 |

### 转换规则

```
URL 驼峰 → 方法下划线
detailsPack → details_pack
canclePack → cancle_pack
getUserInfo → get_user_info
```

---

## 📝 修复内容

### 1. OrderDetail.jsx

```javascript
// 修复前
const res = await request.post("package/details_pack", { id: orderId });

// 修复后
const res = await request.post("package/detailsPack", { id: orderId });
```

### 2. request.js - 自动添加参数

```javascript
import { BASE_URL, TIMEOUT, WXAPP_ID } from "../config/config";

axios.interceptors.request.use(
  async (config) => {
    if (config.params === undefined) {
      config.params = {};
    }

    // ✅ 自动添加 wxapp_id
    config.params["wxapp_id"] = WXAPP_ID;

    // ✅ 自动添加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.params["token"] = token;
    }

    return config;
  }
);
```

---

## 🎯 完整的 API 调用流程

### 1. 前端调用
```javascript
request.post("package/detailsPack", { id: 69406 })
```

### 2. request.js 拦截器处理
```javascript
// 自动添加参数
config.params = {
  wxapp_id: "10001",
  token: "746cb905b97bc6314ee4bbd2041417b0"
};
config.data = { id: 69406 };
```

### 3. 最终请求
```
POST http://localhost:8080/index.php?s=api/package/detailsPack&wxapp_id=10001&token=746cb...
Body: {"id": 69406}
```

### 4. ThinkPHP 路由处理
```
URL: package/detailsPack
↓
转换: details_pack
↓
查找: Package->details_pack()
↓
✅ 找到方法并执行
```

### 5. 后端响应
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "id": 69406,
    "order_sn": "IN202601...",
    "item": [...],
    "address": {...},
    "line": {...}
  }
}
```

---

## 📚 其他需要注意的 API

### 已知的 ThinkPHP 路由映射

| 前端 URL | 后端方法 | 说明 |
|----------|---------|------|
| `package/detailsPack` | `details_pack()` | 集运订单详情 ✅ |
| `package/details` | `details()` | 包裹详情 ✅ |
| `package/canclePack` | `cancle_pack()` | 取消集运订单 ✅ |
| `package/outside` | `outside()` | 包裹列表 ✅ |
| `package/postPack` | `post_pack()` | 提交打包 ✅ |

### 命名建议

**前端调用时**:
- 使用驼峰命名（首字母小写）
- 例如: `detailsPack`, `canclePack`, `postPack`

**后端方法名**:
- 使用下划线命名（全小写）
- 例如: `details_pack`, `cancle_pack`, `post_pack`

---

## 🧪 测试验证

### 测试 1: 使用 curl
```bash
curl -X POST "http://localhost:8080/index.php?s=api/package/detailsPack&wxapp_id=10001&token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": 69406}'
```

**预期结果**: 返回订单详情数据

### 测试 2: 在浏览器中
1. 打开 `test-order-detail-api.html`
2. 输入订单 ID: `69406`
3. 输入 Token
4. 点击 "测试 API"
5. 查看响应

### 测试 3: 在应用中
1. 访问 `https://localhost:9000/order/index`
2. 点击任意订单的 "ดูรายละเอียด"
3. 应该成功显示订单详情页

---

## ✅ 修复验证清单

- [x] 修改 `OrderDetail.jsx` 使用 `detailsPack`
- [x] 修改 `request.js` 自动添加 `wxapp_id`
- [x] 修复 `EnhancedOrderListCard.jsx` 的 ref 警告
- [x] 测试 API 调用成功
- [x] 验证数据正确返回
- [x] 无控制台错误

---

## 📖 ThinkPHP 文档参考

**URL 路由规则**:
- 官方文档: https://www.kancloud.cn/manual/thinkphp5_1/353955
- URL 访问: `模块/控制器/操作/参数/值...`
- 驼峰转换: 自动将 URL 中的驼峰转换为下划线方法名

**最佳实践**:
1. 前端使用驼峰命名（与 JavaScript 规范一致）
2. 后端使用下划线命名（与 PHP 规范一致）
3. ThinkPHP 自动处理转换

---

**修复日期**: January 15, 2026  
**状态**: ✅ Complete  
**测试**: ✅ Passed
