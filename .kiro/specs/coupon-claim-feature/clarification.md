# Phase 4: 澄清文档 (Clarification)

## 📋 文档信息
- **创建时间**: 2026-01-16
- **Phase**: 4 - Clarification
- **状态**: 进行中

---

## 🎯 后端 API 分析结果

### 1. 现有 API 接口

#### 1.1 获取优惠券列表
**接口**: `GET /api/coupon/lists`

**请求参数**:
- `coupon_type` (可选): 优惠券类型筛选
  - `0`: 满减券 (coupon_type=10)
  - `1`: 折扣券 (coupon_type=20)
  - `2`: 其他类型 (coupon_type=30)

**响应数据**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "list": [
      {
        "coupon_id": 1,
        "name": "满100减10",
        "color": {
          "text": "blue|red|violet|yellow",
          "value": 10|20|30|40
        },
        "coupon_type": {
          "text": "满减券|折扣券",
          "value": 10|20
        },
        "reduce_price": "10.00",
        "discount": 9.5,
        "min_price": "100.00",
        "expire_type": 10|20,
        "expire_day": 7,
        "start_time": {
          "text": "2026/01/01",
          "value": 1735660800
        },
        "end_time": {
          "text": "2026/12/31",
          "value": 1767196800
        },
        "total_num": 100,
        "is_receive": false,
        "state": {
          "text": "已领取|已抢光|已过期|",
          "value": 0|1
        },
        "sort": 100
      }
    ]
  }
}
```

**字段说明**:
- `is_receive`: 当前用户是否已领取该优惠券
- `state.value`: 1=可领取, 0=不可领取
- `expire_type`: 10=领取后N天有效, 20=固定时间段有效
- `coupon_type.value`: 10=满减券, 20=折扣券

#### 1.2 获取用户可用优惠券
**接口**: `GET /api/coupon/enablecoupon`

**请求参数**:
- `total_free`: 订单金额（用于筛选可用优惠券）

**响应数据**:
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "list": [
      {
        "coupon_id": 1,
        "name": "满100减10",
        "color": {...},
        "coupon_type": {...},
        "reduce_price": "10.00",
        "discount": 9.5,
        "min_price": "100.00",
        "reduced_price": "10.00"
      }
    ]
  }
}
```

#### 1.3 获取优惠券详情
**接口**: `GET /api/coupon/couponDetail`

**请求参数**:
- `coupon_id`: 用户优惠券ID

---

### 2. 缺失的 API 接口

#### ⚠️ 2.1 领取优惠券接口 (需要补充)

后端模型中已有 `UserCoupon::receive()` 方法，但 **API 控制器中缺少对应的接口**。

**建议新增接口**: `POST /api/coupon/receive`

**请求参数**:
```json
{
  "coupon_id": 1
}
```

**响应数据**:
```json
{
  "code": 1,
  "msg": "领取成功",
  "data": {
    "user_coupon_id": 123,
    "coupon_id": 1,
    "name": "满100减10",
    "start_time": 1737014400,
    "end_time": 1737619200
  }
}
```

**错误响应**:
```json
{
  "code": 0,
  "msg": "优惠券已发完|该优惠券已领取|优惠券已过期"
}
```

---

## 🔍 需求与后端对比分析

### 3.1 字段映射关系

| 需求字段 | 后端字段 | 数据类型 | 说明 |
|---------|---------|---------|------|
| 优惠券名称 | `name` | string | ✅ 完全匹配 |
| 优惠额度 | `reduce_price` / `discount` | decimal / float | ✅ 满减用 reduce_price，折扣用 discount |
| 使用限制 | `min_price` | decimal | ✅ 最低消费金额 |
| 优惠券颜色 | `color.value` | int | ✅ 10/20/30/40 对应不同颜色 |
| 优惠券类型 | `coupon_type.value` | int | ✅ 10=满减, 20=折扣 |
| 有效期类型 | `expire_type` | int | ✅ 10=领取后N天, 20=固定时间段 |
| 有效天数 | `expire_day` | int | ✅ expire_type=10 时使用 |
| 开始时间 | `start_time.value` | timestamp | ✅ expire_type=20 时使用 |
| 结束时间 | `end_time.value` | timestamp | ✅ expire_type=20 时使用 |
| 发放总数 | `total_num` | int | ✅ -1 表示不限制 |
| 已领取数 | `receive_num` | int | ⚠️ API 响应中已隐藏 |
| 是否已领取 | `is_receive` | boolean | ✅ 前端用于判断按钮状态 |
| 可领取状态 | `state.value` | int | ✅ 1=可领取, 0=不可领取 |

### 3.2 业务逻辑对比

| 需求 | 后端实现 | 状态 |
|------|---------|------|
| 公开到领券中心 | `is_open=0` 筛选条件 | ✅ 已实现 |
| 限制领取数量 | `total_num` 字段 + 验证逻辑 | ✅ 已实现 |
| 防止重复领取 | `getUserCouponIds()` 检查 | ✅ 已实现 |
| 过期验证 | `checkReceive()` 方法 | ✅ 已实现 |
| 领取后更新数量 | `setIncReceiveNum()` 方法 | ✅ 已实现 |
| 按排序显示 | `order(['sort' => 'asc'])` | ✅ 已实现 |

---

## ❓ 需要澄清的问题

### ✅ Q1: 领取优惠券接口缺失 (已解决)
**问题**: 后端 API 控制器中没有领取优惠券的接口，但模型层已有完整的 `receive()` 方法。

**解决方案**: 已在 `Lineminiapp/source/application/api/controller/Coupon.php` 中新增 `receive()` 方法

**新增接口**: `POST /api/coupon/receive`
- 请求参数: `coupon_id` (优惠券ID)
- 成功响应: `{code: 1, msg: "领取成功", data: []}`
- 失败响应: `{code: 0, msg: "优惠券已发完|该优惠券已领取|优惠券已过期"}`

### ✅ Q2: 优惠券颜色映射 (已确认)
**问题**: 后端返回颜色值为 10/20/30/40，对应 blue/red/violet/yellow。

**解决方案**: 使用 Tailwind CSS 渐变色，与现有 UI 风格保持一致
- blue (10) → `bg-gradient-to-br from-blue-500 to-blue-600`
- red (20) → `bg-gradient-to-br from-red-500 to-red-600`
- violet (30) → `bg-gradient-to-br from-purple-500 to-purple-600`
- yellow (40) → `bg-gradient-to-br from-yellow-500 to-yellow-600`

### ✅ Q3: 优惠券使用场景 (已确认)
**问题**: 后端注释说明"使用场景都是在运费的时候用的"。

**确认结果**: 优惠券**仅用于运费抵扣**

**影响**: 
- 前端展示文案: "可用于运费抵扣" / "ใช้สำหรับค่าขนส่ง"
- 使用说明: 在订单结算时选择优惠券抵扣运费

### ✅ Q4: 我的优惠券页面 (已确认)
**问题**: 需求中提到"优惠券领取"功能，但用户领取后是否需要"我的优惠券"页面？

**确认结果**: 前端**已有优惠券列表功能**

**实现方案**:
- 在"用户页 → 其他服务"下新增"优惠券领取"入口
- 展示可领取的优惠券列表（调用 `/api/coupon/lists`）
- 用户点击领取按钮（调用 `/api/coupon/receive`）
- 已领取的优惠券在订单结算时使用（调用 `/api/coupon/enablecoupon`）

---

## 🎨 前端实现建议

### 5.1 页面结构
```
Mine (用户页)
└── Other Services (其他服务)
    └── Coupon Center (优惠券领取) ← 新增入口
        ├── 可领取优惠券列表
        ├── 优惠券卡片
        └── 领取按钮
```

### 5.2 组件设计
```javascript
// 优惠券卡片组件
<CouponCard
  name="满100减10"
  type="满减券"
  reducePrice="10.00"
  minPrice="100.00"
  color="blue"
  expireInfo="领取后7天内有效"
  isReceived={false}
  canReceive={true}
  onReceive={handleReceive}
/>
```

### 5.3 状态管理
- 使用 React Query 或 SWR 管理优惠券列表
- 领取后自动刷新列表
- 乐观更新 UI（领取按钮立即变为"已领取"）

### 5.4 UI 规范
- 圆角卡片 `rounded-2xl`
- 渐变图标背景（与会员等级徽章风格一致）
- 泰语文案（需要翻译）
- 颜色方案：
  - blue → `bg-gradient-to-br from-blue-500 to-blue-600`
  - red → `bg-gradient-to-br from-red-500 to-red-600`
  - violet → `bg-gradient-to-br from-purple-500 to-purple-600`
  - yellow → `bg-gradient-to-br from-yellow-500 to-yellow-600`

---

## 📝 下一步行动

### Phase 4 待办事项
- [x] 确认是否需要新增领取接口 ✅ 已新增
- [x] 确认优惠券颜色映射方案 ✅ 使用 Tailwind 渐变色
- [x] 确认优惠券使用场景说明 ✅ 仅用于运费抵扣
- [x] 确认是否需要"我的优惠券"页面 ✅ 前端已有列表功能
- [ ] 准备泰语翻译文案 (待 Phase 5)

### Phase 5 准备
一旦澄清完成，将进入 Phase 5 (Validation)，验证：
- API 接口可用性测试
- 数据格式兼容性测试
- 业务逻辑完整性测试

---

## 📚 参考文档
- 后端优惠券控制器: `Lineminiapp/source/application/api/controller/Coupon.php`
- 后端优惠券模型: `Lineminiapp/source/application/api/model/Coupon.php`
- 后端用户优惠券模型: `Lineminiapp/source/application/api/model/UserCoupon.php`
- 现有优惠券视图: `Lineminiapp/source/application/web/view/guide/usercoupon.php`
