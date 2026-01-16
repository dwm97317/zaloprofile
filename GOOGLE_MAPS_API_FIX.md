# 🗺️ Google Maps API 修复说明

## 问题描述

在地址创建页面遇到以下问题：

### 1. TypeError: value.indexOf is not a function

**错误位置**: `index.html:47`  
**原因**: HTML 兼容性修复代码拦截了 `script.src` 属性，但没有检查 `value` 类型就调用 `indexOf`

**修复**:
```javascript
// 修复前
if (value && value.indexOf('eruda') !== -1) {

// 修复后
if (value && typeof value === 'string' && value.indexOf('eruda') !== -1) {
```

---

### 2. Google Maps API 警告

**警告信息**:
```
As of March 1st, 2025, google.maps.places.AutocompleteService is not available to new customers.
Please use google.maps.places.AutocompleteSuggestion instead.
```

**说明**:
- 旧版 API (`AutocompleteService`, `PlacesService`) 仍然可用
- Google 推荐使用新版 API
- 旧版 API 至少会支持到 2026 年 3 月（12 个月通知期）

**当前状态**: ✅ 功能正常，使用旧版 API

---

## 修复内容

### 1. index.html 修复

**文件**: `zalo_mini_app-master/index.html`

**修改**:
```javascript
// 添加类型检查
if (value && typeof value === 'string' && value.indexOf('eruda') !== -1) {
  console.log('[HTML兼容性修复] 阻止 eruda 脚本加载:', value);
  return;
}
```

**效果**: 
- ✅ 修复 `TypeError: value.indexOf is not a function`
- ✅ 不影响 Google Maps 动态脚本加载
- ✅ 继续阻止 eruda 调试工具加载

---

## Google Maps API 状态

### 当前使用的 API

| API | 状态 | 说明 |
|-----|------|------|
| `AutocompleteService` | ⚠️ 旧版 | 仍可用，推荐迁移 |
| `PlacesService` | ⚠️ 旧版 | 仍可用，推荐迁移 |
| `Map` | ✅ 最新 | 无需更改 |
| `Marker` | ✅ 最新 | 无需更改 |
| `Geocoder` | ✅ 最新 | 通过后端代理 |

---

### 新版 API 对比

#### 旧版 API (当前使用)

```javascript
// AutocompleteService
const service = new google.maps.places.AutocompleteService();
service.getPlacePredictions(request, callback);

// PlacesService
const service = new google.maps.places.PlacesService(map);
service.getDetails(request, callback);
```

**优点**:
- ✅ 成熟稳定
- ✅ 文档完善
- ✅ 示例丰富
- ✅ 至少支持到 2026 年 3 月

**缺点**:
- ⚠️ 不推荐给新客户
- ⚠️ 未来可能废弃

---

#### 新版 API (推荐)

```javascript
// AutocompleteSuggestion
const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

// Place
const place = new google.maps.places.Place({ id: placeId });
await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
```

**优点**:
- ✅ Google 推荐
- ✅ 更好的性能
- ✅ 更现代的 API 设计
- ✅ Promise 支持

**缺点**:
- ⚠️ 需要迁移代码
- ⚠️ 可能需要更新 API Key 权限

---

## 迁移建议

### 短期 (当前)

**状态**: ✅ 继续使用旧版 API

**理由**:
1. 旧版 API 仍然完全可用
2. 功能已经实现并测试
3. 至少有 12 个月的支持期
4. 迁移需要时间和测试

**行动**:
- ✅ 修复 `TypeError` 错误
- ✅ 添加错误处理
- ✅ 监控 API 状态

---

### 中期 (3-6 个月)

**状态**: 🔄 计划迁移到新版 API

**步骤**:
1. 研究新版 API 文档
2. 创建迁移方案
3. 在测试环境实施
4. 进行充分测试
5. 逐步部署到生产环境

**预计工作量**: 2-3 天

---

### 长期 (6-12 个月)

**状态**: ✅ 完成迁移

**目标**:
- 完全使用新版 API
- 移除旧版 API 代码
- 更新文档

---

## 错误处理增强

### 1. Google Maps 加载检查

```javascript
// 在组件中添加
useEffect(() => {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps API not loaded');
    // 显示错误提示
    return;
  }
  
  // 初始化服务
  autocompleteService.current = new window.google.maps.places.AutocompleteService();
  placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
}, []);
```

---

### 2. API 调用错误处理

```javascript
// 搜索地址
autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
  setIsLoading(false);
  
  if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
    setSuggestions(predictions);
    setShowSuggestions(true);
  } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
    console.log('No results found');
    setSuggestions([]);
  } else {
    console.error('Autocomplete error:', status);
    setSuggestions([]);
  }
});
```

---

### 3. 网络错误处理

```javascript
// 添加超时处理
const timeoutId = setTimeout(() => {
  setIsLoading(false);
  console.error('API request timeout');
}, 5000);

autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
  clearTimeout(timeoutId);
  // 处理结果
});
```

---

## 测试验证

### 1. 基本功能测试

```bash
# 启动开发服务器
npm start

# 访问地址创建页面
https://localhost:9000/address/create-map
```

**测试项**:
- ✅ 地址搜索功能正常
- ✅ 地图显示正常
- ✅ 无 TypeError 错误
- ✅ 可以选择地址

---

### 2. 控制台检查

打开浏览器控制台，检查：

```javascript
// 检查 Google Maps 加载
console.log(window.google?.maps);

// 检查 Places API
console.log(window.google?.maps?.places);

// 检查服务初始化
console.log(autocompleteService.current);
console.log(placesService.current);
```

**预期结果**:
- ✅ 所有对象都已定义
- ⚠️ 显示 API 废弃警告（正常）
- ❌ 无 TypeError 错误

---

### 3. 网络请求检查

在 Network 标签中检查：

**预期请求**:
- `https://maps.googleapis.com/maps/api/js?key=...&libraries=places`
- `https://maps.googleapis.com/maps-api-v3/api/js/...`
- 各种地图瓦片请求

**状态码**: 200 OK

---

## 性能优化

### 1. 防抖处理

```javascript
// 已实现
const debounceTimer = useRef(null);

const handleInputChange = (e) => {
  const val = e.target.value;
  setInputValue(val);

  if (debounceTimer.current) clearTimeout(debounceTimer.current);
  debounceTimer.current = setTimeout(() => searchAddresses(val), 300);
};
```

**效果**: 减少 API 调用次数

---

### 2. 结果缓存

```javascript
// 可选优化
const cacheRef = useRef(new Map());

const searchAddresses = (query) => {
  // 检查缓存
  if (cacheRef.current.has(query)) {
    setSuggestions(cacheRef.current.get(query));
    setShowSuggestions(true);
    return;
  }

  // API 调用
  autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
      // 缓存结果
      cacheRef.current.set(query, predictions);
      setSuggestions(predictions);
      setShowSuggestions(true);
    }
  });
};
```

**效果**: 
- 减少重复请求
- 提高响应速度
- 降低 API 配额消耗

---

## API 配额管理

### Google Maps API 配额

| API | 免费配额 | 超出费用 |
|-----|---------|---------|
| Autocomplete | 无限制 | 按会话收费 |
| Place Details | 无限制 | 按请求收费 |
| Geocoding | 无限制 | 按请求收费 |
| Maps JavaScript API | 无限制 | 按加载收费 |

**注意**: 
- 实际配额取决于 API Key 设置
- 建议在 Google Cloud Console 设置配额限制
- 监控使用情况

---

### 优化建议

1. **使用会话令牌** (Autocomplete Sessions)
   - 降低 Autocomplete 费用
   - 需要更新代码

2. **限制请求频率**
   - 已实现防抖 (300ms)
   - 可以增加到 500ms

3. **缓存结果**
   - 减少重复请求
   - 节省配额

4. **设置配额警报**
   - 在 Google Cloud Console 设置
   - 避免意外费用

---

## 监控和维护

### 1. 错误监控

```javascript
// 添加错误日志
window.addEventListener('error', (event) => {
  if (event.message.includes('google.maps')) {
    console.error('Google Maps Error:', event);
    // 发送到错误追踪服务
  }
});
```

---

### 2. API 状态检查

定期检查 Google Maps API 状态：
- https://status.cloud.google.com/
- https://developers.google.com/maps/legacy

---

### 3. 更新计划

| 时间 | 任务 | 状态 |
|------|------|------|
| 2026-01-15 | 修复 TypeError | ✅ 完成 |
| 2026-02-01 | 研究新版 API | 📅 计划 |
| 2026-03-01 | 创建迁移方案 | 📅 计划 |
| 2026-04-01 | 测试环境迁移 | 📅 计划 |
| 2026-06-01 | 生产环境迁移 | 📅 计划 |

---

## 总结

### 已修复
- ✅ `TypeError: value.indexOf is not a function`
- ✅ HTML 兼容性代码与 Google Maps 冲突

### 当前状态
- ✅ 地址搜索功能正常
- ✅ 地图显示正常
- ⚠️ 使用旧版 API（仍然支持）

### 下一步
- 📅 监控 API 状态
- 📅 计划迁移到新版 API
- 📅 优化性能和配额使用

---

**最后更新**: 2026年1月15日  
**状态**: ✅ 问题已修复，功能正常
