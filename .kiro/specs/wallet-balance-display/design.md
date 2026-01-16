# 钱包余额显示功能 - 设计文档

## 文档信息

| 项目 | 信息 |
|------|------|
| 文档版本 | 1.0 |
| 创建日期 | 2026-01-16 |
| 状态 | 设计中 |
| 设计师 | Kiro AI |

## 1. 设计概述

### 1.1 设计目标

- 保持与现有页面一致的视觉风格
- 提供清晰的余额信息展示
- 简化充值和查询流程
- 优化移动端用户体验

### 1.2 设计原则

1. **一致性**: 遵循现有的设计系统（蓝色主题、圆角卡片、渐变背景）
2. **清晰性**: 金额信息清晰可读，层级分明
3. **易用性**: 减少操作步骤，提供快捷入口
4. **反馈性**: 及时的加载状态和错误提示

### 1.3 技术栈

- **UI框架**: React 18
- **样式**: Tailwind CSS
- **图标**: Heroicons (内联SVG)
- **动画**: CSS Transitions
- **国际化**: react-i18next

## 2. 视觉设计规范

### 2.1 颜色系统

```javascript
// 主色调
const colors = {
  primary: {
    blue: '#3B82F6',      // 蓝色主色
    blueLight: '#60A5FA', // 浅蓝
    blueDark: '#2563EB',  // 深蓝
  },
  status: {
    success: '#10B981',   // 绿色 - 充值/增加
    danger: '#EF4444',    // 红色 - 消费/减少
    warning: '#F59E0B',   // 黄色 - 待审核
    info: '#3B82F6',      // 蓝色 - 信息
  },
  neutral: {
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray400: '#9CA3AF',
    gray600: '#4B5563',
    gray800: '#1F2937',
  }
};
```

### 2.2 字体规范

```javascript
const typography = {
  // 金额显示
  amount: {
    large: 'text-4xl font-bold',      // 主余额
    medium: 'text-2xl font-semibold', // 累计数据
    small: 'text-xl font-medium',     // 列表金额
  },
  // 标题
  heading: {
    h1: 'text-xl font-bold',
    h2: 'text-lg font-bold',
    h3: 'text-base font-semibold',
  },
  // 正文
  body: {
    large: 'text-base',
    medium: 'text-sm',
    small: 'text-xs',
  }
};
```

### 2.3 间距系统

```javascript
const spacing = {
  page: 'px-4',           // 页面左右边距
  card: 'p-6',            // 卡片内边距
  section: 'mt-6',        // 区块间距
  item: 'gap-4',          // 列表项间距
};
```

### 2.4 圆角规范

```javascript
const borderRadius = {
  card: 'rounded-2xl',    // 卡片
  button: 'rounded-xl',   // 按钮
  badge: 'rounded-lg',    // 徽章
  full: 'rounded-full',   // 圆形
};
```

## 3. 组件设计

### 3.1 BalanceCard 组件 (余额卡片)

**用途**: 在"我的"页面和余额页面显示余额信息

**Props**:
```typescript
interface BalanceCardProps {
  balance: number;          // 当前余额
  totalRecharge?: number;   // 累计充值
  totalExpense?: number;    // 累计消费
  showDetails?: boolean;    // 是否显示累计数据
  onRecharge?: () => void;  // 充值按钮回调
}
```


**视觉设计**:
```jsx
<div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
  {/* 余额显示 */}
  <div className="mb-4">
    <div className="text-blue-100 text-sm mb-1">总资产(฿)</div>
    <div className="text-4xl font-bold">{balance.toFixed(2)}</div>
  </div>
  
  {/* 充值按钮 */}
  <button className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-xl">
    充值
  </button>
  
  {/* 累计数据 (可选) */}
  {showDetails && (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <div className="text-blue-100 text-xs">累计充值(฿)</div>
        <div className="text-xl font-semibold">{totalRecharge}</div>
      </div>
      <div>
        <div className="text-blue-100 text-xs">累计消费(฿)</div>
        <div className="text-xl font-semibold">{totalExpense}</div>
      </div>
    </div>
  )}
</div>
```

---

### 3.2 BalanceLogItem 组件 (余额明细项)

**用途**: 在余额明细列表中显示单条记录

**Props**:
```typescript
interface BalanceLogItemProps {
  log: {
    log_id: number;
    money: number;
    sence_type: 1 | 2;      // 1=增加, 2=减少
    describe: string;
    create_time: string;
    balance?: number;        // 变动后余额
  };
}
```

**视觉设计**:
```jsx
<div className="bg-white p-4 border-b border-gray-100 last:border-0">
  <div className="flex justify-between items-start mb-2">
    <div className="flex-1">
      <div className="text-sm text-gray-600">{formatTime(log.create_time)}</div>
      <div className="text-base font-medium text-gray-800 mt-1">{log.describe}</div>
    </div>
    <div className={`text-lg font-bold ${log.sence_type === 1 ? 'text-green-500' : 'text-red-500'}`}>
      {log.sence_type === 1 ? '+' : '-'}{log.money.toFixed(2)}฿
    </div>
  </div>
  {log.balance !== undefined && (
    <div className="text-xs text-gray-400">
      余额: {log.balance.toFixed(2)}฿
    </div>
  )}
</div>
```

---

### 3.3 TabBar 组件 (标签切换)

**用途**: 在余额明细页面切换不同类型

**Props**:
```typescript
interface TabBarProps {
  tabs: Array<{
    key: string;
    label: string;
  }>;
  activeTab: string;
  onChange: (key: string) => void;
}
```

**视觉设计**:
```jsx
<div className="flex bg-gray-100 rounded-xl p-1">
  {tabs.map(tab => (
    <button
      key={tab.key}
      onClick={() => onChange(tab.key)}
      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
        activeTab === tab.key
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

---

### 3.4 MenuGrid 组件 (功能入口网格)

**用途**: 显示3个功能入口（账单记录、消费记录、充值记录）

**Props**:
```typescript
interface MenuGridProps {
  items: Array<{
    icon: React.ComponentType;
    label: string;
    color: string;
    onClick: () => void;
  }>;
}
```

**视觉设计**:
```jsx
<div className="grid grid-cols-3 gap-4">
  {items.map((item, index) => {
    const Icon = item.icon;
    return (
      <div
        key={index}
        onClick={item.onClick}
        className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm 
                   cursor-pointer active:scale-95 transition-transform"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
                        flex items-center justify-center ${item.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm text-gray-700 text-center">{item.label}</span>
      </div>
    );
  })}
</div>
```

---

### 3.5 CertificateStatusBadge 组件 (凭证状态徽章)

**用途**: 显示转账凭证审核状态

**Props**:
```typescript
interface CertificateStatusBadgeProps {
  status: 0 | 1 | 2;  // 0=待审核, 1=已通过, 2=已拒绝
}
```

**视觉设计**:
```jsx
const statusConfig = {
  0: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  1: { label: '已通过', color: 'bg-green-100 text-green-700', icon: '✅' },
  2: { label: '已拒绝', color: 'bg-red-100 text-red-700', icon: '❌' },
};

const config = statusConfig[status];

<span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
  <span>{config.icon}</span>
  <span>{config.label}</span>
</span>
```

## 4. 页面设计

### 4.1 Mine/Index.jsx (我的页面) - 修改

**改动点**:
1. 修复余额显示（移除硬编码）
2. 币种改为泰铢 (฿)

**修改前**:
```jsx
<div className="text-2xl font-bold">200.00</div>
<div className="text-xs text-gray-500">VNĐ</div>
```

**修改后**:
```jsx
<div className="text-2xl font-bold">{assets.balance?.toFixed(2) || '0.00'}</div>
<div className="text-xs text-gray-500">฿</div>
```

**完整代码片段**:
```jsx
{/* Assets Card */}
{userInfo.isLogin && (
  <div className="mx-4 -mt-10 bg-white rounded-2xl shadow-lg p-6 grid grid-cols-4 gap-2 relative z-10">
    {[
      { 
        label: t("mine.balance"), 
        val: assets.balance?.toFixed(2) || '0.00',  // ✅ 使用真实余额
        unit: '฿',                                    // ✅ 改为泰铢
        route: "/mine/balance" 
      },
      { label: t("mine.sms"), val: assets.sms, route: "/common/sms" },
      { label: t("mine.coupon"), val: assets.coupon, route: "/common/coupon" },
      { label: t("mine.points"), val: assets.points, route: "" },
    ].map((item, i) => (
      <div key={i} className="flex flex-col items-center cursor-pointer" 
           onClick={() => item.route && navigate(item.route)}>
        <span className="text-lg font-bold text-gray-800">{item.val}</span>
        {item.unit && <span className="text-xs text-gray-500">{item.unit}</span>}
        <span className="text-xs text-gray-500 mt-1 text-center">{item.label}</span>
      </div>
    ))}
  </div>
)}
```

---

### 4.2 Mine/Balance.jsx (余额页面) - 重构

**设计目标**: 按照参考截图重新设计，显示累计数据和3个功能入口

**布局结构**:
```
┌─────────────────────────────────┐
│  ← 我的账户                      │
├─────────────────────────────────┤
│  [蓝色渐变卡片]                  │
│  总资产(฿)           [充值]     │
│  0.00                           │
│                                 │
│  累计充值(฿)    累计消费(฿)     │
│  0              100             │
└─────────────────────────────────┘
│                                 │
│  [3个功能入口]                   │
│  📋 账单记录                     │
│  📄 消费记录                     │
│  💰 充值记录                     │
└─────────────────────────────────┘
```

**完整代码**:
```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";

// 图标组件
const BillIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ExpenseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const RechargeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BalancePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    totalRecharge: 0,
    totalExpense: 0,
  });

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    setLoading(true);
    try {
      const res = await request.post("user/detail&wxapp_id=10001");
      if (res.code === 1 && res.data && res.data.userInfo) {
        const u = res.data.userInfo;
        setBalanceData({
          balance: parseFloat(u.balance) || 0,
          totalRecharge: parseFloat(u.recharge_money) || 0,  // 需要后端提供
          totalExpense: parseFloat(u.pay_money) || parseFloat(u.expend_money) || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: BillIcon,
      label: t("mine.wallet.bill_records", "账单记录"),
      color: "text-blue-500",
      onClick: () => navigate("/mine/balance/log?tab=all"),
    },
    {
      icon: ExpenseIcon,
      label: t("mine.wallet.expense_records", "消费记录"),
      color: "text-red-500",
      onClick: () => navigate("/mine/balance/log?tab=payment"),
    },
    {
      icon: RechargeIcon,
      label: t("mine.wallet.recharge_records", "充值记录"),
      color: "text-green-500",
      onClick: () => navigate("/mine/balance/log?tab=recharge"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">
          {t("mine.wallet.title", "我的账户")}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          {/* 余额和充值按钮 */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-blue-100 text-sm mb-1">
                {t("mine.wallet.total_assets", "总资产")}(฿)
              </div>
              <div className="text-4xl font-bold">
                {balanceData.balance.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => navigate("/mine/recharge")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2 rounded-xl 
                         text-sm font-bold transition-all border border-white/30"
            >
              {t("mine.wallet.top_up", "充值")}
            </button>
          </div>

          {/* 累计数据 */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <div className="text-blue-100 text-xs mb-1">
                {t("mine.wallet.total_recharge", "累计充值")}(฿)
              </div>
              <div className="text-xl font-semibold">
                {balanceData.totalRecharge.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-blue-100 text-xs mb-1">
                {t("mine.wallet.total_expense", "累计消费")}(฿)
              </div>
              <div className="text-xl font-semibold">
                {balanceData.totalExpense.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-3 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={item.onClick}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm 
                           cursor-pointer active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
                                flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-gray-700 text-center font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default BalancePage;
```

---

### 4.3 Mine/BalanceLog.jsx (余额明细页面) - 新建

**设计目标**: 显示余额变动记录，支持Tab切换

**布局结构**:
```
┌─────────────────────────────────┐
│  ← 余额明细                      │
├─────────────────────────────────┤
│  [全部] [充值] [消费]           │
├─────────────────────────────────┤
│  2026-01-16 14:30              │
│  订单支付                       │
│  -50.00฿        余额: 150.00฿  │
├─────────────────────────────────┤
│  2026-01-15 10:20              │
│  在线充值                       │
│  +200.00฿       余额: 200.00฿  │
└─────────────────────────────────┘
```


**完整代码**:
```jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";

const BalanceLogPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { key: 'all', label: t("mine.wallet.all", "全部") },
    { key: 'recharge', label: t("mine.wallet.recharge", "充值") },
    { key: 'payment', label: t("mine.wallet.payment", "消费") },
  ];

  useEffect(() => {
    fetchLogs(activeTab, 1);
  }, [activeTab]);

  const fetchLogs = async (type, pageNum) => {
    setLoading(true);
    try {
      const res = await request.get(`user/balance/log`, {
        type,
        page: pageNum,
        limit: 20,
      });
      
      if (res.code === 1 && res.data) {
        const newLogs = res.data.list || [];
        setLogs(pageNum === 1 ? newLogs : [...logs, ...newLogs]);
        setHasMore(newLogs.length === 20);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setLogs([]);
    setPage(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLogs(activeTab, page + 1);
    }
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold ml-2 text-gray-800">
            {t("mine.wallet.balance_log", "余额明细")}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mt-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log List */}
      <div className="mt-2">
        {logs.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">{t("mine.wallet.no_records", "暂无记录")}</p>
          </div>
        ) : (
          <div className="bg-white">
            {logs.map((log, index) => (
              <div key={`${log.log_id}-${index}`} 
                   className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      {formatTime(log.create_time)}
                    </div>
                    <div className="text-base font-medium text-gray-800 mt-1">
                      {log.describe}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ml-4 ${
                    log.sence_type === 1 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {log.sence_type === 1 ? '+' : '-'}{parseFloat(log.money).toFixed(2)}฿
                  </div>
                </div>
                {log.balance !== undefined && (
                  <div className="text-xs text-gray-400">
                    {t("mine.wallet.balance", "余额")}: {parseFloat(log.balance).toFixed(2)}฿
                  </div>
                )}
              </div>
            ))}

            {/* Load More */}
            {hasMore && !loading && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  className="text-blue-500 text-sm font-medium"
                >
                  {t("common.load_more", "加载更多")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default BalanceLogPage;
```

---

### 4.4 Mine/RechargeCertificates.jsx (转账记录页面) - 新建

**设计目标**: 显示转账凭证列表和审核状态

**布局结构**:
```
┌─────────────────────────────────┐
│  ← 转账记录                      │
├─────────────────────────────────┤
│  2026-01-16 14:30              │
│  金额: 500.00฿                 │
│  状态: 待审核 🟡                │
│  [查看详情]                     │
├─────────────────────────────────┤
│  2026-01-15 10:20              │
│  金额: 200.00฿                 │
│  状态: 已通过 ✅                │
│  [查看详情]                     │
└─────────────────────────────────┘
```

**完整代码**:
```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import request from "../../utils/request";
import Loading from "../../components/Loading/Index";

const RechargeCertificatesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      // 注意: 这个API需要后端开发
      const res = await request.get("recharge/certificates");
      if (res.code === 1 && res.data) {
        setCertificates(res.data.list || []);
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      0: { 
        label: t("mine.wallet.status.pending", "待审核"), 
        color: 'bg-yellow-100 text-yellow-700', 
        icon: '🟡' 
      },
      1: { 
        label: t("mine.wallet.status.approved", "已通过"), 
        color: 'bg-green-100 text-green-700', 
        icon: '✅' 
      },
      2: { 
        label: t("mine.wallet.status.rejected", "已拒绝"), 
        color: 'bg-red-100 text-red-700', 
        icon: '❌' 
      },
    };
    return configs[status] || configs[0];
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-800">
          {t("mine.wallet.transfer_records", "转账记录")}
        </h1>
      </div>

      {/* Certificate List */}
      <div className="p-4 space-y-3">
        {certificates.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">{t("mine.wallet.no_certificates", "暂无转账记录")}</p>
          </div>
        ) : (
          certificates.map((cert) => {
            const statusConfig = getStatusConfig(cert.status);
            return (
              <div key={cert.cert_id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {formatTime(cert.create_time)}
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {parseFloat(cert.amount).toFixed(2)}฿
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    <span>{statusConfig.icon}</span>
                    <span>{statusConfig.label}</span>
                  </span>
                </div>

                {cert.status === 2 && cert.reject_reason && (
                  <div className="bg-red-50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-red-600 mb-1">
                      {t("mine.wallet.reject_reason", "拒绝原因")}:
                    </div>
                    <div className="text-sm text-red-700">{cert.reject_reason}</div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/mine/recharge/certificate/${cert.cert_id}`)}
                  className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  {t("mine.wallet.view_details", "查看详情")}
                </button>
              </div>
            );
          })
        )}
      </div>

      <Loading is={loading} />
    </div>
  );
};

export default RechargeCertificatesPage;
```

## 5. 路由配置

在 `src/router/index.jsx` 中添加新路由：

```jsx
// 余额相关路由
{
  path: "/mine/balance",
  element: <Balance />,
},
{
  path: "/mine/balance/log",
  element: <BalanceLog />,
},
{
  path: "/mine/recharge/certificates",
  element: <RechargeCertificates />,
},
{
  path: "/mine/recharge/certificate/:id",
  element: <CertificateDetail />,
},
```

## 6. 国际化配置

在 `src/locales/th.json` 中添加翻译：

```json
{
  "mine": {
    "wallet": {
      "title": "บัญชีของฉัน",
      "total_assets": "สินทรัพย์ทั้งหมด",
      "total_recharge": "เติมเงินสะสม",
      "total_expense": "ใช้จ่ายสะสม",
      "top_up": "เติมเงิน",
      "bill_records": "บันทึกบิล",
      "expense_records": "บันทึกค่าใช้จ่าย",
      "recharge_records": "บันทึกการเติมเงิน",
      "balance_log": "รายละเอียดยอดเงิน",
      "transfer_records": "บันทึกการโอนเงิน",
      "all": "ทั้งหมด",
      "recharge": "เติมเงิน",
      "payment": "ชำระเงิน",
      "balance": "ยอดเงิน",
      "no_records": "ไม่มีบันทึก",
      "no_certificates": "ไม่มีบันทึกการโอนเงิน",
      "view_details": "ดูรายละเอียด",
      "reject_reason": "เหตุผลที่ปฏิเสธ",
      "status": {
        "pending": "รอการตรวจสอบ",
        "approved": "อนุมัติแล้ว",
        "rejected": "ปฏิเสธ"
      }
    }
  }
}
```

## 7. API 集成

### 7.1 获取余额数据

```javascript
// 在 Mine/Balance.jsx 中
const fetchBalanceData = async () => {
  const res = await request.post("user/detail&wxapp_id=10001");
  if (res.code === 1 && res.data && res.data.userInfo) {
    const u = res.data.userInfo;
    return {
      balance: parseFloat(u.balance) || 0,
      totalRecharge: parseFloat(u.recharge_money) || 0,
      totalExpense: parseFloat(u.pay_money) || parseFloat(u.expend_money) || 0,
    };
  }
};
```

### 7.2 获取余额明细

```javascript
// 在 Mine/BalanceLog.jsx 中
const fetchLogs = async (type, page) => {
  const res = await request.get("user/balance/log", {
    type,  // 'all' | 'recharge' | 'payment'
    page,
    limit: 20,
  });
  return res.data.list;
};
```

### 7.3 获取转账凭证列表

```javascript
// 在 Mine/RechargeCertificates.jsx 中
// 注意: 这个API需要后端开发
const fetchCertificates = async () => {
  const res = await request.get("recharge/certificates");
  return res.data.list;
};
```

## 8. 性能优化

### 8.1 虚拟滚动 (可选)

对于长列表，可以使用虚拟滚动优化性能：

```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={logs.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <BalanceLogItem log={logs[index]} />
    </div>
  )}
</FixedSizeList>
```

### 8.2 数据缓存

使用 Recoil 缓存余额数据：

```javascript
// src/state/index.js
export const balanceState = atom({
  key: 'balanceState',
  default: {
    balance: 0,
    totalRecharge: 0,
    totalExpense: 0,
    lastUpdate: null,
  },
});
```

### 8.3 防抖加载

```javascript
import { debounce } from 'lodash';

const debouncedLoadMore = debounce(() => {
  loadMore();
}, 300);
```

## 9. 错误处理

### 9.1 API 错误

```javascript
try {
  const res = await request.get("user/balance/log");
  if (res.code !== 1) {
    throw new Error(res.msg || "Failed to fetch data");
  }
} catch (err) {
  console.error(err);
  // 显示错误提示
  Toast.show({
    content: t("common.error.network"),
    icon: 'fail',
  });
}
```

### 9.2 空状态

```jsx
{logs.length === 0 && !loading && (
  <div className="flex flex-col items-center justify-center py-20">
    <EmptyIcon />
    <p className="text-gray-400 text-sm mt-4">
      {t("mine.wallet.no_records")}
    </p>
  </div>
)}
```

## 10. 测试计划

### 10.1 单元测试

```javascript
describe('BalanceCard', () => {
  it('should display balance correctly', () => {
    render(<BalanceCard balance={200.50} />);
    expect(screen.getByText('200.50')).toBeInTheDocument();
  });

  it('should format currency with 2 decimals', () => {
    render(<BalanceCard balance={100} />);
    expect(screen.getByText('100.00')).toBeInTheDocument();
  });
});
```

### 10.2 集成测试

- 测试余额数据获取
- 测试Tab切换功能
- 测试列表加载和分页
- 测试路由跳转

### 10.3 E2E 测试

- 用户登录后查看余额
- 切换不同Tab查看记录
- 点击充值按钮跳转
- 查看转账凭证状态

## 11. 设计检查清单

- [ ] 所有页面遵循现有设计风格
- [ ] 使用泰铢 (฿) 作为币种
- [ ] 金额保留2位小数
- [ ] 充值显示绿色，消费显示红色
- [ ] 所有文本支持泰语翻译
- [ ] 移动端适配正常
- [ ] 加载状态显示
- [ ] 错误处理完善
- [ ] 空状态友好提示
- [ ] 路由配置正确

---

**设计完成时间**: 2026-01-16  
**下一步**: 创建任务分解文档 (tasks.md)
