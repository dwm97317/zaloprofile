# 🔧 API 路由修复 - 快速指南

## ⚠️ 问题

访问 `http://localhost:8080/index.php?s=api/LineApp/base&wxapp_id=10001` 时出现错误：
```
控制器不存在: app\api\controller\Lineapp
```

## ✅ 解决方案

ThinkPHP 的 `url_convert` 配置会自动将 URL 转换为小写加下划线格式。

### 正确的 URL 格式

```
❌ 错误: http://localhost:8080/index.php?s=api/LineApp/base&wxapp_id=10001
✅ 正确: http://localhost:8080/index.php?s=api/line_app/base&wxapp_id=10001
```

---

## 📝 已修复的文件

### 前端代码（已自动修复）

1. ✅ `src/utils/liff.js`
   - `LineApp/base` → `line_app/base`
   - `Passport/loginMpLine` → `passport/login_mp_line`

2. ✅ `src/utils/addressParser.js`
   - `LineApp/parseAddress` → `line_app/parse_address`

---

## 🧪 立即测试

### 1. 测试后端 API

在浏览器中访问：
```
http://localhost:8080/index.php?s=api/line_app/base&wxapp_id=10001
```

**应该看到**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "config": {
      "is_enable": 1,
      "liff_id": "",
      "liff_size": "full",
      "scopes": [],
      "bot_link": "Off",
      "google_maps_key": "",
      "pay_is_enable": 0
    }
  }
}
```

> **注意**: 如果 `liff_id` 等字段为空，需要在商户后台配置 LINE 设置。

### 2. 启动前端

```cmd
cd D:\2025profile\zalo_mini_app-master
npm run start
```

### 3. 验证前端连接

1. 访问 http://localhost:5173
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签，应该看到：
   ```
   LIFF Initialization...
   ```
4. 查看 Network 标签，应该看到对 `line_app/base` 的请求成功（状态 200）

---

## 📋 完整的 API 路由对照表

| 功能 | 后端类/方法 | 正确的 URL |
|------|------------|-----------|
| 获取配置 | `LineApp::base()` | `/api/line_app/base` |
| 地址解析 | `LineApp::parseAddress()` | `/api/line_app/parse_address` |
| LINE 登录 | `Passport::loginMpLine()` | `/api/passport/login_mp_line` |
| 包裹列表 | `Package::index()` | `/api/package/index` |
| 提交包裹 | `Package::submit()` | `/api/package/submit` |
| 地址列表 | `Address::lists()` | `/api/address/lists` |
| 添加地址 | `Address::add()` | `/api/address/add` |
| 订单列表 | `Order::lists()` | `/api/order/lists` |

---

## 🔍 如果仍然出错

### 检查清单

- [ ] 后端是否在 localhost:8080 运行？
  ```cmd
  # 测试命令
  curl http://localhost:8080
  ```

- [ ] URL 是否使用了小写加下划线格式？
  ```
  ✅ line_app/base
  ❌ LineApp/base
  ```

- [ ] 是否添加了 CORS 配置？
  - 检查 `web/index.php` 是否引入了 `cors-config.php`

- [ ] 前端代码是否已更新？
  - 重启前端开发服务器：`npm run start`

### 查看错误日志

#### 后端错误
```cmd
# 查看 PHP 错误
# 在运行 php -S localhost:8080 的终端窗口查看输出
```

#### 前端错误
```
# 打开浏览器开发者工具（F12）
# 查看 Console 标签的错误信息
# 查看 Network 标签的请求状态
```

---

## 🚀 下一步

### 1. 配置 LINE 开发者信息

访问商户后台：
```
http://localhost:8080/store
```

进入：**设置 → LINE 配置**

填写：
- LIFF ID
- Channel ID
- Channel Secret
- Google Maps API Key

### 2. 测试完整功能

- ✅ LINE 登录
- ✅ 地址管理（需要 Google Maps Key）
- ✅ 包裹管理
- ✅ 订单管理

---

## 📞 需要帮助？

### 常见问题

**Q: 为什么要用小写加下划线？**
A: ThinkPHP 的 `url_convert` 配置默认开启，会自动转换 URL 格式。

**Q: 可以改回驼峰命名吗？**
A: 可以，但不推荐。需要修改 `source/application/config.php` 中的 `url_convert` 为 `false`。

**Q: 前端已经修复了吗？**
A: 是的，`src/utils/liff.js` 和 `src/utils/addressParser.js` 已经更新。

### 技术支持

- **文档**: 查看 [API路由修复说明.md](./API路由修复说明.md)
- **Email**: support@vhuongtra.com

---

## ✅ 修复完成确认

当您看到以下内容时，说明修复成功：

### 后端测试成功
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "config": { ... }
  }
}
```

### 前端连接成功
- 浏览器控制台无错误
- Network 标签显示 `line_app/base` 请求成功（200）
- 页面正常显示

---

<div align="center">

**🎉 修复完成！现在可以正常开发了！**

*修复日期: 2025-01-10*

</div>
