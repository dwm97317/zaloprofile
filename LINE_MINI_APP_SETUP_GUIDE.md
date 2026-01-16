# LINE Mini App (LIFF) 配置指南

## 📋 前提条件

在开始之前，你需要：
1. LINE Business Account（LINE 商业账号）
2. LINE Developers Console 访问权限
3. 已部署的前端应用 URL

## 🚀 步骤 1: 创建 LINE Provider

### 1.1 访问 LINE Developers Console
```
https://developers.line.biz/console/
```

### 1.2 创建 Provider
1. 点击 "Create a new provider"
2. 填写 Provider 信息：
   - **Provider name**: 你的公司/应用名称（例如：VHunter Logistics）
   - **Description**: 简短描述你的服务

## 🎯 步骤 2: 创建 LINE Login Channel

### 2.1 创建 Channel
1. 在 Provider 页面，点击 "Create a LINE Login channel"
2. 填写 Channel 信息：

**基本信息**：
- **Channel type**: LINE Login
- **Provider**: 选择刚创建的 Provider
- **Company or owner's country or region**: Thailand
- **Channel name**: VHunter Logistics（或你的应用名称）
- **Channel description**: 跨境物流集运平台
- **App types**: Web app

**Channel icon**：
- 上传你的应用图标（1:1 比例，最小 200x200px）

**Email address**：
- 填写你的联系邮箱

### 2.2 同意条款
- 勾选 "I have read and agree to the LINE Developers Agreement"
- 点击 "Create"

## 📱 步骤 3: 创建 LIFF App

### 3.1 进入 LIFF 设置
1. 在 Channel 页面，点击 "LIFF" 标签
2. 点击 "Add" 按钮

### 3.2 配置 LIFF App

**LIFF app name**：
```
VHunter Logistics Mini App
```

**Size**：
```
Full
```
- Full: 全屏显示（推荐用于完整应用）
- Tall: 75% 屏幕高度
- Compact: 50% 屏幕高度

**Endpoint URL**：
```
https://your-domain.com
```
⚠️ **重要**：
- 必须是 HTTPS
- 不能是 localhost
- 例如：`https://logistics.vhunter.com`

**Scope**：
勾选以下权限：
- ✅ `openid` - 获取用户 ID（必需）
- ✅ `profile` - 获取用户资料（姓名、头像）
- ✅ `email` - 获取用户邮箱（可选）

**Bot link feature**：
```
Normal
```
- Normal: 显示添加好友按钮
- Aggressive: 强制添加好友
- Off: 不显示

**Scan QR**：
```
不勾选（除非需要扫码功能）
```

**Module mode**：
```
不勾选（使用标准模式）
```

### 3.3 保存配置
点击 "Add" 按钮保存

### 3.4 获取 LIFF ID
创建成功后，你会看到 LIFF ID，格式如下：
```
2008873580-2xOUaLCU
```
**⚠️ 重要：复制并保存这个 LIFF ID！**

## 🔑 步骤 4: 配置 Channel Secret

### 4.1 获取 Channel Secret
1. 在 Channel 页面，点击 "Basic settings" 标签
2. 找到 "Channel secret" 部分
3. 点击 "Issue" 生成 Channel Secret
4. 复制并保存 Channel Secret

### 4.2 获取 Channel ID
在同一页面找到 "Channel ID"，复制保存

## 🔧 步骤 5: 配置后端

### 5.1 更新数据库配置

在后端数据库中，找到 `yoshop_setting` 表，更新 `line_config` 配置：

```sql
UPDATE yoshop_setting 
SET values = '{
  "is_enable": 1,
  "liff_id": "2008873580-2xOUaLCU",
  "liff_size": "full",
  "scopes": ["openid", "profile"],
  "bot_link": "Normal",
  "channel_id": "你的Channel ID",
  "channel_secret": "你的Channel Secret",
  "google_maps_key": ""
}'
WHERE key = 'line_config';
```

### 5.2 验证配置

测试 API 端点：
```bash
curl "http://localhost:8080/index.php?s=api/line_app/base&wxapp_id=10001"
```

应该返回：
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "config": {
      "is_enable": 1,
      "liff_id": "2008873580-2xOUaLCU",
      "liff_size": "full",
      "scopes": ["openid", "profile"],
      "bot_link": "Normal",
      "google_maps_key": ""
    }
  }
}
```

## 🌐 步骤 6: 部署前端

### 6.1 构建前端应用

```bash
cd zalo_mini_app-master
npm install
npm run build
```

### 6.2 部署到服务器

将 `dist` 目录部署到你的 HTTPS 服务器：
```
https://your-domain.com
```

### 6.3 更新 LIFF Endpoint URL

如果之前填写的是临时 URL，现在需要更新：
1. 回到 LINE Developers Console
2. 进入 LIFF 设置
3. 编辑 LIFF App
4. 更新 "Endpoint URL" 为实际部署的 URL
5. 保存

## 🧪 步骤 7: 测试 LIFF App

### 7.1 获取 LIFF URL

LIFF URL 格式：
```
https://liff.line.me/{LIFF_ID}
```

例如：
```
https://liff.line.me/2008873580-2xOUaLCU
```

### 7.2 在 LINE 中测试

**方法 1：使用 LINE 聊天**
1. 在 LINE 中发送 LIFF URL 给自己或朋友
2. 点击链接打开应用

**方法 2：使用 QR Code**
1. 生成 LIFF URL 的 QR Code
2. 在 LINE 中扫描 QR Code

**方法 3：使用 LINE Developers Console**
1. 在 LIFF 设置页面
2. 点击 "Try it" 按钮

### 7.3 验证功能

测试以下功能：
- ✅ 应用能正常打开
- ✅ 用户能自动登录
- ✅ 能获取用户资料（姓名、头像）
- ✅ 所有页面功能正常
- ✅ 导航栏正常工作

## 🔐 步骤 8: 配置 Messaging API（可选）

如果需要发送通知消息给用户：

### 8.1 创建 Messaging API Channel
1. 在 Provider 页面，点击 "Create a Messaging API channel"
2. 填写 Channel 信息
3. 获取 Channel Access Token

### 8.2 配置 Webhook
1. 在 Messaging API 设置中
2. 设置 Webhook URL：
   ```
   https://your-domain.com/api/line/webhook
   ```
3. 启用 Webhook

## 📊 步骤 9: 配置 LINE Pay（可选）

如果需要 LINE Pay 支付功能：

### 9.1 申请 LINE Pay
1. 访问 LINE Pay 商户平台
2. 提交申请
3. 等待审核

### 9.2 配置支付参数
更新数据库中的 `line_pay` 配置：
```sql
UPDATE yoshop_setting 
SET values = '{
  "is_enable": 1,
  "channel_id": "LINE Pay Channel ID",
  "channel_secret": "LINE Pay Channel Secret",
  "sandbox": 0
}'
WHERE key = 'line_pay';
```

## 🎨 步骤 10: 自定义 Rich Menu（可选）

### 10.1 设计 Rich Menu
1. 在 Messaging API 设置中
2. 点击 "Rich menus"
3. 创建新的 Rich Menu

### 10.2 配置菜单项
添加快捷菜单项：
- 首页
- 我的包裹
- 客服支持
- 等等

## 🐛 常见问题排查

### 问题 1: LIFF 初始化失败

**错误信息**：
```
LIFF Initialization failed
```

**解决方案**：
1. 检查 LIFF ID 是否正确
2. 确认 Endpoint URL 是 HTTPS
3. 检查后端 API 是否返回正确配置

### 问题 2: 无法获取用户资料

**错误信息**：
```
Cannot get profile
```

**解决方案**：
1. 确认 Scope 包含 `profile`
2. 检查用户是否授权
3. 确认 LIFF 已正确初始化

### 问题 3: 开发环境测试

**问题**：
本地开发时无法使用 LIFF

**解决方案**：
前端已经实现了开发模式自动登录：
```javascript
// 在 src/utils/liff.js 中
if (!config.is_enable) {
    console.warn("LINE Mini App is not enabled in backend. Running in development mode without LIFF.");
    // 自动登录逻辑
}
```

设置 `is_enable: 0` 即可在开发环境跳过 LIFF

### 问题 4: CORS 错误

**错误信息**：
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解决方案**：
在后端添加 CORS 头：
```php
header('Access-Control-Allow-Origin: https://liff.line.me');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

## 📝 配置检查清单

部署前检查：

### LINE Developers Console
- [ ] Provider 已创建
- [ ] LINE Login Channel 已创建
- [ ] LIFF App 已创建
- [ ] LIFF ID 已获取
- [ ] Channel Secret 已获取
- [ ] Endpoint URL 已设置为 HTTPS
- [ ] Scope 已正确配置

### 后端配置
- [ ] `line_config` 已更新
- [ ] LIFF ID 正确
- [ ] API 端点可访问
- [ ] 返回正确的配置

### 前端配置
- [ ] 应用已构建
- [ ] 已部署到 HTTPS 服务器
- [ ] BASE_URL 指向正确的后端
- [ ] LIFF 初始化代码正常

### 测试
- [ ] LIFF URL 可访问
- [ ] 用户能登录
- [ ] 能获取用户资料
- [ ] 所有功能正常

## 🔗 有用的链接

- [LINE Developers Console](https://developers.line.biz/console/)
- [LIFF 文档](https://developers.line.biz/en/docs/liff/)
- [LINE Login 文档](https://developers.line.biz/en/docs/line-login/)
- [LINE Pay 文档](https://pay.line.me/developers/main/main)
- [LIFF Playground](https://liff-playground.netlify.app/)（测试工具）

## 📞 支持

如有问题，请联系：
- LINE 官方支持：https://developers.line.biz/en/support/
- 技术文档：https://developers.line.biz/en/docs/

---

**完成时间**: 2026-01-12  
**文档版本**: 1.0  
**适用于**: VHunter Logistics LINE Mini App
