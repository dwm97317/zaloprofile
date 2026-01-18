# 前端缓存与请求优化方案 (修订版)

## 1. 问题背景
用户反馈页面加载时存在多次重复请求，导致数据阻塞和体验不佳。当前前端直接使用 axios 发起请求，缺乏缓存机制和防抖处理。

## 2. 目标
*   **防止重复请求**: 拦截短时间内发起的重复请求，复用正在进行的 Promise。
*   **数据缓存**: 对静态或低频数据（Banner、Config）进行内存缓存。
*   **内存安全**: 防止缓存无限增长导致内存泄漏。
*   **兼容性**: 保证现有 API 调用方式不变。

## 3. 技术方案

### 3.1 改造 `src/utils/request.js`

在现有的 Axios 封装层增加以下模块：

1.  **Pending Request Map**: 记录正在进行中的请求 Promise。
2.  **LRU Cache (新增)**: 使用 LRU (最近最少使用) 策略管理的缓存 Map，替代简单的 Map，以解决 Review 中提到的内存增长问题。
3.  **Stable Key Generation**: 优化 Key 生成逻辑，确保对象参数顺序不影响 Key 的一致性。

### 3.2 接口定义

修改 `request.get` 方法签名，支持 options 参数：

```javascript
/**
 * @param {string} url
 * @param {object} params
 * @param {object} options
 * @param {boolean} [options.cache=false] - 是否开启缓存
 * @param {number} [options.ttl=60000] - 缓存时间(ms)
 * @param {boolean} [options.force=false] - 强制刷新
 */
get(url, params, options = {})
```

### 3.3 关键改进 (基于 Review)

1.  **引入 SimpleLRUCache**: 实现一个简单的 LRU 缓存类，设置最大容量（如 100）。
2.  **优化 Key 生成**: 如果项目未引入 `qs`，实现一个简单的对象属性排序序列化函数。

### 3.4 实施步骤

1.  **完善 `src/utils/request.js`**:
    *   实现 `SimpleLRUCache` 类。
    *   优化 `generateKey` 函数。
    *   更新 `request.get` 逻辑使用 LRU Cache。

2.  **应用到关键页面**:
    *   **Home/Index.jsx**: 已应用（Banner: 5min, CustomerContact: 10min）。
    *   **Package/Forecast.jsx**: 开启短缓存 (TTL: 10s) 避免列表页切换时的闪烁。
    *   **Order/Index.jsx**: 开启短缓存 (TTL: 10s)。

## 4. 验证计划
*   **内存测试**: 模拟 1000 个不同 URL 请求，验证 Cache Map 大小是否限制在 100。
*   **并发测试**: 快速连续点击 Tab，验证是否只发出一个网络请求。
