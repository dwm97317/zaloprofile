# 钱包余额功能 - 快速参考

## 🎯 一句话总结

将前端"我的"页面的硬编码余额 `200.00` 改为从API获取的真实数据，并添加余额明细查询功能。

## 📱 页面清单

| 页面 | 路由 | 状态 | 优先级 |
|------|------|------|--------|
| 我的页面 | `/mine` | ⚠️ 需修复 | 🔴 高 |
| 余额页面 | `/mine/balance` | ⚠️ 需重构 | 🔴 高 |
| 余额明细 | `/mine/balance/log` | ❌ 需创建 | 🔴 高 |
| 充值页面 | `/mine/recharge` | ✅ 已有 | 🟡 中 |
| 转账记录 | `/mine/recharge/certificates` | ❌ 需创建 | 🟡 中 |

## 🔧 需要修改的代码

### 1. Mine/Index.jsx (我的页面)
**位置**: `src/pages/Mine/Index.jsx:217`

**当前代码**:
```jsx
<div className="text-2xl font-bold">200.00</div>
<div className="text-xs text-gray-500">VNĐ</div>
```

**修改为**:
```jsx
<div className="text-2xl font-bold">{userAssets?.balance?.toFixed(2) || '0.00'}</div>
<div className="text-xs text-gray-500">฿</div>
```

**改动点**:
- ❌ 移除硬编码 `200.00`
- ✅ 使用 `userAssets.balance`
- ✅ 币种从 VNĐ 改为 ฿ (泰铢)

---

### 2. Mine/Balance.jsx (余额页面)
**位置**: `src/pages/Mine/Balance.jsx:48`

**需要重构**:
- ❌ 移除硬编码余额
- ✅ 添加累计充值显示
- ✅ 添加累计消费显示
- ✅ 重新设计为3入口布局
- ✅ 移除旧的菜单项

**新布局**:
```jsx
{/* 蓝色卡片 */}
<div className="bg-gradient-to-r from-blue-500 to-blue-600">
  <div>总资产(฿)</div>
  <div>{balance}</div>
  <button>充值</button>
  <div>累计充值: {totalRecharge}฿</div>
  <div>累计消费: {totalExpense}฿</div>
</div>

{/* 3个入口 */}
<div className="grid grid-cols-3 gap-4">
  <div onClick={() => navigate('/mine/balance/log?tab=all')}>
    <Icon name="bill" />
    <span>账单记录</span>
  </div>
  <div onClick={() => navigate('/mine/balance/log?tab=payment')}>
    <Icon name="expense" />
    <span>消费记录</span>
  </div>
  <div onClick={() => navigate('/mine/balance/log?tab=recharge')}>
    <Icon name="recharge" />
    <span>充值记录</span>
  </div>
</div>
```

---

### 3. Mine/BalanceLog.jsx (余额明细 - 新建)
**位置**: `src/pages/Mine/BalanceLog.jsx` (需创建)

**核心功能**:
```jsx
const [activeTab, setActiveTab] = useState('all'); // all | recharge | payment
const [logs, setLogs] = useState([]);

useEffect(() => {
  fetchBalanceLogs(activeTab);
}, [activeTab]);

const fetchBalanceLogs = async (type) => {
  const res = await request.get('/user/balance/log', { type });
  setLogs(res.data.list);
};
```

**Tab切换**:
```jsx
<Tabs value={activeTab} onChange={setActiveTab}>
  <Tab value="all">全部</Tab>
  <Tab value="recharge">充值</Tab>
  <Tab value="payment">消费</Tab>
</Tabs>
```

**列表项**:
```jsx
{logs.map(log => (
  <div key={log.log_id}>
    <div>{log.create_time}</div>
    <div>{log.describe}</div>
    <div className={log.sence_type === 1 ? 'text-green-500' : 'text-red-500'}>
      {log.sence_type === 1 ? '+' : '-'}{log.money}฿
    </div>
    <div>余额: {log.balance}฿</div>
  </div>
))}
```

## 🌐 API 接口

### 1. 获取用户信息
```
GET /api/user/detail
```
**返回**:
```json
{
  "balance": 200.00,
  "pay_money": 500.00,
  "expend_money": 300.00
}
```

### 2. 获取余额明细
```
GET /api/user/balance/log?type=all&page=1&limit=20
```
**参数**:
- `type`: `all` | `recharge` | `payment`

**返回**:
```json
{
  "list": [
    {
      "log_id": 1,
      "money": 200.00,
      "sence_type": 1,
      "describe": "在线充值",
      "create_time": "2026-01-16 14:30:00"
    }
  ]
}
```

### 3. 提交转账凭证
```
POST /api/recharge/apply
```
**请求**:
```json
{
  "dates": "2026-01-16",
  "times": "14:30",
  "amount": 500.00,
  "imageIds": ["base64_image_1"]
}
```

## 🎨 样式规范

### 颜色
- 主色调: `bg-blue-500` (蓝色)
- 充值/增加: `text-green-500` (绿色)
- 消费/减少: `text-red-500` (红色)
- 待审核: `text-yellow-500` (黄色)

### 圆角
- 卡片: `rounded-2xl`
- 按钮: `rounded-lg`

### 字体
- 标题: `text-2xl font-bold`
- 金额: `text-xl font-semibold`
- 描述: `text-sm text-gray-500`

## 📊 数据映射

### 余额变动类型
```javascript
const SENCE_TYPE = {
  ADD: 1,      // 增加（充值）
  REMOVE: 2    // 减少（消费）
};
```

### 转账凭证状态
```javascript
const CERT_STATUS = {
  PENDING: 0,   // 待审核 🟡
  APPROVED: 1,  // 已通过 ✅
  REJECTED: 2   // 已拒绝 ❌
};
```

### 币种
```javascript
const CURRENCY = {
  CNY: { code: 1, symbol: '¥' },
  THB: { code: 2, symbol: '฿' },  // 本项目使用
  VND: { code: 3, symbol: '₫' }
};
```

## ✅ 检查清单

### Phase 1: 核心功能
- [ ] Mine/Index.jsx - 修复余额显示
- [ ] Mine/Index.jsx - 币种改为 ฿
- [ ] Mine/Balance.jsx - 重构页面布局
- [ ] Mine/Balance.jsx - 添加累计数据
- [ ] Mine/BalanceLog.jsx - 创建新页面
- [ ] Mine/BalanceLog.jsx - 实现Tab切换
- [ ] Mine/BalanceLog.jsx - 实现列表显示

### Phase 2: 充值功能
- [ ] 集成在线支付
- [ ] 集成银行转账
- [ ] 上传转账截图
- [ ] 显示凭证状态

### Phase 3: 测试
- [ ] 余额显示正确
- [ ] Tab切换正常
- [ ] 列表加载正常
- [ ] 充值流程正常
- [ ] 移动端适配正常

## 🐛 已知问题

| 问题 | 位置 | 影响 |
|------|------|------|
| 余额硬编码 | Mine/Index.jsx:217 | 🔴 高 |
| 余额硬编码 | Mine/Balance.jsx:48 | 🔴 高 |
| 菜单路由未实现 | Mine/Balance.jsx:14-27 | 🟡 中 |
| 方法名拼写错误 | User.php:banlanceUpdate | 🟢 低 |

## 📞 快速命令

### 启动开发服务器
```bash
cd zalo_mini_app-master
npm run dev
```

### 查看后端日志
```bash
tail -f Lineminiapp/runtime/log/*.log
```

### 测试API
```bash
curl http://localhost/api/user/detail
curl http://localhost/api/user/balance/log?type=all
```

## 🔗 相关链接

- [完整需求文档](./requirements.md)
- [逆向工程报告](./reverse.md)
- [项目概览](./README.md)

---

**提示**: 这是快速参考文档，详细信息请查看 `requirements.md`
