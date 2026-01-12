# Zalo物流系统 API 文档

## 系统概述

这是一个完整的物流快递管理系统，主要服务于越南市场，支持包裹预报、入库、打包、发货等全流程管理。

### 基础信息
- **基础URL**: `https://zalonew.itaoth.com/index.php?s=`
- **默认小程序ID**: `10001`
- **认证方式**: Token认证
- **数据格式**: JSON

## API 模块分类

### 1. 用户管理模块 (`/api/user/`, `/api/passport/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/user/login` | POST | 用户登录 | 否 |
| `/api/user/clerklogin` | POST | 员工登录 | 否 |
| `/api/passport/register` | POST | 用户注册 | 否 |
| `/api/user/detail` | GET | 获取用户详情 | 是 |
| `/api/user/getsiteurl` | GET | 获取站点URL | 否 |

#### 登录请求示例
```json
{
  "mobile": "0123456789",
  "password": "123456",
  "wxapp_id": "10001"
}
```

#### 登录响应示例
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "user_id": 123,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 2. 包裹管理模块 (`/api/package/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/package/add` | POST | 包裹预报 | 是 |
| `/api/package/packagelist` | GET | 包裹列表 | 是 |
| `/api/package/detail` | GET | 包裹详情 | 是 |
| `/api/package/inpack` | POST | 申请打包 | 是 |
| `/api/package/getfreight` | POST | 计算运费 | 是 |
| `/api/package/packageForTaker` | GET | 待认领包裹 | 是 |

#### 包裹状态说明
- `1`: 未入库
- `2`: 已入库
- `3`: 已拣货上架
- `4`: 待打包
- `5`: 待支付
- `6`: 已支付
- `7`: 已分拣下架
- `8`: 已打包
- `9`: 已发货
- `10`: 已收货
- `11`: 已完成

#### 包裹预报请求示例
```json
{
  "express_num": "YT1234567890",
  "shop_id": "1",
  "weight": "1.5",
  "remark": "测试包裹",
  "wxapp_id": "10001"
}
```

### 3. 地址管理模块 (`/api/address/`, `/api/goong-address/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/address/lists` | GET | 地址列表 | 是 |
| `/api/address/add` | POST | 添加地址 | 是 |
| `/api/address/edit` | POST | 编辑地址 | 是 |
| `/api/address/remove` | POST | 删除地址 | 是 |
| `/api/address/getAlllists` | POST | 根据条件查询地址 | 是 |
| `/api/address/dslists` | GET | 代收点地址列表 | 是 |

#### 越南地址API (Goong集成)
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/goong-address/autocomplete` | GET | 地址自动补全 | 否 |
| `/api/goong-address/place-detail` | GET | 地址详情 | 否 |
| `/api/goong-address/provinces` | GET | 省份列表 | 否 |
| `/api/goong-address/validate` | POST | 地址验证 | 否 |

#### 地址添加请求示例
```json
{
  "name": "Nguyen Van A",
  "phone": "0123456789",
  "country": "Việt Nam",
  "province": "Hồ Chí Minh",
  "city": "Quận 1",
  "region": "Phường Bến Nghé",
  "detail": "123 Nguyễn Huệ",
  "userstree": "123 Nguyễn Huệ, Phường Bến Nghé",
  "door": "123",
  "wxapp_id": "10001"
}
```

### 4. 文件上传模块 (`/api/upload/`, `/api/apipost/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/upload/image` | POST | 文件上传 | 是 |
| `/api/apipost/image` | POST | Base64图片上传 | 否 |
| `/api/apipost/reportpackToBaidu` | POST | AI识别包裹信息 | 否 |

### 5. 订单管理模块 (`/api/order/`, `/api/user/order/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/order/add` | POST | 创建订单 | 是 |
| `/api/user/order/lists` | GET | 用户订单列表 | 是 |
| `/api/user/order/detail` | GET | 订单详情 | 是 |
| `/api/sharp/order/list` | GET | 拼团订单列表 | 是 |

### 6. 后台管理模块 (`/store/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/store/passport/login` | POST | 后台登录 | 否 |
| `/store/tr_order/all_list` | GET | 订单管理列表 | 是 |
| `/store/tr_order/upsatatus` | POST | 更新订单状态 | 是 |
| `/store/package/index` | GET | 包裹管理列表 | 是 |
| `/store/user/index` | GET | 用户管理列表 | 是 |

### 7. 系统设置模块 (`/api/setting/`)

#### 核心接口
| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/setting/index` | GET | 获取系统设置 | 否 |
| `/api/wxapp/index` | GET | 小程序配置 | 否 |

## 认证机制

### Token认证
1. 用户登录后获得token
2. 在请求头中添加: `token: your_token_here`
3. Token有效期根据系统配置

### 小程序ID验证
- 大部分接口需要传递 `wxapp_id` 参数
- 默认值: `10001`
- 可通过URL参数或POST数据传递

## 错误处理

### 标准响应格式
```json
{
  "code": 1,        // 1=成功, 0=失败
  "msg": "success", // 消息描述
  "data": {}        // 响应数据
}
```

### 常见错误码
- `code: 0` - 请求失败
- `code: 1` - 请求成功
- 具体错误信息在 `msg` 字段中

## 使用说明

### 1. 导入Postman集合
1. 打开Postman
2. 点击Import
3. 选择 `api_test_collection.json` 文件
4. 导入完成后可直接测试

### 2. 配置环境变量
- `base_url`: `https://zalonew.itaoth.com/index.php?s=`
- `wxapp_id`: `10001`
- `token`: 登录后获取的token
- `user_id`: 登录后获取的用户ID

### 3. 测试流程建议
1. 先进行用户登录获取token
2. 设置token到环境变量
3. 测试其他需要认证的接口
4. 根据业务流程进行完整测试

## 特殊说明

### 越南地址集成
系统集成了Goong地图API，支持越南地址的自动补全和验证功能。

### 微信集成
系统支持微信小程序和公众号集成，包括模板消息推送等功能。

### AI识别功能
支持百度OCR API进行包裹信息的智能识别。

## 技术栈
- **后端框架**: ThinkPHP 5.0
- **数据库**: MySQL
- **文件存储**: 支持本地存储和云存储
- **第三方集成**: 微信API、Goong地图API、百度OCR API
