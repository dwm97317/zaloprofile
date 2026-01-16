# Package Take Page - Quick Reference

## 快速访问

**URL**: `/package/take`  
**组件**: `src/pages/PackageTake/Index.jsx`

## API 端点

### 获取可认领包裹
```
GET /package/packageForTaker&wxapp_id=10001
Query: { keyword?: string }
```

### 认领包裹
```
POST /package/getTakePackage&wxapp_id=10001
Body: { express_sn: string, class_ids: string }
```

### 获取分类
```
GET /category/lists&wxapp_id=10001
```

## 关键组件

| 组件 | 路径 | 用途 |
|------|------|------|
| PackageTake | `pages/PackageTake/Index.jsx` | 主页面 |
| CategorySelector | `components/PackageTake/CategorySelector.jsx` | 分类选择器 |
| PackageCard | `components/PackageTake/PackageCard.jsx` | 包裹卡片 |

## 翻译键

```javascript
t('packageTake.title')              // 标题
t('packageTake.claimNow')           // 认领按钮
t('packageTake.success')            // 成功消息
t('packageTake.error.emptyTracking') // 错误消息
```

## 常见任务

### 修改认领按钮文本
```javascript
// 文件: src/pages/PackageTake/Index.jsx
// 行: ~280
<span>{t('packageTake.claimNow', 'รับพัสดุเลย')}</span>
```

### 修改分类最大选择数
```javascript
// 文件: src/pages/PackageTake/Index.jsx
// 行: ~240
<CategorySelector
  selectedCategories={selectedCategories}
  onSelect={setSelectedCategories}
  maxSelections={10} // 修改这里
/>
```

### 修改成功跳转延迟
```javascript
// 文件: src/pages/PackageTake/Index.jsx
// 行: ~150
setTimeout(() => {
  navigate('/order/package', { state: { claimedPackage: true } });
}, 2000); // 修改这里 (毫秒)
```

### 修改追踪号码最小长度
```javascript
// 文件: src/pages/PackageTake/Index.jsx
// 行: ~110
if (trackingNumber.trim().length < 6) { // 修改这里
  toast.error(t('packageTake.error.invalidTracking'));
  return false;
}
```

## 样式定制

### 修改主色调
```javascript
// Hero 渐变
className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600"

// 按钮渐变
className="bg-gradient-to-r from-blue-500 to-blue-600"
```

### 修改卡片圆角
```javascript
// 大卡片
className="rounded-3xl"  // 24px

// 中等元素
className="rounded-xl"   // 12px
```

### 修改间距
```javascript
// 卡片内边距
className="p-6"          // 24px

// 元素间距
className="space-y-4"    // 16px
```

## 调试技巧

### 查看 API 响应
```javascript
// 在 fetchAvailablePackages 函数中添加
console.log('Packages:', res.data);
```

### 查看表单状态
```javascript
// 在 handleQuickClaim 函数开始添加
console.log('Tracking:', trackingNumber);
console.log('Categories:', selectedCategories);
```

### 测试错误场景
```javascript
// 临时修改 API 调用
const res = await request.post('package/getTakePackage&wxapp_id=10001', {
  express_sn: 'INVALID', // 测试无效追踪号
  class_ids: classIds
});
```

## 常见问题

### Q: 分类选择器不显示？
**A**: 检查 API 端点 `/category/lists` 是否正常返回数据

### Q: 认领后没有跳转？
**A**: 检查 `navigate` 函数和路由配置

### Q: Toast 通知不显示？
**A**: 确保已导入 `react-hot-toast` 并在 App 中添加 `<Toaster />`

### Q: 样式不生效？
**A**: 确保 Tailwind CSS 配置正确，运行 `npm run dev` 重新编译

## 性能优化

### 减少重新渲染
```javascript
// 使用 useMemo 缓存过滤结果
const filteredCategories = useMemo(() => {
  return categories.filter(/* ... */);
}, [categories, searchTerm]);
```

### 防抖搜索
```javascript
// 使用 lodash debounce
import { debounce } from 'lodash';

const debouncedSearch = debounce((keyword) => {
  fetchAvailablePackages(keyword);
}, 300);
```

## 测试命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览构建
npm run preview

# 类型检查
npm run type-check

# Lint
npm run lint
```

## 相关文件

- 主页面: `src/pages/PackageTake/Index.jsx`
- 分类选择器: `src/components/PackageTake/CategorySelector.jsx`
- 包裹卡片: `src/components/PackageTake/PackageCard.jsx`
- 翻译: `src/locales/th/translation.json`
- 路由: `src/components/app.jsx`

## 快速链接

- [完整文档](./PACKAGE_TAKE_REDESIGN_COMPLETE.md)
- [需求文档](./.kiro/specs/package-take-redesign/requirements.md)
- [设计文档](./.kiro/specs/package-take-redesign/design.md)
- [任务清单](./.kiro/specs/package-take-redesign/tasks.md)
