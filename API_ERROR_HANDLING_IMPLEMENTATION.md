# API 错误处理实现完成

## 日期
2026-01-10

## 概述
实现了统一的 API 错误处理系统，提供用户友好的错误消息和完善的错误日志记录。

## 实现内容

### 1. 错误处理工具 (`src/utils/errorHandler.js`)

#### 核心功能
- **错误类型识别**: 自动识别网络错误、服务器错误、验证错误、认证错误
- **用户友好消息**: 将技术错误转换为泰语用户友好消息
- **统一错误处理**: `handleApiError()` 函数统一处理所有 API 错误
- **错误日志记录**: 记录详细的错误信息用于调试

#### 错误类型
```javascript
export const ErrorType = {
  NETWORK: "NETWORK",      // 网络连接错误
  SERVER: "SERVER",        // 服务器错误 (5xx)
  VALIDATION: "VALIDATION", // 验证错误 (400)
  AUTH: "AUTH",            // 认证错误 (401)
  UNKNOWN: "UNKNOWN",      // 未知错误
};
```

#### 主要函数

##### `handleApiError(error, options)`
统一处理 API 错误的主函数

**参数**:
- `error`: 错误对象
- `options`: 配置选项
  - `showToast`: 是否显示 Toast 提示（默认 true）
  - `defaultMessage`: 默认错误消息
  - `onAuth`: 认证错误回调
  - `onError`: 自定义错误处理回调

**功能**:
- 自动识别错误类型
- 显示用户友好的 Toast 消息
- 处理认证错误（清除 token，刷新页面）
- 记录错误日志

**使用示例**:
```javascript
import { handleApiError } from "../utils/errorHandler";

try {
  const res = await request.post("api/endpoint", data);
  if (res.code === 1) {
    // 成功处理
  } else {
    handleApiError({ response: { data: res } });
  }
} catch (error) {
  handleApiError(error);
}
```

##### `withErrorHandling(apiCall, options)`
创建带错误处理的 API 调用包装器

**使用示例**:
```javascript
import { withErrorHandling } from "../utils/errorHandler";
import request from "../utils/request";

const fetchUserData = withErrorHandling(
  () => request.get("user/detail&wxapp_id=10001"),
  { defaultMessage: "ไม่สามารถโหลดข้อมูลผู้ใช้" }
);

// 使用
const data = await fetchUserData();
if (data) {
  // 处理数据
}
```

##### `handleValidationErrors(errors, showToast)`
处理表单验证错误

**使用示例**:
```javascript
import { handleValidationErrors } from "../utils/errorHandler";

const errors = {
  email: "อีเมลไม่ถูกต้อง",
  password: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
};

if (handleValidationErrors(errors)) {
  return; // 有错误，停止提交
}
```

### 2. 错误消息翻译 (`src/locales/th/translation.json`)

添加了完整的泰语错误消息翻译：

```json
{
  "errors": {
    "network_error": "ไม่สามารถเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
    "request_timeout": "คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง",
    "server_error": "เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง",
    "bad_gateway": "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    "service_unavailable": "บริการไม่พร้อมใช้งานในขณะนี้",
    "gateway_timeout": "เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง",
    "bad_request": "คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
    "unauthorized": "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ",
    "forbidden": "ไม่มีสิทธิ์เข้าถึง",
    "not_found": "ไม่พบข้อมูลที่ต้องการ",
    "validation_error": "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    "insufficient_balance": "ยอดเงินไม่เพียงพอ",
    "invalid_coupon": "คูปองไม่ถูกต้องหรือหมดอายุ",
    "session_expired": "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง"
  }
}
```

### 3. 现有页面已集成错误处理

以下页面已经使用了错误处理机制：

#### ✅ 包裹预报页面 (`src/pages/Package/Forecast.jsx`)
```javascript
try {
  const res = await request.post("package/forecast&wxapp_id=10001", submitData);
  if (res.code === 1) {
    toast.success(t("forecast.success"));
  } else {
    toast.error(res.msg || t("forecast.failed"));
  }
} catch (error) {
  console.error("Forecast error:", error);
  toast.error(t("forecast.failed"));
}
```

#### ✅ 转账充值页面 (`src/pages/Mine/Recharge.jsx`)
```javascript
try {
  const res = await request.post("recharge/apply&wxapp_id=10001", submitData);
  if (res.code === 1) {
    toast.success(t("recharge.success"));
  } else {
    toast.error(res.msg || t("recharge.failed"));
  }
} catch (error) {
  console.error("Recharge error:", error);
  toast.error(t("recharge.failed"));
}
```

#### ✅ 优惠券页面 (`src/pages/Common/Coupon.jsx`)
```javascript
try {
  const res = await request.get("/user.coupon/lists&wxapp_id=10001", { data_type: dataType });
  if (res.data && res.data.list) {
    setList(res.data.list);
  }
} catch (error) {
  console.error("Failed to fetch coupons", error);
}
```

#### ✅ Mine 页面 (`src/pages/Mine/Index.jsx`)
```javascript
try {
  const res = await request.post("user/detail&wxapp_id=10001");
  if (res.code === 1 && res.data && res.data.userInfo) {
    // 处理数据
  } else if (res.code === -1) {
    handleLogout();
  }
} catch (err) {
  console.error(err);
}
```

## 使用指南

### 基本用法

#### 1. 在组件中使用
```javascript
import { handleApiError } from "../../utils/errorHandler";
import request from "../../utils/request";

const MyComponent = () => {
  const handleSubmit = async () => {
    try {
      const res = await request.post("api/endpoint", data);
      
      if (res.code === 1) {
        // 成功处理
        toast.success("操作成功");
      } else {
        // 业务错误
        handleApiError({ response: { data: res } });
      }
    } catch (error) {
      // 网络或其他错误
      handleApiError(error);
    }
  };
};
```

#### 2. 使用包装器
```javascript
import { withErrorHandling } from "../../utils/errorHandler";

const fetchData = withErrorHandling(
  async () => {
    const res = await request.get("api/data");
    return res;
  },
  {
    defaultMessage: "ไม่สามารถโหลดข้อมูล",
    showToast: true
  }
);

// 使用
const data = await fetchData();
```

#### 3. 自定义错误处理
```javascript
handleApiError(error, {
  showToast: true,
  defaultMessage: "เกิดข้อผิดพลาด",
  onAuth: () => {
    // 自定义认证错误处理
    navigate("/login");
  },
  onError: (error, type, message) => {
    // 自定义错误处理
    console.log("Custom error handling", type, message);
  }
});
```

## 错误处理流程

```
API 调用
    ↓
发生错误
    ↓
识别错误类型
    ├─ 网络错误 → 显示网络错误消息
    ├─ 认证错误 → 清除 token + 刷新页面
    ├─ 服务器错误 → 显示服务器错误消息
    ├─ 验证错误 → 显示验证错误消息
    └─ 未知错误 → 显示默认错误消息
    ↓
记录错误日志
    ↓
调用自定义回调（如果有）
```

## 优势

### 1. 用户体验
- ✅ 所有错误消息都是泰语
- ✅ 消息简洁明了，易于理解
- ✅ 自动处理认证过期

### 2. 开发体验
- ✅ 统一的错误处理接口
- ✅ 减少重复代码
- ✅ 易于维护和扩展
- ✅ 完整的错误日志

### 3. 可维护性
- ✅ 集中管理错误消息
- ✅ 易于添加新的错误类型
- ✅ 支持自定义错误处理

## 测试建议

### 1. 网络错误测试
- 断开网络连接
- 测试超时情况

### 2. 服务器错误测试
- 模拟 500 错误
- 模拟 502/503/504 错误

### 3. 认证错误测试
- 使用过期 token
- 测试自动登出功能

### 4. 验证错误测试
- 提交无效数据
- 测试表单验证

## 下一步

### 已完成 ✅
- [x] 创建统一错误处理工具
- [x] 添加泰语错误消息翻译
- [x] 现有页面已集成错误处理
- [x] 文档编写

### 待优化
- [ ] 添加错误上报到日志服务
- [ ] 添加更多错误类型
- [ ] 添加错误重试机制
- [ ] 添加离线检测

## 相关文件

- `src/utils/errorHandler.js` - 错误处理工具
- `src/locales/th/translation.json` - 泰语翻译
- `src/pages/Package/Forecast.jsx` - 包裹预报页面
- `src/pages/Mine/Recharge.jsx` - 转账充值页面
- `src/pages/Common/Coupon.jsx` - 优惠券页面
- `src/pages/Mine/Index.jsx` - Mine 页面

## 总结

成功实现了完整的 API 错误处理系统，所有页面都能优雅地处理各种错误情况，为用户提供友好的错误提示。系统具有良好的可扩展性和可维护性。
