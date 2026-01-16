# 包裹读取性能优化需求文档

## 问题分析

### 当前性能瓶颈

1. **后端问题**
   - `outside()` API 调用 `getPackItemList()` 进行额外的数据处理
   - 每次请求都查询完整的包裹数据，没有分页
   - 查询字段过多，包含不必要的字段
   - 没有使用索引优化

2. **前端问题**
   - 每次切换tab都重新加载所有数据
   - 没有数据缓存机制
   - 没有虚拟滚动，大量数据时渲染慢
   - 图片加载没有懒加载

3. **数据库问题**
   - 可能缺少必要的索引
   - 查询条件没有优化

## 优化方案

### 1. 后端优化

#### 1.1 添加分页支持
```php
public function outside(){
    $page = request()->get('page', 1);
    $pageSize = request()->get('page_size', 20);
    
    // 使用分页查询
    $data = (new PackageModel())
        ->where($where)
        ->field($field)
        ->page($page, $pageSize)
        ->order('created_time DESC')
        ->select();
}
```

#### 1.2 优化字段查询
- 只查询必要字段
- 延迟加载图片数据

#### 1.3 添加缓存
- 使用Redis缓存包裹统计数据
- 缓存时间：5分钟

### 2. 前端优化

#### 2.1 添加数据缓存
```javascript
const [cache, setCache] = useState({});

const fetchOrderList = async (params) => {
  const cacheKey = `${tab}_${searchText}`;
  if (cache[cacheKey] && !params?.forceRefresh) {
    setList(cache[cacheKey]);
    return;
  }
  // ... fetch data
  setCache(prev => ({ ...prev, [cacheKey]: data }));
};
```

#### 2.2 实现虚拟滚动
- 使用 `react-window` 或 `react-virtualized`
- 只渲染可见区域的包裹

#### 2.3 图片懒加载
- 使用 `Intersection Observer`
- 添加占位符

#### 2.4 防抖搜索
- 搜索输入添加防抖，减少API调用

### 3. 数据库优化

#### 3.1 添加索引
```sql
-- 复合索引
ALTER TABLE package ADD INDEX idx_member_status_delete (member_id, status, is_delete, created_time);

-- 单字段索引
ALTER TABLE package ADD INDEX idx_express_num (express_num);
```

#### 3.2 查询优化
- 使用 EXPLAIN 分析查询
- 避免 SELECT *

## 实施计划

### Phase 1: 后端优化（高优先级）
1. 添加分页支持
2. 优化字段查询
3. 添加数据库索引

### Phase 2: 前端优化（中优先级）
1. 添加数据缓存
2. 实现防抖搜索
3. 图片懒加载

### Phase 3: 高级优化（低优先级）
1. 虚拟滚动
2. Redis缓存
3. CDN加速图片

## 预期效果

- 首次加载时间：从 2-3秒 降至 0.5-1秒
- 切换tab时间：从 1-2秒 降至 0.1-0.3秒
- 搜索响应时间：从 1秒 降至 0.3秒
- 内存占用：减少 50%
