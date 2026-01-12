# Design Document - 急件说明功能 (Quick Guide Feature)

## 设计概述

本文档详细描述"急件说明"功能的UI/UX设计规范，包括视觉设计、交互设计、动画效果和响应式布局。

---

## 视觉设计系统

### 颜色方案

#### 主题色
- **Primary Green**: `#06C755` (LINE主题色)
- **Primary Gradient**: `from-[#06C755] to-[#00B900]`

#### 步骤渐变色
- **步骤1 (蓝色)**: `from-blue-400 to-blue-600` (#60A5FA → #2563EB)
- **步骤2 (绿色)**: `from-green-400 to-green-600` (#4ADE80 → #16A34A)
- **步骤3 (橙色)**: `from-orange-400 to-orange-600` (#FB923C → #EA580C)
- **步骤4 (紫色)**: `from-purple-400 to-purple-600` (#C084FC → #9333EA)

#### 入口按钮渐变
- **主渐变**: `from-yellow-400 via-orange-400 to-red-500`
- **发光效果**: `from-yellow-400 to-orange-500` with blur and opacity

#### 提示框颜色
- **蓝色提示**: `bg-blue-100 border-blue-200 text-blue-800`
- **橙色提示**: `bg-orange-100 border-orange-200 text-orange-800`

#### 中性色
- **背景**: `#F9FAFB` (gray-50)
- **卡片**: `#FFFFFF` (white)
- **文字主色**: `#111827` (gray-900)
- **文字次色**: `#6B7280` (gray-600)
- **边框**: `#F3F4F6` (gray-100)

### 字体规范

#### 字号
- **页面标题**: `text-2xl` (24px) - font-black
- **步骤标题**: `text-base` (16px) - font-bold
- **描述文字**: `text-sm` (14px) - regular
- **提示文字**: `text-xs` (12px) - regular
- **按钮文字**: `text-base` (16px) - font-bold

#### 字重
- **Black**: 900 (页面标题)
- **Bold**: 700 (步骤标题、按钮)
- **Medium**: 500 (数据标签)
- **Regular**: 400 (正文)

### 圆角规范
- **页面容器**: `rounded-3xl` (24px)
- **卡片**: `rounded-3xl` (24px)
- **按钮**: `rounded-xl` (12px)
- **图标容器**: `rounded-2xl` (16px)
- **徽章**: `rounded-full` (完全圆形)
- **提示框**: `rounded-lg` (8px)

### 阴影规范
- **卡片阴影**: `shadow-lg` (0 10px 15px -3px rgba(0,0,0,0.1))
- **按钮阴影**: `shadow-lg` (0 10px 15px -3px rgba(0,0,0,0.1))
- **悬停阴影**: `shadow-xl` (0 20px 25px -5px rgba(0,0,0,0.1))
- **入口按钮**: `shadow-2xl` (0 25px 50px -12px rgba(0,0,0,0.25))

### 间距规范
- **页面内边距**: `px-4 py-6` (16px 24px)
- **卡片内边距**: `p-6` (24px)
- **卡片间距**: `space-y-4` (16px)
- **元素间距**: `gap-2` / `gap-3` / `gap-4` (8px/12px/16px)

---

## 页面布局设计

### 1. 主页入口按钮

#### 位置
```
┌─────────────────────────────────────┐
│  [导航菜单网格 - 8个图标]           │
├─────────────────────────────────────┤
│                                     │
│         ⚡ 急件说明 📋              │ ← 入口按钮
│         (发光动画效果)              │
│                                     │
├─────────────────────────────────────┤
│  [其他内容]                         │
└─────────────────────────────────────┘
```

#### 尺寸
- **宽度**: auto (内容自适应)
- **高度**: 48px (py-3)
- **内边距**: 24px 左右 (px-6)
- **图标大小**: 24px (text-2xl)

#### 视觉效果
1. **发光背景层**: 绝对定位，模糊效果，脉冲动画
2. **主按钮层**: 渐变背景，阴影效果
3. **红点提示**: 右上角，ping动画

---

### 2. 操作指南页面

#### 整体布局
```
┌─────────────────────────────────────┐
│  Header (固定顶部)                  │
│  - 返回按钮                         │
│  - 页面标题                         │
│  - 副标题                           │
├─────────────────────────────────────┤
│                                     │
│  Steps Section (可滚动)            │
│  - 步骤1卡片                        │
│  - 步骤2卡片                        │
│  - 步骤3卡片                        │
│  - 步骤4卡片                        │
│                                     │
├─────────────────────────────────────┤
│  Quick Links Section               │
│  - 计算运费                         │
│  - 我的包裹                         │
│  - 充值                             │
├─────────────────────────────────────┤
│  Help Section                      │
│  - 客服联系方式                     │
│                                     │
└─────────────────────────────────────┘
```

#### Header设计
- **背景**: 绿色渐变 (LINE主题)
- **高度**: auto (内容自适应)
- **内边距**: `px-4 py-6`
- **元素**:
  - 返回按钮 (左上角)
  - 标题 (text-2xl, font-black, white)
  - 副标题 (text-sm, white/90)

---

### 3. 步骤卡片设计

#### 卡片结构
```
┌─────────────────────────────────────┐
│  [图标] [步骤编号] 步骤标题         │
│         描述文字...                 │
│                                     │
│  [仓库信息/提示框] (可选)           │
│                                     │
│  [操作按钮]                         │
└─────────────────────────────────────┘
```

#### 步骤1卡片 (特殊设计)
```
┌─────────────────────────────────────┐
│  📦 [1] 步骤1: 复制仓库地址         │
│      复制仓库地址并粘贴到...        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 仓库信息卡片 (蓝色背景)     │   │
│  │ 收件人: XXX                 │   │
│  │ 电话: XXX                   │   │
│  │ 地址: XXX                   │   │
│  │ 邮编: XXX                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ℹ️ 默认为陆运地址，如果是海运...   │
│                                     │
│  [复制陆运地址] [复制海运地址]     │
└─────────────────────────────────────┘
```

#### 步骤3卡片 (特殊设计)
```
┌─────────────────────────────────────┐
│  📦 [3] 步骤3: 申请打包             │
│      包裹到达仓库后，选择包裹...    │
│                                     │
│  ⚠️ 申请打包时需要填写收货地址信息  │
│                                     │
│  [申请打包] (主按钮)                │
│  [管理地址] (次要按钮)              │
└─────────────────────────────────────┘
```

#### 标准步骤卡片 (步骤2、4)
```
┌─────────────────────────────────────┐
│  [图标] [编号] 步骤标题             │
│          描述文字...                │
│                                     │
│  [操作按钮]                         │
└─────────────────────────────────────┘
```

---

### 4. 快速链接区域

#### 布局
```
┌─────────────────────────────────────┐
│  其他功能                           │
│                                     │
│  [💰]    [📦]    [💳]              │
│  计算    我的    充值               │
│  运费    包裹                       │
└─────────────────────────────────────┘
```

#### 网格设计
- **布局**: `grid-cols-3` (3列)
- **间距**: `gap-3` (12px)
- **卡片**: 正方形，圆角，阴影

---

## 交互设计

### 1. 入口按钮交互

#### 状态
- **默认**: 渐变背景 + 发光效果 + 脉冲动画
- **悬停**: scale(1.1) + 发光增强
- **点击**: scale(0.95)
- **动画**: 红点ping动画持续

#### 行为
```
点击 → 导航到 /guide/quick-start
```

---

### 2. 步骤卡片交互

#### 步骤1交互
```
加载页面
  ↓
调用 API: page/getStorageFirst
  ↓
显示仓库信息
  ↓
用户点击"复制陆运地址"
  ↓
复制: 收件人|电话|地址|邮编
  ↓
显示成功提示
```

```
用户点击"复制海运地址"
  ↓
复制: 收件人|电话|地址 SEA|邮编
  ↓
显示成功提示
```

#### 步骤2交互
```
点击"立即报告"
  ↓
navigate('/package/forecast')
```

#### 步骤3交互
```
点击"申请打包"
  ↓
navigate('/package/pack/select')
```

```
点击"管理地址"
  ↓
navigate('/address/index')
```

#### 步骤4交互
```
点击"查看订单"
  ↓
setOrderStatus(2)
  ↓
navigate('/order/index')
```

---

### 3. 按钮状态设计

#### 主要按钮 (Primary)
- **默认**: 渐变背景 + 阴影
- **悬停**: scale(1.05) + 阴影增强
- **点击**: scale(0.95)
- **禁用**: opacity-50 + cursor-not-allowed

#### 次要按钮 (Secondary)
- **默认**: 边框 + 透明背景
- **悬停**: 浅色背景
- **点击**: scale(0.95)

---

## 动画效果

### 1. 入口按钮动画

#### 发光脉冲
```css
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.75; }
}
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

#### 红点ping
```css
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
```

#### 悬停缩放
```css
transition: all 0.2s ease-in-out;
hover: scale(1.1);
active: scale(0.95);
```

---

### 2. 步骤卡片动画

#### 渐入动画
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-card {
  animation: fadeIn 0.5s ease-out;
  animation-delay: calc(var(--index) * 100ms);
}
```

#### 悬停效果
```css
transition: all 0.2s ease-in-out;
hover: {
  scale: 1.02;
  shadow: xl;
}
```

---

### 3. 按钮动画

#### 点击反馈
```css
transition: all 0.2s ease-in-out;
active: scale(0.95);
```

#### 加载状态
```css
/* 复制按钮点击后显示加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 响应式设计

### 断点
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### 移动端优化 (320px - 640px)

#### 布局调整
- 单列布局
- 全宽卡片
- 触摸友好的按钮尺寸 (最小44px)

#### 字体调整
- 标题: text-xl (20px)
- 正文: text-sm (14px)
- 小字: text-xs (12px)

#### 间距调整
- 页面内边距: px-4 (16px)
- 卡片间距: space-y-3 (12px)

---

## 可访问性设计

### 1. 颜色对比度
- 文字与背景对比度 ≥ 4.5:1
- 按钮文字与背景对比度 ≥ 4.5:1

### 2. 触摸目标
- 最小触摸区域: 44x44px
- 按钮间距: 至少8px

### 3. 语义化HTML
```html
<nav aria-label="Quick guide navigation">
<button aria-label="Copy land shipping address">
<section aria-labelledby="step-1-title">
```

### 4. 键盘导航
- 所有交互元素可通过Tab键访问
- 焦点状态清晰可见
- 支持Enter/Space键触发

---

## 组件规范

### 1. StepCard组件

#### Props
```typescript
interface StepCardProps {
  step: {
    id: number;
    icon: string;
    gradient: string;
    title: string;
    description: string;
    action?: string;
    onClick?: () => void;
  };
  index: number;
  children?: React.ReactNode; // 用于自定义内容
}
```

#### 使用示例
```jsx
<StepCard step={step1} index={0}>
  {/* 自定义内容：仓库信息 */}
  <WarehouseInfo data={warehouse} />
  <NoticeBox type="info" message="..." />
  <div className="grid grid-cols-2 gap-3">
    <Button onClick={handleCopyLand}>复制陆运地址</Button>
    <Button onClick={handleCopySea}>复制海运地址</Button>
  </div>
</StepCard>
```

---

### 2. NoticeBox组件

#### Props
```typescript
interface NoticeBoxProps {
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  icon?: React.ReactNode;
}
```

#### 样式变体
- **info**: 蓝色 (bg-blue-100 border-blue-200 text-blue-800)
- **warning**: 橙色 (bg-orange-100 border-orange-200 text-orange-800)
- **success**: 绿色 (bg-green-100 border-green-200 text-green-800)
- **error**: 红色 (bg-red-100 border-red-200 text-red-800)

---

### 3. WarehouseInfo组件

#### Props
```typescript
interface WarehouseInfoProps {
  data: {
    linkman: string;
    phone: string;
    address: string;
    post: string;
    shop_name?: string;
  };
}
```

#### 布局
```jsx
<div className="warehouse-info bg-blue-50 rounded-xl p-4 border border-blue-100">
  <div className="space-y-2 text-sm">
    <InfoRow label="收件人" value={data.linkman} />
    <InfoRow label="电话" value={data.phone} />
    <InfoRow label="地址" value={data.address} multiline />
    <InfoRow label="邮编" value={data.post} />
  </div>
</div>
```

---

## 性能优化

### 1. 图片优化
- 使用表情符号代替图片图标
- 减少HTTP请求

### 2. 动画优化
- 使用CSS动画代替JavaScript
- 使用transform和opacity (GPU加速)
- 避免layout thrashing

### 3. 代码分割
- 懒加载QuickStart页面
- 按需加载组件

### 4. 缓存策略
- 缓存仓库信息 (5分钟)
- 使用React.memo优化组件

---

## 错误处理

### 1. API错误
```
加载仓库信息失败
  ↓
显示错误提示
  ↓
提供重试按钮
```

### 2. 复制失败
```
复制到剪贴板失败
  ↓
显示错误提示
  ↓
提供手动复制选项
```

### 3. 网络错误
```
网络连接失败
  ↓
显示离线提示
  ↓
提供刷新按钮
```

---

## 设计检查清单

- [ ] 所有颜色符合品牌规范
- [ ] 文字对比度符合WCAG标准
- [ ] 触摸目标尺寸 ≥ 44px
- [ ] 动画流畅 (60fps)
- [ ] 响应式布局在所有设备正常
- [ ] 所有交互状态已定义
- [ ] 错误状态已设计
- [ ] 加载状态已设计
- [ ] 空状态已设计
- [ ] 多语言文本已适配

---

## 设计资源

### Figma文件
- (待创建)

### 设计规范参考
- LINE Design System
- Material Design
- iOS Human Interface Guidelines

### 图标资源
- 使用Unicode表情符号
- 使用Heroicons (SVG图标)

