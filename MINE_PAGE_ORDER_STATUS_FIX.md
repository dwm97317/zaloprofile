# Mine页面订单状态映射修复

## 修复日期
2026-01-15

## 问题描述

Mine页面（个人主页）的"我的订单"部分有以下问题：
1. key拼写不一致：`"no-recived"` vs `"no-recive"`
2. "待收货"应该对应已发货的订单（status=6），而不是其他状态
3. **"查看全部"链接跳转到Order页面后，显示的是"待查验"tab而不是"全部"tab**

## 修复内容

### 1. 统一key命名 ✅

**文件**: `src/pages/Mine/Index.jsx`

**修复前**:
```javascript
const map = {
  "no-check": 1,
  "no-pay": 2,
  "no-send": 3,
  "no-recive": 4,  // 拼写错误
  "complete": 5
};

// 图标数组中使用的key
{ key: "no-recived" }  // 拼写不一致
```

**修复后**:
```javascript
const map = {
  "all": 0,           // 全部 (新增)
  "no-check": 1,      // 待查验
  "no-pay": 2,        // 待支付
  "no-send": 3,       // 待发货
  "no-receive": 4,    // 待收货 -> 对应已发货状态(6)
  "complete": 5       // 已完成
};

// 图标数组中使用的key
{ key: "no-receive" }  // 统一命名
```

### 2. 修复"查看全部"链接 ✅

**问题**: 点击"查看全部"后跳转到Order页面，显示的是"待查验"tab而不是"全部"tab

**原因**: 
- Mine页面传入空字符串 `navigateToOrder("")`
- Order页面默认值为 `orderStatus || 1`，空字符串被判断为false，使用默认值1

**修复**:

**Mine/Index.jsx**:
```javascript
// 修复前
<span onClick={() => navigateToOrder("")}>查看全部</span>

// 修复后
<span onClick={() => navigateToOrder("all")}>查看全部</span>

// 函数修改
const navigateToOrder = (status) => {
  const map = {
    "all": 0,  // 新增
    // ...
  };
  // 明确设置状态，包括0
  setOrderStatus(status !== undefined ? map[status] : 0);
  navigate("/order/index");
};
```

**Order/Index.jsx**:
```javascript
// 修复前
const initialTab = orderStatus || 1;  // 0会被判断为false

// 修复后
const initialTab = orderStatus !== undefined ? orderStatus : 1;  // 正确处理0

// tabs数组修改
const tabs = [
  { id: 0, label: "ทั้งหมด", icon: "📋" },  // 改为数字0
  { id: 1, label: "ตรวจสอบ", icon: "⏱️" },
  // ...
];
```

### 3. 状态映射关系

Mine页面的订单状态映射到Order页面的tab索引：

| Mine页面 | Map值 | Order页面Tab | 后端API参数 | 实际订单状态 |
|---------|-------|-------------|------------|------------|
| 查看全部 | 0 | Tab 0 | "" (空) | 所有状态 |
| 待查验 | 1 | Tab 1 | verify | status=1 |
| 待支付 | 2 | Tab 2 | nopay | status=2 |
| 待发货 | 3 | Tab 3 | no_send | status=3,4,5 |
| 待收货 | 4 | Tab 4 | send | status=6,7 |
| 已完成 | 5 | Tab 5 | complete | status=8 |

### 4. Order页面Tab映射

**文件**: `src/pages/Order/Index.jsx`

```javascript
const typeMap = ["", "verify", "nopay", "no_send", "send", "complete"];
//                0    1         2        3          4       5
```

## 完整流程

### 点击"查看全部"

```
用户点击Mine页面"查看全部"
  ↓
navigateToOrder("all")
  ↓
setOrderStatus(map["all"]) = 0
  ↓
navigate("/order/index")
  ↓
Order页面: activeTab = 0
  ↓
fetchOrderList(0)
  ↓
apiTab = typeMap[0] = ""
  ↓
API: package/packagelist&type=
  ↓
返回: 所有状态的订单
```

### 点击"待收货"图标

```
用户点击Mine页面"待收货"图标
  ↓
navigateToOrder("no-receive")
  ↓
setOrderStatus(map["no-receive"]) = 4
  ↓
navigate("/order/index")
  ↓
Order页面: activeTab = 4
  ↓
fetchOrderList(4)
  ↓
apiTab = typeMap[4] = "send"
  ↓
API: package/packagelist&type=send
  ↓
返回: status=6,7 的订单（已发货、已收货）
```

## Mine页面订单图标说明

| 图标 | 文本 | Key | 对应状态 | 说明 |
|------|------|-----|---------|------|
| - | 查看全部 | all | 所有 | 显示所有订单 |
| dzx_img97.png | 待查验 | no-check | 1 | 等待仓库查验 |
| dzx_img98.png | 待支付 | no-pay | 2 | 等待用户支付 |
| dzx_img99.png | 待发货 | no-send | 3 | 已支付，等待发货 |
| dzx_img100.png | 待收货 | no-receive | 6,7 | 已发货，等待收货 |
| dzx_img101.png | 已完成 | complete | 8 | 订单完成 |

## 代码修改

### Mine/Index.jsx

```javascript
// 1. 修复map定义，添加"all"
const navigateToOrder = (status) => {
  const map = {
    "all": 0,           // 新增：全部
    "no-check": 1,
    "no-pay": 2,
    "no-send": 3,
    "no-receive": 4,    // 统一命名
    "complete": 5
  };
  // 明确设置状态，正确处理0
  setOrderStatus(status !== undefined ? map[status] : 0);
  navigate("/order/index");
};

// 2. 修复"查看全部"链接
<span onClick={() => navigateToOrder("all")}>查看全部</span>

// 3. 修复图标数组key
{ 
  icon: "https://zhuanyun.sllowly.cn/assets/api/images/dzx_img100.png", 
  txt: t("mine.status.no_receive"), 
  key: "no-receive"  // 统一命名
}
```

### Order/Index.jsx

```javascript
// 1. 修复默认值判断，正确处理0
const initialTab = orderStatus !== undefined ? orderStatus : 1;

// 2. 修复tabs数组，第一个tab的id改为数字0
const tabs = [
  { id: 0, label: t("order.tabs.all", "ทั้งหมด"), icon: "📋" },
  { id: 1, label: t("order.tabs.check", "ตรวจสอบ"), icon: "⏱️" },
  // ...
];
```

## 测试验证

### 测试场景1: 点击"查看全部"

**步骤**:
1. 访问Mine页面
2. 点击"我的订单"标题右侧的"查看全部 →"

**预期结果**:
- 跳转到Order页面
- 激活Tab 0（ทั้งหมด/全部）
- 显示所有状态的订单

### 测试场景2: 点击待收货图标

**步骤**:
1. 访问Mine页面
2. 点击"待收货"图标（dzx_img100.png）

**预期结果**:
- 跳转到Order页面
- 激活Tab 4（ส่งแล้ว/已发货）
- 显示status=6,7的订单

### 测试场景3: 验证其他图标

**步骤**:
1. 依次点击其他4个订单图标

**预期结果**:
- 待查验 → Tab 1 → status=1订单
- 待支付 → Tab 2 → status=2订单
- 待发货 → Tab 3 → status=3,4,5订单
- 已完成 → Tab 5 → status=8订单

## 相关文件

| 文件 | 修改内容 |
|------|----------|
| `src/pages/Mine/Index.jsx` | 1. 添加"all"映射<br>2. 修复key命名<br>3. 修复"查看全部"链接 |
| `src/pages/Order/Index.jsx` | 1. 修复默认值判断<br>2. 修复tabs数组id |

## 关键修复点

### 问题：JavaScript中0的判断

```javascript
// ❌ 错误：0会被判断为false
const value = orderStatus || 1;  // 当orderStatus=0时，返回1

// ✅ 正确：明确判断undefined
const value = orderStatus !== undefined ? orderStatus : 1;  // 当orderStatus=0时，返回0
```

### 问题：空字符串vs数字0

```javascript
// ❌ 错误：tabs数组使用空字符串
{ id: "", label: "全部" }  // 难以判断和比较

// ✅ 正确：使用数字0
{ id: 0, label: "全部" }  // 清晰明确
```

## 注意事项

1. **0值处理**: JavaScript中0是falsy值，需要使用 `!== undefined` 而不是 `||` 来判断
2. **命名统一**: 所有地方使用 `"no-receive"` 而不是 `"no-recive"` 或 `"no-recived"`
3. **状态对应**: "待收货"对应已发货订单（status=6,7），符合用户理解
4. **全部tab**: 索引0对应"全部"，显示所有状态的订单

## 泰语翻译

| 中文 | 泰语 | 翻译key |
|------|------|---------|
| 查看全部 | ดูทั้งหมด | mine.view_all |
| 全部 | ทั้งหมด | order.tabs.all |
| 待查验 | รอตรวจสอบ | mine.status.no_check |
| 待支付 | รอชำระเงิน | mine.status.no_pay |
| 待发货 | รอจัดส่ง | mine.status.no_send |
| 待收货 | รอรับสินค้า | mine.status.no_receive |
| 已完成 | เสร็จสิ้น | mine.status.complete |

## 修复状态
✅ 已完成

## 相关文档
- `ORDER_FRONTEND_STATUS_AND_TRANSFER_FIX.md` - 订单状态修复
- `ORDER_CONFIRM_RECEIVE_IMPLEMENTATION.md` - 确认收货功能
- `ORDER_STATUS_QUICK_REFERENCE.md` - 订单状态快速参考
