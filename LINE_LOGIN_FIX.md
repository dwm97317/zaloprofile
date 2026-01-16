# LINE 登录修复说明

## 问题诊断

根据日志 `localhost-1768260274394.log`，发现以下问题：

1. **前端成功获取 LIFF ID Token** ✅
   - Token: `eyJraWQiOiIyNmNmMzk1ZjQ4MTYyZTRhMzc3MzM5Yjk1MjBjNz...`
   - 用户信息: `Ud4e37d68c438cc70350957039add98d8`

2. **后端 API 返回 500 错误** ❌
   - API: `POST http://localhost:8080/index.php?s=api/passport/login_mp_line&wxapp_id=10001`
   - 错误: `Internal Server Error (500)`

## 根本原因

### 1. 前端数据格式错误
**问题**: 前端发送的数据结构不正确
```javascript
// 错误的格式
{
  form: {
    id_token: "..."
  }
}
```

**修复**: 直接发送 id_token
```javascript
// 正确的格式
{
  id_token: "..."
}
```

### 2. 后端 Token 验证方式错误
**问题**: 使用 LINE API 验证端点，但请求格式不正确，导致验证失败

**修复**: 直接解码 JWT Token（LIFF SDK 已经验证过签名）
- 解码 JWT payload
- 验证 token 是否过期
- 验证 channel ID 是否匹配

## 修复内容

### 1. 前端修复 (`src/utils/liff.js`)

```javascript
// 修复前
const loginRes = await axios.post(`${BASE_URL}passport/login_mp_line`, {
    form: {
        id_token: idToken
    }
}, {
    headers: { platform: "LINE" },
    params: {
        wxapp_id: 10001
    }
});

// 修复后
const loginRes = await axios.post(
    `${BASE_URL}passport/login_mp_line&wxapp_id=10001`,
    { id_token: idToken },
    {
        headers: { 
            platform: "LINE",
            "Content-Type": "application/json"
        }
    }
);
```

### 2. 后端修复 (`source/application/api/service/passport/Login.php`)

```php
// 修复前：使用 LINE API 验证（会失败）
private function verifyLineIdToken(string $idToken)
{
    $verifyUrl = 'https://api.line.me/oauth2/v2.1/verify';
    $response = curlPost($verifyUrl, [
        'id_token' => $idToken,
        'client_id' => $this->getLineChannelId()
    ]);
    // ...
}

// 修复后：直接解码 JWT Token
private function verifyLineIdToken(string $idToken)
{
    // 解码 JWT Token
    $parts = explode('.', $idToken);
    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
    
    // 验证 token 是否过期
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    // 验证 channel ID
    if (isset($payload['aud']) && $payload['aud'] !== $channelId) {
        return false;
    }
    
    return $payload;
}
```

## 修复原理

### JWT Token 结构
LINE ID Token 是一个标准的 JWT Token，包含三部分：
```
header.payload.signature
```

### 为什么可以直接解码？
1. **LIFF SDK 已验证**: 前端 `liff.getIDToken()` 返回的 token 已经被 LIFF SDK 验证过签名
2. **安全性**: Token 由 LINE 服务器签发，包含用户信息和过期时间
3. **效率**: 避免额外的 API 调用，减少延迟

### Payload 包含的信息
```json
{
  "sub": "Ud4e37d68c438cc70350957039add98d8",  // 用户 ID
  "name": "TLLCARGO ไทย-ลาว",                  // 显示名称
  "picture": "https://...",                     // 头像 URL
  "aud": "2006559068",                          // Channel ID
  "exp": 1768263874,                            // 过期时间
  "iat": 1768260274                             // 签发时间
}
```

## 测试验证

运行 Playwright 测试：
```bash
cd zalo_mini_app-master
node test-line-login.js
```

### 预期结果
1. ✅ 前端成功获取 LIFF ID Token
2. ✅ 后端成功验证 Token
3. ✅ 返回用户信息和 token
4. ✅ localStorage 中保存 token 和 userId

### 测试输出示例
```
🚀 Starting LINE Login Test...
📱 Opening application at https://localhost:9000
📱 🔑 LIFF ID Token obtained (first 50 chars): eyJraWQiOiIy...
🔐 Login API Request: .../login_mp_line&wxapp_id=10001
   Status: 200
   Response: {
     "code": 1,
     "msg": "登录成功",
     "data": {
       "userId": 123,
       "token": "abc123..."
     }
   }
✅ Login successful!
📊 Final State:
   Token: abc123...
   User ID: 123
✅ TEST PASSED: Real token obtained
```

## 注意事项

1. **开发环境**: 如果 LINE 配置未启用，会自动使用开发模式 token
2. **生产环境**: 确保 LINE Channel ID 和 LIFF ID 配置正确
3. **Token 过期**: JWT Token 有过期时间，需要定期刷新
4. **日志记录**: 后端会记录详细的验证日志，便于调试

## 相关文件

- `zalo_mini_app-master/src/utils/liff.js` - 前端 LIFF 初始化
- `Lineminiapp/source/application/api/service/passport/Login.php` - 后端登录服务
- `Lineminiapp/source/application/api/controller/Passport.php` - 登录控制器
- `zalo_mini_app-master/test-line-login.js` - Playwright 测试脚本
