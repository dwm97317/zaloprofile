# 开发环境自动登录机制

## 概述

为了方便测试环境开发，系统实现了智能的自动登录机制。该机制会根据环境自动切换：
- **测试环境**：自动获取有效token，无需手动设置
- **生产环境**：自动切换回LINE认证流程

## 工作原理

### 环境检测

系统通过 `appEnv` 变量检测当前环境：
- `development` - 开发/测试环境
- `production` - 生产环境

### 自动登录流程（测试环境）

当检测到以下条件时，自动登录会被触发：

1. **环境条件**：`appEnv === "development"`
2. **后端条件**：LINE Mini App 未启用（`config.is_enable === false`）

**自动登录步骤**：

```
1. 检查localStorage中是否已有有效token
   ├─ 有效token存在 → 使用现有token
   └─ 无token或token无效 → 执行步骤2

2. 调用后端API自动生成token
   └─ GET /api/dev_token/generate?user_id=31831&wxapp_id=10001

3. 将token存储到localStorage
   ├─ token: {生成的token}
   └─ userId: {用户ID}

4. 完成自动登录
```

### 生产环境流程

在生产环境中：
- `DEV_AUTO_LOGIN.enabled` 自动设置为 `false`
- 自动登录功能完全禁用
- 系统使用标准的LINE LIFF认证流程

## 配置文件

### 1. `src/config/config.js`

```javascript
// 开发环境自动登录配置
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development", // 只在开发环境启用
    userId: 15027, // 测试用户ID
    wxappId: 10001, // 商户ID
};
```

**配置说明**：
- `enabled`: 自动根据环境变量设置，生产环境自动为 `false`
- `userId`: 测试环境使用的用户ID（当前：15027）
- `wxappId`: 商户ID

### 2. `src/utils/liff.js`

实现了 `autoLoginInDev()` 函数，负责：
- 检查环境配置
- 调用后端API生成token
- 存储token到localStorage
- 提供详细的控制台日志

## 使用方法

### 测试环境

**无需任何操作！** 系统会自动：

1. 启动前端：`npm run start`
2. 访问任何页面，系统自动登录
3. 控制台会显示：
   ```
   🔧 Development mode: Auto-login enabled
   🔑 Generating development token...
   ✅ Development token set successfully
      User: 顺其自然
      Token: 20285330502db55aeebd99705cad40c0
   ```

### 切换测试用户

如果需要使用不同的测试用户，修改 `src/config/config.js`：

```javascript
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development",
    userId: 15027, // 当前测试用户：海阔天空
    wxappId: 10001,
};
```

可用的测试用户（wxapp_id=10001）：
- **15027 - 海阔天空** ⭐ 当前使用的测试用户
- 31831 - 顺其自然
- 31823 - CS
- 31783 - lloxx
- 31782 - A快递快运.车队整车,调度
- 31778 - 亿霆国际物流-华华

### 生产环境部署

**无需修改任何代码！** 只需：

1. 设置环境变量：`NODE_ENV=production`
2. 构建项目：`npm run build`
3. 部署构建产物

系统会自动：
- 禁用自动登录功能
- 启用LINE LIFF认证
- 使用真实的LINE用户token

## 控制台日志

### 开发环境日志

**成功自动登录**：
```
🔧 Development mode: Auto-login enabled
🔑 Generating development token...
✅ Development token set successfully
   User: 海阔天空
   Token: a216e328616a783533040beb67f7d1a4
```

**使用现有token**：
```
🔧 Development mode: Auto-login enabled
✅ Using existing valid token: [token]
```

**自动登录失败（fallback）**：
```
🔧 Development mode: Auto-login enabled
❌ Auto-login failed: Network Error
⚠️ Using fallback dev token
```

### 生产环境日志

```
LIFF Profile: { userId: "U1234...", displayName: "...", ... }
```

## 后端API要求

自动登录依赖后端API：`/api/dev_token/generate`

**请求**：
```
GET /api/dev_token/generate?user_id=15027&wxapp_id=10001
```

**响应**：
```json
{
  "code": 1,
  "msg": "Token generated and stored successfully",
  "data": {
    "token": "a216e328616a783533040beb67f7d1a4",
    "user_id": 15027,
    "user": {
      "user_id": 15027,
      "nickName": "海阔天空",
      "mobile": "15656565656"
    }
  }
}
```

**重要**：生产环境应该禁用或删除此API端点！

## 安全注意事项

### ⚠️ 生产环境安全

1. **删除DevToken控制器**：
   ```bash
   # 生产环境部署前删除
   rm Lineminiapp/source/application/api/controller/DevToken.php
   ```

2. **环境变量检查**：
   ```bash
   # 确保生产环境设置正确
   echo $NODE_ENV  # 应该输出: production
   ```

3. **配置验证**：
   - 确保 `config.is_enable = true`（LINE已启用）
   - 确保 `DEV_AUTO_LOGIN.enabled = false`（自动登录已禁用）

### 测试环境安全

- 自动登录仅在本地开发环境工作
- Token有30天过期时间
- 不要在公网暴露测试环境

## 故障排除

### 问题1：自动登录不工作

**检查**：
1. 环境变量：`console.log(process.env.NODE_ENV)`
2. 配置：`console.log(DEV_AUTO_LOGIN)`
3. 后端API：访问 `http://localhost:8080/index.php?s=api/dev_token/generate&user_id=15027&wxapp_id=10001`

### 问题2：Token过期

**解决**：
1. 清除localStorage：`localStorage.clear()`
2. 刷新页面，系统会自动生成新token

### 问题3：生产环境仍在使用自动登录

**检查**：
1. 构建命令：确保使用 `NODE_ENV=production npm run build`
2. 配置文件：检查 `appEnv` 的值
3. 后端配置：确保 `config.is_enable = true`

## 优势

✅ **开发效率**：无需手动设置token，即开即用  
✅ **自动切换**：生产环境自动切换到LINE认证  
✅ **零配置**：开发者无需额外操作  
✅ **安全可靠**：生产环境完全禁用  
✅ **易于调试**：详细的控制台日志  

## 总结

这个自动登录机制让测试环境开发变得简单，同时确保生产环境的安全性。开发者只需关注业务逻辑，系统会自动处理认证流程的切换。

---

**最后更新**: 2026年1月11日  
**状态**: ✅ 已实现并测试
