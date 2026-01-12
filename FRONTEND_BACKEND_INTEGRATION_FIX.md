# Frontend-Backend Integration Fix

## Problem Summary

The frontend was unable to display data from the backend (storage list, claim list, etc.) due to authentication token issues. The backend API was returning errors:
- `"缺少必要的参数：token"` (Missing required parameter: token)
- `"没有找到用户信息"` (User not found)

## Root Cause

1. **Development Mode Token Generation**: The frontend's `src/utils/liff.js` was generating a new fake token (`dev-token-{timestamp}`) on every page load when LINE Mini App was not enabled in the backend.

2. **Token Not in Cache**: The generated dev tokens were just strings stored in localStorage, but the backend expects tokens to exist in the ThinkPHP cache system with associated user data.

3. **Token Overwriting**: Even when a valid token was manually set, it would be overwritten by the dev mode logic on the next page load.

## Solution Implemented

### 1. Fixed Token Generation Logic (Frontend)

**File**: `zalo_mini_app-master/src/utils/liff.js`

**Change**: Modified the dev mode logic to check if a token already exists before generating a new one:

```javascript
// In development mode, skip LIFF initialization if not enabled
if (!config.is_enable) {
    console.warn("LINE Mini App is not enabled in backend. Running in development mode without LIFF.");
    // Only generate a mock token if one doesn't exist
    if (!localStorage.getItem("token")) {
        localStorage.setItem("token", "dev-token-" + Date.now());
        localStorage.setItem("userId", "dev-user-123");
        console.log("Generated dev token for development mode");
    } else {
        console.log("Using existing token:", localStorage.getItem("token"));
    }
    return config;
}
```

**Impact**: Tokens set manually or via the dev token generator will no longer be overwritten.

### 2. Created Development Token Generator (Backend)

**File**: `Lineminiapp/source/application/api/controller/DevToken.php`

**Purpose**: Provides an API endpoint to generate valid tokens that are properly stored in the ThinkPHP cache system.

**Endpoint**: `http://localhost:8080/index.php?s=api/dev_token/generate&user_id=31831&wxapp_id=10001`

**Features**:
- Generates a token using the same algorithm as the Login service
- Stores the token in ThinkPHP cache with user data (30-day expiration)
- Returns token, user info, frontend setup code, and test URLs
- Lists available users if the specified user is not found

**Response Example**:
```json
{
  "code": 1,
  "msg": "Token generated and stored successfully",
  "data": {
    "token": "20285330502db55aeebd99705cad40c0",
    "user_id": 31831,
    "wxapp_id": 10001,
    "user": {
      "user_id": 31831,
      "nickName": "顺其自然",
      "mobile": "0"
    },
    "expires_in": 2592000,
    "frontend_code": "localStorage.setItem('token', '20285330502db55aeebd99705cad40c0'); localStorage.setItem('userId', '31831'); window.location.reload();",
    "test_urls": {
      "storage_list": "http://localhost:8080/index.php?s=api/page/storageList&wxapp_id=10001&token=...",
      "claim_list": "http://localhost:8080/index.php?s=api/package/claimList&wxapp_id=10001&token=..."
    }
  }
}
```

### 3. Created Simple Token Generator (Standalone)

**File**: `Lineminiapp/web/simple_token_gen.php`

**Purpose**: A standalone PHP script (no ThinkPHP dependencies) that generates tokens and provides setup instructions.

**Access**: `http://localhost:8080/simple_token_gen.php?user_id=31831&wxapp_id=10001`

**Features**:
- Direct database connection
- User-friendly HTML interface
- One-click token setup button
- Copy-to-clipboard functionality
- Test API links

**Note**: This script generates tokens but doesn't store them in the cache, so it's mainly for reference. Use the DevToken API endpoint instead.

## How to Use (Development Workflow)

### Step 1: Generate a Valid Token

Visit the dev token generator endpoint:
```
http://localhost:8080/index.php?s=api/dev_token/generate&user_id=31831&wxapp_id=10001
```

This will:
- Generate a valid token
- Store it in the ThinkPHP cache with user data
- Return the token and setup instructions

### Step 2: Set Token in Frontend

Copy the `frontend_code` from the API response and execute it in your browser console (F12) at `http://localhost:3000/`:

```javascript
localStorage.setItem('token', '20285330502db55aeebd99705cad40c0');
localStorage.setItem('userId', '31831');
window.location.reload();
```

### Step 3: Verify

Navigate to any page that requires authentication:
- Storage List: `http://localhost:3000/storage/index`
- Claim Page: `http://localhost:3000/package/claim`
- Orders: `http://localhost:3000/order/index`

The pages should now display data correctly.

## Testing Results

### ✅ Storage List Page
- **URL**: `http://localhost:3000/storage/index`
- **Status**: Working
- **Data**: Displays 6 warehouses (武汉, 纽约跑跑金峰仓库, 福清仓, CARGO, 龙, 深圳仓)
- **API**: `GET /api/page/storageList&wxapp_id=10001&token={token}`

### ✅ Claim Page
- **URL**: `http://localhost:3000/package/claim`
- **Status**: Working
- **Features**: Form to enter claim code, validation, submit functionality
- **API**: `POST /api/package/claim&wxapp_id=10001&token={token}`

### ✅ Token Persistence
- Token is no longer overwritten on page reload
- Token remains valid for 30 days
- Console shows: "Using existing token: {token}"

## API Route Format Notes

ThinkPHP's `url_convert` configuration converts URLs to lowercase with underscores:
- Frontend calls: `page/storageList` or `page/storage_list`
- Backend method: `storageList()` (camelCase)
- URL routing: Both formats work, but lowercase with underscores is recommended

## Files Modified

1. `zalo_mini_app-master/src/utils/liff.js` - Fixed token generation logic

## Files Created

1. `Lineminiapp/source/application/api/controller/DevToken.php` - Token generator API
2. `Lineminiapp/web/simple_token_gen.php` - Standalone token generator (reference)
3. `Lineminiapp/web/set_dev_token.php` - ThinkPHP-based token setter (deprecated)
4. `Lineminiapp/generate_token.php` - CLI token generator (deprecated)
5. `Lineminiapp/get_valid_token.php` - Database query script (reference)

## Recommended Files to Keep

- ✅ `DevToken.php` - Main token generator API (use this)
- ✅ `simple_token_gen.php` - Reference/backup
- ❌ Other files can be deleted after testing

## Future Improvements

1. ~~**Auto-Login in Dev Mode**: Create a middleware that automatically generates and sets a valid token when LINE is not enabled~~ ✅ **已实现**
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **Multi-User Support**: Add a UI to switch between different test users
4. **Token Management**: Create an admin panel to view and manage active tokens

## 自动登录功能（已实现）

### 概述

系统现在支持智能的环境切换：
- **测试环境**：自动调用后端API获取有效token，无需手动设置
- **生产环境**：自动切换回LINE LIFF认证流程

### 配置

在 `src/config/config.js` 中添加了自动登录配置：

```javascript
export const DEV_AUTO_LOGIN = {
    enabled: appEnv === "development", // 只在开发环境启用
    userId: 31831, // 测试用户ID
    wxappId: 10001, // 商户ID
};
```

### 工作流程

1. **检测环境**：系统检测到开发环境且LINE未启用
2. **自动获取token**：调用 `/api/dev_token/generate` API
3. **存储token**：自动存储到localStorage
4. **完成登录**：用户可以直接使用所有功能

### 使用方法

**测试环境**：
```bash
npm run start
# 系统自动登录，无需任何操作
```

**生产环境**：
```bash
NODE_ENV=production npm run build
# 自动切换到LINE认证，无需修改代码
```

### 控制台日志

开发环境会显示：
```
🔧 Development mode: Auto-login enabled
🔑 Generating development token...
✅ Development token set successfully
   User: 顺其自然
   Token: 20285330502db55aeebd99705cad40c0
```

详细文档请参考：[DEV_AUTO_LOGIN.md](./DEV_AUTO_LOGIN.md)

## Security Notes

⚠️ **Important**: The `DevToken` controller should only be used in development environments. In production:
- Remove or disable the `DevToken` controller
- Ensure proper LIFF authentication is enabled
- Use real LINE user tokens only

## Conclusion

The frontend-backend integration issue has been resolved. The storage list and claim pages now display data correctly using valid tokens stored in the ThinkPHP cache system. The development workflow has been streamlined with the new token generator API.

---

**Date**: January 11, 2026  
**Status**: ✅ Complete  
**Tested**: Storage List, Claim Page  
**Token Expiration**: 30 days
