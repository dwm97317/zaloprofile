# 订单列表 - 已发货订单承运商和国际单号重点显示

## 功能概述

在订单列表页面（`/order/index`），为已发货的订单（status = 6）添加了承运商和国际单号的重点显示区域。

---

## 实现效果

### 视觉设计

**已发货订单卡片新增区域**：
- 📍 位置：订单号下方，详情信息上方
- 🎨 样式：渐变背景（青绿色）+ 边框高亮
- 📦 内容：承运商名称 + 国际单号
- 🔘 功能：一键复制国际单号

### 显示条件

只有同时满足以下条件才显示：
1. ✅ 订单状态 = 6（已发货）
2. ✅ 存在国际单号（`t_order_sn` 不为空）

---

## 技术实现

### 修改文件

**文件**: `src/components/Order/EnhancedOrderListCard.jsx`

### 新增区域代码

```jsx
{/* Shipping Info - Highlighted for shipped orders */}
{item.status === 6 && item.t_order_sn && (
  <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
    {/* 承运商信息 */}
    <div className="flex items-start gap-2 mb-2">
      <span className="text-xl">🚚</span>
      <div className="flex-1">
        <div className="text-xs text-teal-600 font-medium mb-1">
          ขนส่ง (承运商)
        </div>
        <div className="font-bold text-gray-900 text-sm">
          {item.t_name || "ไม่ระบุ"}
        </div>
      </div>
    </div>
    
    {/* 国际单号 */}
    <div className="flex items-start gap-2">
      <span className="text-xl">📮</span>
      <div className="flex-1">
        <div className="text-xs text-teal-600 font-medium mb-1">
          หมายเลขติดตาม (国际单号)
        </div>
        <div className="font-mono font-bold text-gray-900 text-sm break-all">
          {item.t_order_sn}
        </div>
      </div>
      {/* 复制按钮 */}
      <button onClick={handleCopyTracking}>
        <svg>...</svg>
      </button>
    </div>
  </div>
)}
```

---

## 数据字段

### 后端 API 字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `status` | int | 订单状态 | 6 = 已发货 |
| `t_name` | string | 承运商名称 | "EMS", "DHL", "FedEx" |
| `t_order_sn` | string | 国际单号 | "EV123456789TH" |

### 前端显示逻辑

```javascript
// 只有已发货且有国际单号才显示
const shouldShowShippingInfo = item.status === 6 && item.t_order_sn;
```

---

## UI 规范

### 颜色方案

| 元素 | 颜色 | 说明 |
|------|------|------|
| 背景渐变 | `from-teal-50 to-cyan-50` | 青绿色渐变 |
| 边框 | `border-teal-200` | 青绿色边框 |
| 标签文字 | `text-teal-600` | 青绿色文字 |
| 内容文字 | `text-gray-900` | 深灰色（高对比度） |

### 图标

- 🚚 承运商
- 📮 国际单号
- 📋 复制按钮

### 字体

- **承运商名称**: `font-bold text-sm`
- **国际单号**: `font-mono font-bold text-sm` (等宽字体)

---

## 功能特性

### 1. 一键复制国际单号

**实现**:
- 点击复制按钮
- 自动复制国际单号到剪贴板
- 显示成功提示

**兼容性**:
- 优先使用 `navigator.clipboard.writeText()`
- 降级到 `document.execCommand('copy')`

### 2. 响应式设计

- 📱 移动端优化
- 🔤 长单号自动换行（`break-all`）
- 👆 触摸友好的按钮大小

### 3. 视觉反馈

- ✨ 渐变背景吸引注意
- 🎯 边框高亮突出重要性
- 🔘 按钮悬停效果

---

## 多语言支持

### 泰语（默认）

| 键 | 泰语 | 中文 |
|---|------|------|
| `order.labels.carrier` | ขนส่ง | 承运商 |
| `order.labels.tracking_number` | หมายเลขติดตาม | 国际单号 |
| `common.copy_success` | คัดลอกแล้ว | 复制成功 |
| `common.copy_failed` | คัดลอกล้มเหลว | 复制失败 |

---

## 测试场景

### 测试 1: 已发货订单显示

**前提条件**:
- 订单状态 = 6（已发货）
- 存在国际单号

**期望结果**:
- ✅ 显示承运商和国际单号区域
- ✅ 渐变背景和边框高亮
- ✅ 复制按钮可用

### 测试 2: 其他状态订单不显示

**前提条件**:
- 订单状态 ≠ 6

**期望结果**:
- ✅ 不显示承运商和国际单号区域
- ✅ 正常显示其他信息

### 测试 3: 无国际单号不显示

**前提条件**:
- 订单状态 = 6
- 国际单号为空

**期望结果**:
- ✅ 不显示承运商和国际单号区域

### 测试 4: 复制功能

**操作**:
1. 点击复制按钮
2. 粘贴到其他地方

**期望结果**:
- ✅ 成功复制国际单号
- ✅ 显示成功提示

---

## 示例数据

### API 响应示例

```json
{
  "id": 69407,
  "order_sn": "ORD20260115001",
  "status": 6,
  "is_pay": 1,
  "t_name": "EMS",
  "t_order_sn": "EV123456789TH",
  "country": {
    "title": "ไทย"
  },
  "class_name": "เสื้อผ้า",
  "created_time": "2026-01-15 10:30:00",
  "storage": {
    "shop_name": "คลังกรุงเทพ"
  }
}
```

### 显示效果

```
┌─────────────────────────────────────┐
│ 🚚 จัดส่งแล้ว        คลังกรุงเทพ   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [进度条: 100%]                       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 📋 ORD20260115001            [复制] │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🚚 ขนส่ง                            │
│    EMS                              │
│                                     │
│ 📮 หมายเลขติดตาม            [复制] │
│    EV123456789TH                    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🌍 ประเทศ:              ไทย        │
│ 📦 สินค้า:              เสื้อผ้า   │
│ 📅 เวลา:    2026-01-15 10:30:00    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [👁️ รายละเอียด]                    │
└─────────────────────────────────────┘
```

---

## 相关文件

### 前端组件
- `src/components/Order/EnhancedOrderListCard.jsx` - 订单卡片组件
- `src/pages/Order/Index.jsx` - 订单列表页面

### 样式
- Tailwind CSS 类
- 渐变背景和边框

### 工具
- `utils/toast.js` - 提示消息

---

## 后续优化建议

### 1. 物流追踪链接

添加点击国际单号跳转到物流追踪页面：

```jsx
<a 
  href={`https://track.example.com/${item.t_order_sn}`}
  target="_blank"
  className="text-blue-600 underline"
>
  {item.t_order_sn}
</a>
```

### 2. 承运商图标

根据承运商显示对应的 Logo：

```jsx
const carrierLogos = {
  'EMS': '/images/carriers/ems.png',
  'DHL': '/images/carriers/dhl.png',
  'FedEx': '/images/carriers/fedex.png'
};
```

### 3. 预计送达时间

如果后端提供预计送达时间，可以显示：

```jsx
<InfoRow 
  icon="⏰" 
  label="预计送达"
  value={item.estimated_delivery || '-'}
/>
```

---

## 总结

✅ **已完成**:
1. 为已发货订单添加承运商和国际单号重点显示
2. 渐变背景和边框高亮
3. 一键复制国际单号功能
4. 响应式设计和多语言支持

✅ **显示条件**:
- 订单状态 = 6（已发货）
- 存在国际单号

✅ **用户体验**:
- 视觉突出，易于识别
- 快速复制，方便追踪
- 移动端友好

---

**创建时间**: 2026-01-15  
**修改文件**: `src/components/Order/EnhancedOrderListCard.jsx`  
**状态**: ✅ 已完成
