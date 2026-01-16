# 👨‍💻 Package Page Redesign - Developer Guide

## 开发者指南

---

## 📁 项目结构

```
src/
├── components/
│   └── Order/
│       ├── EnhancedOrderCard.jsx      ← 新增：增强版卡片
│       ├── FloatingActionBar.jsx      ← 新增：浮动操作栏
│       ├── EnhancedTabBar.jsx         ← 新增：增强版Tab
│       ├── OrderCard.jsx              ← 保留：旧版卡片
│       ├── VirtualizedOrderList.jsx   ← 保留：虚拟滚动
│       └── ...
└── pages/
    └── Order/
        └── Package.jsx                 ← 修改：集成新组件
```

---

## 🔧 组件 API

### 1. EnhancedOrderCard

**Props**:
```typescript
interface EnhancedOrderCardProps {
  item: PackageItem;              // 包裹数据
  selectionMode: boolean;         // 是否选择模式
  isSelected: boolean;            // 是否已选中
  onToggleSelection: (id, item) => void;  // 切换选中
  onDetail: (item) => void;       // 查看详情
  onEdit: (item) => void;         // 编辑预报
  onLogistics: (sn) => void;      // 查看物流
  onConfirmCancel: (id) => void;  // 取消预报
  onImageClick: (images, index) => void;  // 图片点击
  onLongPress: (item) => void;    // 长按（未来）
}
```

**PackageItem 数据结构**:
```typescript
interface PackageItem {
  id: number;
  express_num: string;            // 快递单号
  mark?: string;                  // 唛头
  usermark?: string;              // 用户唛头
  status: number;                 // 状态 (1,2,8,-1)
  storage?: {
    shop_name: string;            // 仓库名称
  };
  storage_id: number;             // 仓库ID
  country?: {
    title: string;                // 国家名称
  };
  weight?: number;                // 重量
  volume?: number;                // 体积
  class_name?: string;            // 商品类别
  images?: string[];              // 图片数组
  created_time?: string;          // 创建时间
}
```

**使用示例**:
```jsx
<EnhancedOrderCard
  item={packageItem}
  selectionMode={false}
  isSelected={false}
  onDetail={(item) => navigate('/detail')}
  onEdit={(item) => navigate('/edit')}
  onLogistics={(sn) => navigate('/track')}
  onConfirmCancel={(id) => setShowConfirm(true)}
  onImageClick={(images, index) => setImageModal({...})}
  onLongPress={(item) => console.log('Long press')}
/>
```

---

### 2. FloatingActionBar

**Props**:
```typescript
interface FloatingActionBarProps {
  visible: boolean;               // 是否显示
  selectedCount: number;          // 已选数量
  totalCount: number;             // 总数量
  onApplyPacking: () => void;     // 申请打包
  onCancel: () => void;           // 取消选择
  onSelectAll: () => void;        // 全选
  onDeselectAll: () => void;      // 取消全选
  warehouseValidation?: {         // 仓库验证
    valid: boolean;
    message?: string;
    warehouseName?: string;
  } | null;
}
```

**使用示例**:
```jsx
<FloatingActionBar
  visible={selectionMode}
  selectedCount={selectedPackages.length}
  totalCount={filteredOrders.length}
  onApplyPacking={handleApplyPacking}
  onCancel={toggleSelectionMode}
  onSelectAll={handleSelectAll}
  onDeselectAll={handleDeselectAll}
  warehouseValidation={{
    valid: true,
    warehouseName: "仓库A"
  }}
/>
```

---

### 3. EnhancedTabBar

**Props**:
```typescript
interface EnhancedTabBarProps {
  tabs: TabItem[];                // Tab配置
  activeTab: number;              // 当前激活Tab
  onTabChange: (id: number) => void;  // Tab切换
  counts: {                       // 数量统计
    [key: string]: number;
  };
}

interface TabItem {
  id: number;                     // Tab ID
  label: string;                  // Tab标签
  countKey: string;               // 数量字段key
}
```

**使用示例**:
```jsx
const tabs = [
  { id: 2, label: "已入库", countKey: "yescount" },
  { id: 8, label: "已发货", countKey: "yessend" },
  { id: 1, label: "待入库", countKey: "nocount" },
  { id: -1, label: "问题件", countKey: "procount" },
];

<EnhancedTabBar
  tabs={tabs}
  activeTab={2}
  onTabChange={(id) => setTab(id)}
  counts={{
    yescount: 25,
    yessend: 10,
    nocount: 5,
    procount: 2
  }}
/>
```

---

## 🎨 样式定制

### Tailwind 配置

**主色配置** (`tailwind.config.js`):
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    }
  }
}
```

### 自定义样式

**修改卡片圆角**:
```jsx
// EnhancedOrderCard.jsx
className="rounded-3xl"  // 改为 rounded-2xl
```

**修改状态颜色**:
```jsx
const statusConfig = {
  2: { 
    gradient: "from-blue-500 to-blue-600",  // 改为其他颜色
    // ...
  }
}
```

**修改动画参数**:
```jsx
// FloatingActionBar.jsx
transition={{ 
  type: "spring", 
  damping: 25,      // 阻尼系数
  stiffness: 300    // 刚度系数
}}
```

---

## 🔌 集成到现有页面

### 步骤 1: 导入组件

```jsx
import EnhancedOrderCard from "../../components/Order/EnhancedOrderCard";
import EnhancedTabBar from "../../components/Order/EnhancedTabBar";
import FloatingActionBar from "../../components/Order/FloatingActionBar";
```

### 步骤 2: 替换 Tab

```jsx
// 旧代码
<div className="tabs">
  {tabs.map(tab => <div>{tab.label}</div>)}
</div>

// 新代码
<EnhancedTabBar 
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={handleTabChange}
  counts={counts}
/>
```

### 步骤 3: 替换卡片

```jsx
// 旧代码
<OrderCard item={item} {...props} />

// 新代码
<EnhancedOrderCard item={item} {...props} />
```

### 步骤 4: 添加浮动栏

```jsx
// 在页面底部添加
<FloatingActionBar
  visible={selectionMode}
  selectedCount={selectedCount}
  totalCount={totalCount}
  onApplyPacking={handlePacking}
  onCancel={handleCancel}
  onSelectAll={handleSelectAll}
  onDeselectAll={handleDeselectAll}
  warehouseValidation={validation}
/>
```

---

## 🎭 动画定制

### Framer Motion 配置

**卡片进入动画**:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}      // 初始状态
  animate={{ opacity: 1, y: 0 }}       // 动画到
  exit={{ opacity: 0, y: -20 }}        // 退出动画
  transition={{ duration: 0.3 }}       // 持续时间
>
```

**点击反馈**:
```jsx
<motion.div
  whileTap={{ scale: 0.98 }}           // 点击时缩放
  whileHover={{ scale: 1.02 }}         // 悬停时放大
>
```

**高度动画**:
```jsx
<motion.div
  initial={false}
  animate={{ height: isExpanded ? "auto" : 0 }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
>
```

### 自定义动画

**添加旋转动画**:
```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity }}
>
```

**添加弹跳动画**:
```jsx
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 1, repeat: Infinity }}
>
```

---

## 🐛 调试技巧

### 1. 查看组件状态

```jsx
// 在组件内添加
useEffect(() => {
  console.log('Selection mode:', selectionMode);
  console.log('Selected packages:', selectedPackages);
}, [selectionMode, selectedPackages]);
```

### 2. 性能监控

```jsx
import { performanceMonitor } from "../../utils/performanceMonitor";

// 开始监控
performanceMonitor.start();

// 记录操作
performanceMonitor.trackAPICall();
performanceMonitor.trackCacheHit();

// 停止监控
performanceMonitor.stop();
```

### 3. 动画调试

```jsx
// 添加到 motion.div
onAnimationStart={() => console.log('Animation started')}
onAnimationComplete={() => console.log('Animation completed')}
```

### 4. Chrome DevTools

**Performance 面板**:
1. 录制操作
2. 查看帧率
3. 分析瓶颈

**React DevTools**:
1. 查看组件树
2. 检查 Props
3. 分析渲染次数

---

## 🧪 测试

### 单元测试示例

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedOrderCard from './EnhancedOrderCard';

test('renders package card', () => {
  const item = {
    id: 1,
    express_num: 'ABC123',
    status: 2,
  };
  
  render(<EnhancedOrderCard item={item} />);
  expect(screen.getByText('ABC123')).toBeInTheDocument();
});

test('expands details on click', () => {
  const item = { id: 1, express_num: 'ABC123', status: 2 };
  render(<EnhancedOrderCard item={item} />);
  
  const expandButton = screen.getByText(/ดูเพิ่ม/);
  fireEvent.click(expandButton);
  
  expect(screen.getByText(/น้ำหนัก/)).toBeVisible();
});
```

### E2E 测试示例

```javascript
// test-package-page.spec.js
import { test, expect } from '@playwright/test';

test('package page redesign', async ({ page }) => {
  await page.goto('https://localhost:9000/order/package');
  
  // 检查 Tab
  await expect(page.locator('text=ได้รับแล้ว')).toBeVisible();
  
  // 点击卡片
  await page.locator('.enhanced-order-card').first().click();
  
  // 进入选择模式
  await page.locator('text=สมัครแพ็คพัสดุ').click();
  await expect(page.locator('.floating-action-bar')).toBeVisible();
});
```

---

## 📦 构建优化

### 代码分割

```jsx
// 懒加载组件
const EnhancedOrderCard = lazy(() => 
  import('./components/Order/EnhancedOrderCard')
);

// 使用 Suspense
<Suspense fallback={<Loading />}>
  <EnhancedOrderCard {...props} />
</Suspense>
```

### Bundle 分析

```bash
# 安装分析工具
npm install --save-dev rollup-plugin-visualizer

# 构建并分析
npm run build
```

### 性能优化

```jsx
// 使用 memo 避免重渲染
const EnhancedOrderCard = memo(({ item, ...props }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.isSelected === nextProps.isSelected;
});
```

---

## 🔄 版本迁移

### 从旧版迁移

**步骤 1**: 备份现有代码
```bash
git checkout -b backup-old-design
git commit -am "Backup old design"
```

**步骤 2**: 逐步替换组件
```jsx
// 先替换 Tab
<EnhancedTabBar {...props} />

// 再替换卡片
<EnhancedOrderCard {...props} />

// 最后添加浮动栏
<FloatingActionBar {...props} />
```

**步骤 3**: 测试验证
```bash
npm run test
npm run build
```

**步骤 4**: 回滚方案
```jsx
// 保留旧组件作为备份
import OrderCard from './OrderCard';
import EnhancedOrderCard from './EnhancedOrderCard';

const CardComponent = useNewDesign ? EnhancedOrderCard : OrderCard;
```

---

## 📚 参考资源

### 官方文档
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)

### 相关文件
- [设计方案](/.kiro/specs/package-page-redesign/PACKAGE_PAGE_REDESIGN_PROPOSAL.md)
- [实施总结](/PACKAGE_PAGE_REDESIGN_IMPLEMENTATION.md)
- [视觉对比](/REDESIGN_VISUAL_COMPARISON.md)

---

## 💡 最佳实践

### 1. 组件设计
- ✅ 单一职责原则
- ✅ Props 类型检查
- ✅ 默认值处理
- ✅ 错误边界

### 2. 性能优化
- ✅ 使用 memo 避免重渲染
- ✅ 懒加载大组件
- ✅ 虚拟滚动长列表
- ✅ 图片懒加载

### 3. 代码规范
- ✅ ESLint 检查
- ✅ Prettier 格式化
- ✅ 注释清晰
- ✅ 命名规范

### 4. 测试覆盖
- ✅ 单元测试
- ✅ 集成测试
- ✅ E2E 测试
- ✅ 视觉回归测试

---

**Happy Coding!** 🚀
