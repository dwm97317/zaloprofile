# LINE Mini App 前端项目说明
所有结构化整理、总结、PRD、文档
由我来决定何时需要
你只能在单一问题层面回答
每次只解决一个局部，不做全局回顾
## 项目概述
LINE Mini App 集运系统前端，基于 React + Vite + Tailwind CSS 构建。

## 已完成功能 (Specs)

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| LINE 迁移 | ✅ | LIFF 登录、用户绑定 |
| 会员等级 | ✅ | `GradeBadge.jsx`, `Grade/Index.jsx` |
| 包裹性能优化 | ✅ | 虚拟滚动、缓存、分页 |
| 包裹预报UI | ✅ | `Forecast/Index.jsx` |
| 新手指南 | ✅ | `Guide/` 组件 |
| 订单优化 | ✅ | 筛选、搜索历史、统计面板 |
| 地址地图功能 | ✅ | 交互式地图、反向地理编码 |
| Google Places API 迁移 | ✅ | 新版 API + 向后兼容 |

## 关键数据结构

### 包裹图片字段
后端 API 返回两种图片格式，前端需兼容：

| API | 字段 | 格式 |
|-----|------|------|
| `package/outside` | `images` | `string[]` |
| `package/details` | `packageimage` | `{file: {file_path}}[]` |

```javascript
// Detail.jsx - 兼容两种格式
const getImages = () => {
  if (pack_info.images?.length) return pack_info.images;
  return pack_info.packageimage?.map(img => img.file?.file_path) || [];
};
```

## 状态管理 (Recoil)
- `packageInfoState`: 包裹详情，列表页设置→详情页读取
- `packageIdsState`: 批量打包选中ID
- `userGradeState`: 会员等级信息

## 核心路由
| 路由 | 组件 | 说明 |
|------|------|------|
| `/order/package` | `Package.jsx` | 包裹列表 |
| `/package/pack/detail` | `Detail.jsx` | 包裹详情 |
| `/packages/pack` | `Pack.jsx` | 批量打包 |
| `/grade` | `Grade/Index.jsx` | 会员等级 |
| `/address/create` | `Create.jsx` | 地址创建（简化版） |
| `/address/create-map` | `CreateWithMap.jsx` | 地址创建（带地图） |

## Google Maps API
- **状态**: ✅ 已迁移到新版 API
- **策略**: 智能检测 + 向后兼容
- **组件**: `AddressAutocomplete`, `InteractiveMapPicker`
- **文档**: `GOOGLE_PLACES_API_MIGRATION_COMPLETE.md`

## UI 规范
- 泰语默认、圆角卡片 (`rounded-2xl`)、渐变图标背景

## 数据库连接配置
// 数据库配置
$config = [
    'host' => '103.119.1.84',
    'database' => 'xinsuju',
    'username' => 'xinsuju',
    'password' => 'cJGzwZTDCLHzWXN4',
    'port' => '3306',
    'charset' => 'utf8',
]
