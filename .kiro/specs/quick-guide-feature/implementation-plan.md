# 急件说明功能 - 实施计划书

## 项目概述

### 功能名称
急件说明 / 操作指南 (Quick Guide Feature)

### 功能目标
在主页添加一个醒目的入口按钮，引导用户进入交互式操作指南页面，帮助新用户快速了解平台的核心使用流程。

### 预期收益
1. **降低学习成本**: 新用户可以快速了解平台使用方法
2. **提高转化率**: 引导用户完成首次包裹报告和打包申请
3. **减少客服压力**: 用户可以自助查看操作说明
4. **提升用户体验**: 提供清晰、友好的使用指导

---

## 功能设计

### 1. 主页入口设计

#### 位置选择
根据您的要求，入口按钮将放置在：
- **位置**: 导航菜单网格下方的中心位置
- **当前代码位置**: 在 `Home/Index.jsx` 中，8个主要菜单项下方，"คำนวณค่าขนส่ง" 按钮的位置附近

#### 视觉设计
```jsx
<div className="relative -top-5 flex items-center justify-center pointer-events-auto">
  <button className="group relative">
    {/* 发光效果背景 */}
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
                    rounded-full blur-xl opacity-50 group-hover:opacity-75 
                    transition-opacity animate-pulse" />
    
    {/* 主按钮 */}
    <div className="relative flex items-center gap-3 px-6 py-3 
                    bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500
                    rounded-full shadow-2xl
                    group-hover:scale-110 group-active:scale-95
                    transition-all duration-200">
      <span className="text-2xl">⚡</span>
      <span className="text-white font-bold text-base">急件说明</span>
      <span className="text-2xl">📋</span>
    </div>
    
    {/* 闪烁提示 */}
    <div className="absolute -top-1 -right-1 w-3 h-3 
                    bg-red-500 rounded-full animate-ping" />
  </button>
</div>
```

#### 特点
- ⚡ 使用醒目的黄橙红渐变色
- 📋 左右两侧使用表情符号图标
- ✨ 发光和脉冲动画效果
- 🔴 右上角红点提示（吸引注意）
- 🎯 悬停放大、点击缩小动画

---

### 2. 操作指南页面设计

#### 页面结构
```
┌─────────────────────────────────────┐
│  ← 返回    操作指南              ❓  │ ← Header
├─────────────────────────────────────┤
│                                     │
│  🎯 欢迎使用 Vhuong Tra            │ ← Hero Section
│  按照以下步骤完成您的首次发货       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📦 步骤 1: 复制仓库地址            │ ← Step 1
│  复制仓库地址并粘贴到购物平台...    │
│  [查看仓库] →                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📋 步骤 2: 报告包裹                │ ← Step 2
│  购买后，将快递单号报告到系统...    │
│  [立即报告] →                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📦 步骤 3: 申请打包                │ ← Step 3
│  包裹到达仓库后，申请打包并发货...  │
│  [申请打包] →                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💳 步骤 4: 支付运费                │ ← Step 4
│  打包完成后，支付运费，货物将被...  │
│  [查看订单] →                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  🔗 其他功能                        │ ← Quick Links
│  [计算运费] [我的包裹] [充值]      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💬 需要帮助？                      │ ← Help Section
│  联系客服: LINE @vhunter            │
│                                     │
└─────────────────────────────────────┘
```

#### 步骤卡片设计
每个步骤卡片包含：
1. **步骤编号**: 圆形徽章显示 1-4
2. **图标**: 表情符号或 SVG 图标
3. **标题**: 粗体显示步骤名称
4. **描述**: 简短说明（2-3行）
5. **操作按钮**: 渐变色按钮，带箭头图标
6. **渐变背景**: 每个步骤使用不同颜色

#### 颜色方案
- **步骤 1**: 蓝色渐变 (from-blue-400 to-blue-600)
- **步骤 2**: 绿色渐变 (from-green-400 to-green-600)
- **步骤 3**: 橙色渐变 (from-orange-400 to-orange-600)
- **步骤 4**: 紫色渐变 (from-purple-400 to-purple-600)

---

### 3. 交互流程

#### 用户路径
```
主页
  ↓ 点击"急件说明"按钮
操作指南页面
  ↓ 查看步骤1
  ├→ 点击"查看仓库" → 仓库列表页面
  ↓ 查看步骤2
  ├→ 点击"立即报告" → 包裹报告页面
  ↓ 查看步骤3
  ├→ 点击"申请打包" → 打包申请页面
  ↓ 查看步骤4
  ├→ 点击"查看订单" → 订单列表页面
  ↓ 其他功能
  ├→ 点击"计算运费" → 运费计算页面
  ├→ 点击"我的包裹" → 包裹列表页面
  └→ 点击"充值" → 充值页面
```

#### 导航逻辑
```javascript
// 步骤1 → 仓库列表
navigate('/storage/index')

// 步骤2 → 包裹报告
navigate('/package/forecast')

// 步骤3 → 打包申请
navigate('/package/pack/select')

// 步骤4 → 订单列表
setOrderStatus(2) // 待支付状态
navigate('/order/index')

// 计算运费
navigate('/freight')

// 我的包裹
navigate('/order/package')

// 充值
navigate('/mine/recharge')
```

---

## 技术实施

### 1. 文件结构

```
src/
├── pages/
│   ├── Home/
│   │   └── Index.jsx (修改：添加入口按钮)
│   └── Guide/
│       ├── QuickStart.jsx (新建：主页面)
│       ├── StepCard.jsx (新建：步骤卡片组件)
│       ├── QuickLinks.jsx (新建：快速链接组件)
│       └── QuickStart.scss (新建：样式文件)
├── locales/
│   └── th/
│       └── translation.json (修改：添加翻译)
└── App.jsx (修改：添加路由)
```

### 2. 路由配置

```javascript
// App.jsx
import QuickStartPage from "./pages/Guide/QuickStart";

// 在路由配置中添加
<Route path="/guide/quick-start" element={<QuickStartPage />} />
```

### 3. 主页修改

```javascript
// Home/Index.jsx
// 在导航菜单下方添加

<div className="flex justify-center mb-4">
  <MenuItem
    key={navData[8].id}
    icon={navData[8].img}
    text={navData[8].name}
    gradient={navData[8].gradient}
    onClick={() => menuTarget(navData[8].url, navData[8].params)}
  />
</div>

{/* 新增：急件说明入口 */}
<div className="relative -top-5 flex items-center justify-center">
  <button
    onClick={() => navigate('/guide/quick-start')}
    className="group relative"
  >
    {/* 发光效果 */}
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
                    rounded-full blur-xl opacity-50 group-hover:opacity-75 
                    transition-opacity animate-pulse" />
    
    {/* 主按钮 */}
    <div className="relative flex items-center gap-3 px-6 py-3 
                    bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500
                    rounded-full shadow-2xl
                    group-hover:scale-110 group-active:scale-95
                    transition-all duration-200">
      <span className="text-2xl">⚡</span>
      <span className="text-white font-bold text-base">
        {t("home.quick_guide", "急件说明")}
      </span>
      <span className="text-2xl">📋</span>
    </div>
    
    {/* 闪烁提示 */}
    <div className="absolute -top-1 -right-1 w-3 h-3 
                    bg-red-500 rounded-full animate-ping" />
  </button>
</div>
```

### 4. 翻译文件

```json
// locales/th/translation.json
{
  "home": {
    "quick_guide": "คู่มือด่วน",
    "quick_guide_subtitle": "เรียนรู้วิธีใช้งานอย่างรวดเร็ว"
  },
  "guide": {
    "title": "คู่มือการใช้งาน",
    "subtitle": "ทำตามขั้นตอนเหล่านี้เพื่อส่งพัสดุครั้งแรกของคุณ",
    "welcome": "ยินดีต้อนรับสู่ Vhuong Tra",
    "need_help": "ต้องการความช่วยเหลือ?",
    "contact_support": "ติดต่อฝ่ายสนับสนุน",
    "other_features": "ฟีเจอร์อื่นๆ",
    
    "step1": {
      "title": "ขั้นตอนที่ 1: คัดลอกที่อยู่คลังสินค้า",
      "description": "คัดลอกที่อยู่คลังสินค้าและวางในแพลตฟอร์มช้อปปิ้งของคุณ",
      "action": "ดูคลังสินค้า"
    },
    "step2": {
      "title": "ขั้นตอนที่ 2: รายงานพัสดุ",
      "description": "หลังจากซื้อแล้ว ให้รายงานหมายเลขติดตามไปยังระบบ",
      "action": "รายงานตอนนี้"
    },
    "step3": {
      "title": "ขั้นตอนที่ 3: สมัครแพ็คพัสดุ",
      "description": "เมื่อพัสดุมาถึงคลังสินค้า ให้สมัครแพ็คและจัดส่ง",
      "action": "สมัครแพ็ค"
    },
    "step4": {
      "title": "ขั้นตอนที่ 4: ชำระค่าขนส่ง",
      "description": "หลังจากแพ็คเสร็จ ให้ชำระค่าขนส่งและสินค้าจะถูกส่ง",
      "action": "ดูคำสั่งซื้อ"
    },
    
    "quick_links": {
      "calculate_freight": "คำนวณค่าขนส่ง",
      "my_packages": "พัสดุของฉัน",
      "recharge": "เติมเงิน"
    }
  }
}
```

### 5. 组件实现

#### QuickStart.jsx (主页面)
```javascript
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useTranslation } from "react-i18next";
import { orderStatusState } from "../../state";
import StepCard from "./StepCard";
import QuickLinks from "./QuickLinks";
import "./QuickStart.scss";

const QuickStartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setOrderStatus = useSetRecoilState(orderStatusState);

  const steps = [
    {
      id: 1,
      icon: "📦",
      gradient: "from-blue-400 to-blue-600",
      title: t("guide.step1.title"),
      description: t("guide.step1.description"),
      action: t("guide.step1.action"),
      onClick: () => navigate('/storage/index')
    },
    {
      id: 2,
      icon: "📋",
      gradient: "from-green-400 to-green-600",
      title: t("guide.step2.title"),
      description: t("guide.step2.description"),
      action: t("guide.step2.action"),
      onClick: () => navigate('/package/forecast')
    },
    {
      id: 3,
      icon: "📦",
      gradient: "from-orange-400 to-orange-600",
      title: t("guide.step3.title"),
      description: t("guide.step3.description"),
      action: t("guide.step3.action"),
      onClick: () => navigate('/package/pack/select')
    },
    {
      id: 4,
      icon: "💳",
      gradient: "from-purple-400 to-purple-600",
      title: t("guide.step4.title"),
      description: t("guide.step4.description"),
      action: t("guide.step4.action"),
      onClick: () => {
        setOrderStatus(2);
        navigate('/order/index');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-6 shadow-lg">
        <button onClick={() => navigate(-1)} className="mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-black text-white mb-2">{t("guide.title")}</h1>
        <p className="text-white/90 text-sm">{t("guide.subtitle")}</p>
      </div>

      {/* Steps */}
      <div className="px-4 py-6 space-y-4">
        {steps.map((step, index) => (
          <StepCard key={step.id} step={step} index={index} />
        ))}
      </div>

      {/* Quick Links */}
      <QuickLinks />

      {/* Help Section */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-600 mb-2">{t("guide.need_help")}</p>
          <p className="text-primary-600 font-bold">LINE: @vhunter</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStartPage;
```

#### StepCard.jsx (步骤卡片)
```javascript
import React from "react";

const StepCard = ({ step, index }) => {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100
                 hover:shadow-xl hover:scale-[1.02] active:scale-95
                 transition-all duration-200 cursor-pointer
                 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={step.onClick}
    >
      {/* Step Number Badge */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient}
                        flex items-center justify-center text-2xl shadow-lg`}>
          {step.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient}
                            flex items-center justify-center text-white font-bold text-sm`}>
              {step.id}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        className={`w-full py-3 rounded-xl bg-gradient-to-r ${step.gradient}
                   text-white font-bold shadow-lg
                   hover:shadow-xl hover:scale-105 active:scale-95
                   transition-all duration-200
                   flex items-center justify-center gap-2`}
      >
        <span>{step.action}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
};

export default StepCard;
```

#### QuickLinks.jsx (快速链接)
```javascript
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuickLinks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const links = [
    {
      title: t("guide.quick_links.calculate_freight"),
      icon: "💰",
      url: "/freight",
      gradient: "from-teal-400 to-teal-600"
    },
    {
      title: t("guide.quick_links.my_packages"),
      icon: "📦",
      url: "/order/package",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      title: t("guide.quick_links.recharge"),
      icon: "💳",
      url: "/mine/recharge",
      gradient: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {t("guide.other_features")}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => navigate(link.url)}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl
                     shadow-sm border border-gray-100
                     hover:shadow-md hover:scale-105 active:scale-95
                     transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient}
                            flex items-center justify-center text-2xl shadow-lg`}>
              {link.icon}
            </div>
            <span className="text-xs font-bold text-gray-700 text-center leading-tight">
              {link.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
```

---

## 实施步骤

### Phase 1: 准备工作 (1天)
1. ✅ 创建需求文档
2. ✅ 创建实施计划
3. ⬜ 设计评审
4. ⬜ 技术方案确认

### Phase 2: 开发 (2-3天)
1. ⬜ 创建组件文件结构
2. ⬜ 实现 QuickStart 主页面
3. ⬜ 实现 StepCard 组件
4. ⬜ 实现 QuickLinks 组件
5. ⬜ 添加翻译文本
6. ⬜ 修改主页添加入口按钮
7. ⬜ 配置路由

### Phase 3: 测试 (1天)
1. ⬜ 功能测试
2. ⬜ 导航测试
3. ⬜ 响应式测试
4. ⬜ 多语言测试
5. ⬜ 性能测试

### Phase 4: 优化和发布 (1天)
1. ⬜ 修复 bug
2. ⬜ 优化动画效果
3. ⬜ 优化加载性能
4. ⬜ 代码审查
5. ⬜ 部署上线

---

## 风险和挑战

### 技术风险
1. **动画性能**: 多个动画可能影响低端设备性能
   - **解决方案**: 使用 CSS 动画，避免 JavaScript 动画

2. **路由冲突**: 新路由可能与现有路由冲突
   - **解决方案**: 使用独特的路由路径 `/guide/quick-start`

3. **状态管理**: 导航时需要设置订单状态
   - **解决方案**: 使用 Recoil 状态管理

### 用户体验风险
1. **按钮位置**: 入口按钮可能不够显眼
   - **解决方案**: 使用醒目的颜色和动画效果

2. **内容过长**: 步骤说明可能过长
   - **解决方案**: 精简文字，使用图标辅助

3. **导航混乱**: 用户可能在多个页面间迷失
   - **解决方案**: 提供清晰的返回按钮

---

## 成功指标

### 短期指标 (1个月)
- [ ] 30% 的新用户点击查看操作指南
- [ ] 60% 的用户浏览完所有步骤
- [ ] 页面加载时间 < 2秒
- [ ] 零严重 bug

### 中期指标 (3个月)
- [ ] 首次包裹报告转化率提升 20%
- [ ] 客服咨询量减少 15%
- [ ] 用户满意度 > 80%
- [ ] 功能使用率稳定在 25% 以上

### 长期指标 (6个月)
- [ ] 新用户留存率提升 10%
- [ ] 平均完成首次发货时间缩短 30%
- [ ] 功能持续优化和迭代

---

## 总结

这个"急件说明"功能将为用户提供一个清晰、友好的操作指南，帮助他们快速了解平台的核心流程。通过交互式的步骤展示和直接的功能跳转，我们可以显著提升新用户的使用体验和转化率。

整个实施过程预计需要 5-6 个工作日，包括开发、测试和优化。功能上线后，我们将持续监控用户行为数据，并根据反馈进行优化。


---

## 详细步骤实现说明

### 步骤1: 复制仓库地址（已修改）

#### 功能描述
- 直接显示默认仓库的完整地址信息
- 提供陆运和海运两种复制选项
- 海运地址自动在末尾添加 " SEA"
- 显示蓝色提示框说明陆运/海运区别

#### API调用
```javascript
// 获取默认仓库信息
const fetchDefaultWarehouse = async () => {
  try {
    const res = await request.get("page/getStorageFirst&wxapp_id=10001");
    setWarehouse(res.data);
  } catch (error) {
    console.error("获取仓库信息失败:", error);
    toast.error(t("guide.step1.error", "ไม่สามารถโหลดข้อมูลคลังสินค้าได้"));
  }
};

// 返回数据结构：
// {
//   linkman: "收件人姓名",
//   phone: "电话号码",
//   address: "详细地址（已包含用户CODE/UID）",
//   post: "邮编",
//   shop_name: "仓库名称"
// }
```

#### UI组件设计
```jsx
<div className="step-card bg-white rounded-3xl p-6 shadow-lg">
  {/* 步骤标题 */}
  <div className="flex items-start gap-4 mb-4">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600
                    flex items-center justify-center text-2xl shadow-lg">
      📦
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                        flex items-center justify-center text-white font-bold text-sm">
          1
        </div>
        <h3 className="font-bold text-gray-900 text-base">
          {t("guide.step1.title", "ขั้นตอนที่ 1: คัดลอกที่อยู่คลังสินค้า")}
        </h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">
        {t("guide.step1.description", "คัดลอกที่อยู่คลังสินค้าและวางในแพลตฟอร์มช้อปปิ้งของคุณ")}
      </p>
    </div>
  </div>

  {/* 仓库信息卡片 */}
  {warehouse && (
    <div className="warehouse-info bg-blue-50 rounded-xl p-4 mb-3 border border-blue-100">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{t("storage.detail.recipient", "ผู้รับ")}:</span>
          <span className="font-medium text-gray-900">{warehouse.linkman}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("storage.detail.phone", "เบอร์โทรศัพท์")}:</span>
          <span className="font-medium text-gray-900">{warehouse.phone}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-600">{t("storage.detail.address", "ที่อยู่")}:</span>
          <span className="font-medium text-gray-900 break-words">{warehouse.address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t("storage.detail.zip", "รหัสไปรษณีย์")}:</span>
          <span className="font-medium text-gray-900">{warehouse.post}</span>
        </div>
      </div>
    </div>
  )}

  {/* 提示信息 */}
  <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-3">
    <div className="flex items-start gap-2">
      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs text-blue-800">
        {t("guide.step1.notice", "默认为陆运地址，如果是海运请在地址后面加入 SEA")}
      </p>
    </div>
  </div>

  {/* 操作按钮 */}
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={() => handleCopy('land')}
      className="py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600
                 text-white font-bold shadow-lg
                 hover:shadow-xl hover:scale-105 active:scale-95
                 transition-all duration-200
                 flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
      <span>{t("guide.step1.copy_land", "คัดลอกที่อยู่ทางบก")}</span>
    </button>
    <button
      onClick={() => handleCopy('sea')}
      className="py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600
                 text-white font-bold shadow-lg
                 hover:shadow-xl hover:scale-105 active:scale-95
                 transition-all duration-200
                 flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
      <span>{t("guide.step1.copy_sea", "คัดลอกที่อยู่ทางเรือ")}</span>
    </button>
  </div>
</div>
```

#### 复制逻辑实现
```javascript
const handleCopy = (type) => {
  if (!warehouse) {
    toast.error(t("guide.step1.no_warehouse", "ไม่พบข้อมูลคลังสินค้า"));
    return;
  }

  // 构建完整地址文本
  let addressText = warehouse.address;
  
  // 如果是海运，在地址末尾添加 SEA
  if (type === 'sea') {
    addressText = `${warehouse.address} SEA`;
  }
  
  // 完整的复制文本（格式：收件人|电话|地址|邮编）
  const fullText = `${warehouse.linkman}|${warehouse.phone}|${addressText}|${warehouse.post}`;
  
  // 复制到剪贴板
  const success = copy(fullText);
  
  if (success) {
    // 显示成功提示
    if (type === 'sea') {
      toast.success(t("guide.step1.copy_sea_success", "คัดลอกที่อยู่ทางเรือสำเร็จ"));
    } else {
      toast.success(t("guide.step1.copy_land_success", "คัดลอกที่อยู่ทางบกสำเร็จ"));
    }
    
    // 记录事件（用于分析）
    util.trackEvent('quick_guide_copy_address', { type });
  } else {
    toast.error(t("common.copy_error", "คัดลอกล้มเหลว"));
  }
};
```

---

### 步骤2: 报告包裹（保持不变）

#### 功能描述
- 引导用户报告包裹
- 跳转到包裹报告页面

#### 导航逻辑
```javascript
const handleStep2 = () => {
  navigate('/package/forecast');
  util.trackEvent('quick_guide_step2_click');
};
```

---

### 步骤3: 申请打包（已修改）

#### 功能描述
- 引导用户申请打包
- 提示需要填写收货地址
- 提供地址管理快捷入口
- 跳转到打包申请页面

#### UI组件设计
```jsx
<div className="step-card bg-white rounded-3xl p-6 shadow-lg">
  {/* 步骤标题 */}
  <div className="flex items-start gap-4 mb-4">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600
                    flex items-center justify-center text-2xl shadow-lg">
      📦
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600
                        flex items-center justify-center text-white font-bold text-sm">
          3
        </div>
        <h3 className="font-bold text-gray-900 text-base">
          {t("guide.step3.title", "ขั้นตอนที่ 3: สมัครแพ็คพัสดุ")}
        </h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">
        {t("guide.step3.description", "เมื่อพัสดุมาถึงคลังสินค้า ให้เลือกพัสดุสมัครแพ็คและกรอกข้อมูลที่อยู่จัดส่ง")}
      </p>
    </div>
  </div>

  {/* 提示信息 - 需要填写收货地址 */}
  <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-3">
    <div className="flex items-start gap-2">
      <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p className="text-xs text-orange-800 font-medium mb-1">
          {t("guide.step3.notice_title", "ข้อควรทราบ")}
        </p>
        <p className="text-xs text-orange-700">
          {t("guide.step3.notice", "สมัครแพ็คพัสดุต้องกรอกที่อยู่จัดส่ง กรุณาเพิ่มที่อยู่ก่อนสมัครแพ็ค")}
        </p>
      </div>
    </div>
  </div>

  {/* 操作按钮组 */}
  <div className="space-y-2">
    {/* 主要操作：申请打包 */}
    <button
      onClick={() => handleStep3('pack')}
      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600
                 text-white font-bold shadow-lg
                 hover:shadow-xl hover:scale-105 active:scale-95
                 transition-all duration-200
                 flex items-center justify-center gap-2"
    >
      <span>{t("guide.step3.action", "สมัครแพ็ค")}</span>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>

    {/* 次要操作：管理地址 */}
    <button
      onClick={() => handleStep3('address')}
      className="w-full py-2.5 rounded-xl border-2 border-orange-300 text-orange-600
                 font-medium hover:bg-orange-50 active:scale-95
                 transition-all duration-200
                 flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-sm">{t("guide.step3.manage_address", "จัดการที่อยู่")}</span>
    </button>
  </div>
</div>
```

#### 导航逻辑实现
```javascript
const handleStep3 = (action) => {
  if (action === 'pack') {
    // 跳转到打包申请页面
    navigate('/package/pack/select');
    util.trackEvent('quick_guide_step3_pack');
  } else if (action === 'address') {
    // 跳转到地址管理页面
    navigate('/address/index');
    util.trackEvent('quick_guide_step3_address');
  }
};
```

---

### 步骤4: 支付运费（保持不变）

#### 功能描述
- 引导用户支付运费
- 跳转到待支付订单列表

#### 导航逻辑
```javascript
const handleStep4 = () => {
  setOrderStatus(2); // 设置为待支付状态
  navigate('/order/index');
  util.trackEvent('quick_guide_step4_click');
};
```

---

## 翻译文本更新

需要在 `src/locales/th/translation.json` 中添加以下翻译：

```json
{
  "guide": {
    "step1": {
      "title": "ขั้นตอนที่ 1: คัดลอกที่อยู่คลังสินค้า",
      "description": "คัดลอกที่อยู่คลังสินค้าและวางในแพลตฟอร์มช้อปปิ้งของคุณ",
      "notice": "ค่าเริ่มต้นเป็นที่อยู่ทางบก หากเป็นทางเรือกรุณาเพิ่ม SEA ที่ท้ายที่อยู่",
      "copy_land": "คัดลอกที่อยู่ทางบก",
      "copy_sea": "คัดลอกที่อยู่ทางเรือ",
      "copy_land_success": "คัดลอกที่อยู่ทางบกสำเร็จ",
      "copy_sea_success": "คัดลอกที่อยู่ทางเรือสำเร็จ (เพิ่ม SEA แล้ว)",
      "no_warehouse": "ไม่พบข้อมูลคลังสินค้า",
      "error": "ไม่สามารถโหลดข้อมูลคลังสินค้าได้"
    },
    "step3": {
      "title": "ขั้นตอนที่ 3: สมัครแพ็คพัสดุ",
      "description": "เมื่อพัสดุมาถึงคลังสินค้า ให้เลือกพัสดุสมัครแพ็คและกรอกข้อมูลที่อยู่จัดส่ง",
      "notice_title": "ข้อควรทราบ",
      "notice": "สมัครแพ็คพัสดุต้องกรอกที่อยู่จัดส่ง กรุณาเพิ่มที่อยู่ก่อนสมัครแพ็ค",
      "action": "สมัครแพ็ค",
      "manage_address": "จัดการที่อยู่"
    }
  }
}
```

---

## 数据流程图

```
用户进入操作指南页面
    ↓
加载默认仓库信息 (API: page/getStorageFirst)
    ↓
显示步骤1 - 仓库地址信息
    ├→ 用户点击"复制陆运地址"
    │   └→ 复制: 收件人|电话|地址|邮编
    └→ 用户点击"复制海运地址"
        └→ 复制: 收件人|电话|地址 SEA|邮编
    ↓
显示步骤2 - 报告包裹
    └→ 跳转到 /package/forecast
    ↓
显示步骤3 - 申请打包
    ├→ 点击"申请打包" → /package/pack/select
    └→ 点击"管理地址" → /address/index
    ↓
显示步骤4 - 支付运费
    └→ 跳转到 /order/index (status=2)
```

---

## 更新后的成功指标

### 新增指标
- [ ] 步骤1地址复制成功率 > 90%
- [ ] 陆运/海运地址复制比例统计
- [ ] 步骤3地址管理点击率 > 20%
- [ ] 从指南页面到打包申请的转化率 > 40%
