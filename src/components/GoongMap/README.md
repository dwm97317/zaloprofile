# GoongMap 组件文档

## 概述

GoongMap 是一个基于 Goong Maps API 的 React 地图组件，专为越南地区优化，支持丰富的交互功能和自定义选项。

## 🚀 主要特性

### ✨ 核心功能
- 🗺️ **多地图样式**: 支持默认、卫星、地形三种地图样式
- 📍 **交互式标记**: 可拖拽标记，点击地图设置位置
- 🎯 **当前位置**: 自动获取用户当前地理位置
- 🔄 **实时更新**: 实时位置变化回调
- 📱 **响应式设计**: 完美适配移动端和桌面端

### 🛡️ 安全优化
- 🔒 **环境变量支持**: API密钥通过环境变量配置
- 🚫 **防止密钥泄露**: 避免硬编码敏感信息
- 🔐 **安全加载**: CDN资源完整性检查

### ⚡ 性能优化
- 🚀 **防抖处理**: 位置变化事件防抖，减少API调用
- 💾 **记忆化**: 地图样式和配置记忆化缓存
- 🔄 **智能重试**: 网络失败自动重试机制
- ⏱️ **加载超时**: 防止长时间等待

### 🎨 用户体验
- 💫 **流畅动画**: 丰富的过渡动画效果
- 🌙 **深色主题**: 自动适配系统深色模式
- ♿ **无障碍支持**: 完整的键盘导航和屏幕阅读器支持
- 📐 **高对比度**: 支持高对比度显示模式

## 📦 安装使用

### 1. 环境配置

创建 `.env` 文件：

```env
REACT_APP_GOONG_API_KEY=your_goong_api_key_here
```

### 2. 基础使用

```jsx
import React, { useState } from 'react';
import GoongMap from './components/GoongMap';

const MyComponent = () => {
  const [center, setCenter] = useState({
    lat: 10.762622,
    lng: 106.660172
  });

  const handleLocationChange = (location) => {
    console.log('位置变化:', location);
    setCenter(location);
  };

  return (
    <GoongMap
      center={center}
      zoom={15}
      onLocationChange={handleLocationChange}
      showMarker={true}
      height="400px"
    />
  );
};
```

### 3. 高级使用

```jsx
<GoongMap
  center={{ lat: 10.762622, lng: 106.660172 }}
  zoom={15}
  mapStyle="satellite"
  showMarker={true}
  markerDraggable={true}
  showControls={true}
  showCurrentLocationBtn={true}
  height="500px"
  maxZoom={18}
  minZoom={1}
  disabled={false}
  className="custom-map"
  onLocationChange={(location) => {
    console.log('新位置:', location);
  }}
  onMapReady={(map) => {
    console.log('地图准备就绪:', map);
  }}
  onError={(error, details) => {
    console.error('地图错误:', error, details);
  }}
/>
```

## 🔧 API 参考

### Props

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `center` | `{lat: number, lng: number}` | `{lat: 10.762622, lng: 106.660172}` | 地图中心点坐标 |
| `zoom` | `number` | `15` | 地图缩放级别 |
| `height` | `string` | `'300px'` | 地图容器高度 |
| `mapStyle` | `'default' \| 'satellite' \| 'terrain'` | `'default'` | 地图样式 |
| `showMarker` | `boolean` | `true` | 是否显示标记 |
| `markerDraggable` | `boolean` | `true` | 标记是否可拖拽 |
| `showControls` | `boolean` | `true` | 是否显示地图控件 |
| `showCurrentLocationBtn` | `boolean` | `false` | 是否显示定位按钮 |
| `disabled` | `boolean` | `false` | 是否禁用地图交互 |
| `maxZoom` | `number` | `18` | 最大缩放级别 |
| `minZoom` | `number` | `1` | 最小缩放级别 |
| `className` | `string` | `''` | 自定义CSS类名 |

### 事件回调

| 事件名 | 类型 | 描述 |
|--------|------|------|
| `onLocationChange` | `(location: {lat: number, lng: number}) => void` | 位置变化时触发 |
| `onMapReady` | `(map: GoongMap) => void` | 地图初始化完成时触发 |
| `onError` | `(error: string, details?: any) => void` | 发生错误时触发 |

## 🎨 样式自定义

### CSS变量

```css
.goong-map-container {
  --map-border-radius: 12px;
  --map-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --control-bg: white;
  --control-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
```

### 自定义主题

```scss
.my-custom-map {
  .goong-map-container {
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    
    .current-location-btn {
      background: linear-gradient(45deg, #007bff, #0056b3);
      color: white;
    }
  }
}
```

## 📱 响应式断点

| 断点 | 宽度 | 调整 |
|------|------|------|
| 移动端 | `≤ 768px` | 缩小控件，调整间距 |
| 小屏幕 | `≤ 480px` | 进一步优化触控体验 |

## 🔧 开发指南

### 环境变量配置

```bash
# .env
REACT_APP_GOONG_API_KEY=your_api_key
REACT_APP_DEFAULT_MAP_CENTER_LAT=10.762622
REACT_APP_DEFAULT_MAP_CENTER_LNG=106.660172
```

### 错误处理

```jsx
const handleMapError = (error, details) => {
  // 记录错误
  console.error('地图错误:', error);
  
  // 显示用户友好的错误信息
  if (error.includes('API key')) {
    showToast('地图服务配置错误，请联系管理员');
  } else if (error.includes('网络')) {
    showToast('网络连接失败，请检查网络设置');
  } else {
    showToast('地图加载失败，请稍后重试');
  }
};
```

### 性能优化建议

1. **防抖处理**: 位置变化回调已内置防抖
2. **懒加载**: 可结合 `React.lazy()` 懒加载组件
3. **内存管理**: 组件卸载时自动清理地图实例

```jsx
// 懒加载示例
const GoongMap = React.lazy(() => import('./components/GoongMap'));

const App = () => (
  <Suspense fallback={<div>加载地图中...</div>}>
    <GoongMap {...props} />
  </Suspense>
);
```

## 🐛 常见问题

### Q: API密钥错误怎么办？
A: 检查环境变量配置，确保 `REACT_APP_GOONG_API_KEY` 正确设置。

### Q: 地图加载缓慢？
A: 可能是网络问题，组件已内置重试机制，会自动重试。

### Q: 移动端标记难以拖拽？
A: 已优化触控体验，确保标记区域足够大，支持触摸操作。

### Q: 如何自定义标记样式？
A: 可通过CSS覆盖 `.goongjs-marker` 样式，或使用地图API添加自定义标记。

## 🔄 更新日志

### v2.0.0 (优化版本)
- ✨ 新增多地图样式支持
- 🛡️ 增强安全性，支持环境变量
- ⚡ 性能优化，防抖和记忆化
- 🎨 改进UI/UX，支持深色主题
- ♿ 完善无障碍支持
- 🔧 增强错误处理和重试机制

### v1.0.0 (原版本)
- 🗺️ 基础地图功能
- 📍 标记拖拽支持
- 📱 基础响应式设计

## 📄 许可证

MIT License - 详见 LICENSE 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 代码规范

- 使用 ESLint 和 Prettier
- 遵循 React Hooks 最佳实践
- 添加适当的 PropTypes 或 TypeScript 类型
- 编写单元测试

---

📝 **提示**: 此文档持续更新，如有疑问请提交 Issue。 