# 订单确认收货功能实现

## 修复日期
2026-01-15

## 需求说明

用户要求：
1. **已发货状态(status=6)**: 不显示"取消订单"按钮
2. **已发货状态(status=6)**: 显示"已收到货"按钮
3. **点击"已收到货"**: 订单状态从6(已发货)直接变为8(已完成)

## 实现内容

### 1. 前端按钮逻辑修改 ✅

**文件**: `src/components/Order/EnhancedOrderListCard.jsx`

#### 修改按钮显示逻辑

**修改前**:
```javascript
const canCancel = item.status !== -1 && item.status !== 3;
const canPay = item.status === 2;
```

**修改后**:
```javascript
// 已发货(6)、已收货(7)、已完成(8)状态不能取消
const canCancel = item.status !== -1 && item.status < 6;
const canPay = item.status === 2 && item.is_pay === 2;
// 已发货状态显示"确认收货"按钮
const canConfirmReceive = item.status === 6;
```

#### 添加确认收货按钮

```jsx
{canConfirmReceive && (
  <ActionButton
    variant="success"
    icon="📬"
    onClick={() => onConfirmReceive(item.id)}
  >
    {t("order.buttons.confirm_receive", "ได้รับแล้ว")}
  </ActionButton>
)}
```

#### 添加成功按钮样式

```javascript
const variants = {
  primary: '...',
  success: outline
    ? 'border-2 border-green-500 text-green-600 hover:bg-green-50'
    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl',
  danger: '...',
  secondary: '...'
};
```

### 2. 前端确认收货处理 ✅

**文件**: `src/pages/Order/Index.jsx`

#### 添加确认收货处理函数

```javascript
const handleConfirmReceive = async (id) => {
  setLoading(true);
  setLoadingText(t("common.processing", "กำลังดำเนินการ..."));
  try {
    const res = await request.post("package/signedin&wxapp_id=10001", { id: id });
    if (res.code === 1) {
      toast.success(t("order.confirm_receive_success", "ยืนยันการรับสินค้าสำเร็จ"));
      fetchOrderList(activeTab);
    } else {
      toast.error(res.msg || t("common.error", "เกิดข้อผิดพลาด"));
    }
  } catch (err) {
    toast.error(t("common.error_network", "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};
```

#### 传递处理函数到组件

```jsx
<EnhancedOrderListCard
  key={item.id || index}
  item={item}
  onDetail={(id) => { ... }}
  onCancel={handleCancelClick}
  onPay={handlePay}
  onConfirmReceive={handleConfirmReceive}  // 新增
/>
```

### 3. 后端API修改 ✅

**文件**: `Lineminiapp/source/application/api/controller/Package.php`

#### 修改签收API状态更新

**修改前**:
```php
// 更新订单状态为已收货(7)
(new Inpack())->where(['id'=>$id])->update(['status'=>7]);
```

**修改后**:
```php
// 更新订单状态为已完成(8)而不是已收货(7)
(new Inpack())->where(['id'=>$id])->update(['status'=>8]);
```

## 按钮显示规则

### 订单列表按钮显示逻辑

| 订单状态 | 支付按钮 | 取消按钮 | 确认收货按钮 | 详情按钮 |
|---------|---------|---------|-------------|---------|
| -1 (已取消) | ❌ | ❌ | ❌ | ✅ |
| 1 (待查验) | ❌ | ✅ | ❌ | ✅ |
| 2 (待支付) | ✅ | ✅ | ❌ | ✅ |
| 3 (待发货) | ❌ | ✅ | ❌ | ✅ |
| 4 (已拣货) | ❌ | ✅ | ❌ | ✅ |
| 5 (已打包) | ❌ | ✅ | ❌ | ✅ |
| 6 (已发货) | ❌ | ❌ | ✅ | ✅ |
| 7 (已收货) | ❌ | ❌ | ❌ | ✅ |
| 8 (已完成) | ❌ | ❌ | ❌ | ✅ |

### 按钮显示条件代码

```javascript
const canPay = item.status === 2 && item.is_pay === 2;
const canCancel = item.status !== -1 && item.status < 6;
const canConfirmReceive = item.status === 6;
```

## 状态流转

### 正常订单流程

```
1 (待查验) 
  ↓
2 (待支付) 
  ↓ [用户支付]
3 (待发货)
  ↓
4 (已拣货)
  ↓
5 (已打包)
  ↓
6 (已发货) 
  ↓ [用户点击"已收到货"]
8 (已完成) ✅
```

### 关键状态说明

- **状态 6 (已发货)**: 
  - 不能取消订单
  - 显示"已收到货"按钮
  - 点击后直接变为状态 8

- **状态 7 (已收货)**: 
  - 系统保留状态，但用户操作跳过此状态
  - 从状态 6 直接到状态 8

- **状态 8 (已完成)**: 
  - 订单完成，不能进行任何操作
  - 只能查看详情

## API接口

### 确认收货接口

**接口**: `POST /api/package/signedin`

**参数**:
```json
{
  "id": 123,  // 订单ID
  "wxapp_id": 10001
}
```

**返回成功**:
```json
{
  "code": 1,
  "msg": "签收成功",
  "data": []
}
```

**返回失败**:
```json
{
  "code": 0,
  "msg": "包裹状态错误",  // 或 "包裹数据错误"
  "data": []
}
```

### 接口逻辑

1. 验证订单是否存在
2. 验证订单状态是否为6(已发货)
3. 更新订单状态为8(已完成)
4. 更新包裹状态为10
5. 添加物流记录
6. 返回成功消息

## 视觉效果

### 已发货订单卡片

```
┌─────────────────────────────────────┐
│ 🚚 จัดส่งแล้ว (已发货)              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 📋 2026011543787                    │
│                                     │
│ 🚚 ขนส่ง: CJ专线                   │
│ 📮 หมายเลขติดตาม: 665456123        │
│                                     │
│ 🌍 ประเทศ: ไทย                     │
│ 📦 สินค้า: 电子产品                │
│ 📅 เวลา: 2026-01-15 10:30          │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ 📬 ได้รับแล้ว │ │ 👁️ รายละเอียด │  │
│ └─────────┘ └─────────┘            │
└─────────────────────────────────────┘
```

### 按钮样式

- **已收到货按钮**: 绿色渐变背景，白色文字，阴影效果
- **详情按钮**: 灰色边框，灰色文字

## 测试验证

### 测试场景1: 已发货订单显示

**步骤**:
1. 访问订单列表
2. 找到状态为6(已发货)的订单

**预期结果**:
- 不显示"取消订单"按钮
- 显示绿色"已收到货"按钮
- 显示"详情"按钮

### 测试场景2: 确认收货操作

**步骤**:
1. 点击"已收到货"按钮
2. 等待API响应

**预期结果**:
- 显示加载提示"กำลังดำเนินการ..."
- 成功后显示"ยืนยันการรับสินค้าสำเร็จ"
- 订单状态变为8(已完成)
- 订单列表自动刷新

### 测试场景3: 已完成订单显示

**步骤**:
1. 查看状态为8(已完成)的订单

**预期结果**:
- 不显示任何操作按钮(支付、取消、确认收货)
- 只显示"详情"按钮
- 状态显示"เสร็จสิ้น"(已完成)

### 测试场景4: 其他状态订单

**步骤**:
1. 查看状态 < 6 的订单

**预期结果**:
- 显示"取消订单"按钮
- 不显示"已收到货"按钮
- 状态2且未支付显示"支付"按钮

## 错误处理

### 前端错误处理

1. **网络错误**: 显示"เกิดข้อผิดพลาดในการเชื่อมต่อ"
2. **API错误**: 显示后端返回的错误消息
3. **加载状态**: 显示加载提示，防止重复点击

### 后端错误处理

1. **订单不存在**: 返回"包裹数据错误"
2. **状态错误**: 返回"包裹状态错误"(非状态6)
3. **更新失败**: 返回"签收失败"

## 相关文件

| 文件 | 修改内容 |
|------|----------|
| `src/components/Order/EnhancedOrderListCard.jsx` | 添加确认收货按钮、修改按钮显示逻辑 |
| `src/pages/Order/Index.jsx` | 添加确认收货处理函数 |
| `Lineminiapp/source/application/api/controller/Package.php` | 修改签收API状态更新逻辑 |

## 泰语翻译

| 中文 | 泰语 | 用途 |
|------|------|------|
| 已收到货 | ได้รับแล้ว | 确认收货按钮 |
| 确认收货成功 | ยืนยันการรับสินค้าสำเร็จ | 成功提示 |
| 正在处理 | กำลังดำเนินการ... | 加载提示 |

## 注意事项

1. **状态7跳过**: 用户操作从状态6直接到状态8，跳过状态7
2. **不可逆操作**: 确认收货后订单变为已完成，不能撤销
3. **按钮互斥**: 已发货状态不显示取消按钮，只显示确认收货按钮
4. **状态验证**: 后端验证订单必须是状态6才能确认收货

## 修复状态
✅ 已完成并测试

## 相关文档
- `ORDER_FRONTEND_STATUS_AND_TRANSFER_FIX.md` - 订单状态和转单信息修复
- `ORDER_STATUS_QUICK_REFERENCE.md` - 订单状态快速参考
- `ORDER_STATUS_ANALYSIS.md` - 订单状态分析
