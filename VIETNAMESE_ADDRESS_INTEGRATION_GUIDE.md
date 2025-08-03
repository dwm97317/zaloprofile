# 🇻🇳 越南地址功能集成指南

## 📋 功能概述

本系统为zalo小程序集成了完整的越南地址功能，包括：

- ✅ **地址自动补全** - 基于Goong API的智能地址搜索
- ✅ **地图选点** - 点击地图获取精确地址
- ✅ **地址层级排序** - 省/市 → 区/县 → 坊/社 → 街道 → 门牌号
- ✅ **地址验证** - 符合越南地址标准格式
- ✅ **响应式设计** - 适配移动端和桌面端

## 🏗️ 系统架构

```
Backend (ThinkPHP)
├── GoongApi.php - Goong API集成类
├── GoongAddress.php - 地址API控制器
└── API路由配置

Frontend (UniApp/H5)
├── vietnamese-address-component.js - 原生JS组件
├── vietnamese-address-integration.js - UniApp集成
├── vietnamese-address-demo.vue - Vue页面示例
└── vietnamese-address-form.html - HTML表单示例
```

## 🚀 快速开始

### 1. 后端配置

#### a. 配置API路由
在 `source/route/api.php` 中添加：

```php
// Goong地址API路由
Route::group('goong-address', function () {
    Route::get('autocomplete', 'GoongAddress/autocomplete');
    Route::get('place-detail', 'GoongAddress/placeDetail'); 
    Route::get('reverse-geocode', 'GoongAddress/reverseGeocode');
    Route::get('geocode', 'GoongAddress/geocode');
    Route::get('provinces', 'GoongAddress/getProvinces');
    Route::post('validate', 'GoongAddress/validateAddress');
});
```

#### b. 配置API密钥
在 `source/application/common/library/GoongApi/GoongApi.php` 中确认API密钥：
```php
private $apiKey = '5uo0DOu7oFhOoqtxFhyZemwhmkI0XiFTiq66c0Nj';
```

### 2. 前端集成

#### 方式一：在UniApp页面中使用（推荐）

```vue
<template>
  <view class="address-page">
    <!-- 地址搜索 -->
    <input 
      placeholder="Nhập địa chỉ để tìm kiếm..."
      @input="onSearchInput"
      v-model="searchQuery"
    />
    
    <!-- 地图 -->
    <map 
      id="vietnameseMap"
      :latitude="mapCenter.lat"
      :longitude="mapCenter.lng"
      @tap="onMapClick"
    />
    
    <!-- 地址表单 -->
    <view class="form-section">
      <input v-model="addressFormData.province" placeholder="Tỉnh/Thành phố" />
      <input v-model="addressFormData.district" placeholder="Quận/Huyện" />
      <input v-model="addressFormData.ward" placeholder="Phường/Xã" />
      <!-- 更多字段... -->
    </view>
  </view>
</template>

<script>
import { vietnameseAddressMixin } from '@/utils/vietnamese-address-integration.js';

export default {
  mixins: [vietnameseAddressMixin],
  // 其他配置...
};
</script>
```

#### 方式二：在H5页面中使用

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vietnamese Address</title>
    <script src="vietnamese-address-component.js"></script>
</head>
<body>
    <div id="address-autocomplete"></div>
    <div id="address-map"></div>
    
    <script>
        const addressComponent = new VietnameseAddressComponent({
            mapContainer: 'address-map',
            autocompleteContainer: 'address-autocomplete'
        });
    </script>
</body>
</html>
```

## 📚 API接口文档

### 地址自动补全
```
GET /api/goong-address/autocomplete
参数:
- input: 搜索关键词 (必填)
- limit: 结果数量限制 (默认10)
- lat: 用户纬度 (可选)
- lng: 用户经度 (可选)

返回:
{
  "code": 1,
  "data": {
    "suggestions": [
      {
        "place_id": "地点ID",
        "description": "地址描述",
        "structured_formatting": {
          "main_text": "主要文本",
          "secondary_text": "次要文本"
        }
      }
    ]
  }
}
```

### 获取地点详情
```
GET /api/goong-address/place-detail
参数:
- place_id: 地点ID (必填)

返回:
{
  "code": 1,
  "data": {
    "place": {
      "formatted_address": "完整地址",
      "vietnamese_address": {
        "province": "省/市",
        "district": "区/县", 
        "ward": "坊/社",
        "street": "街道",
        "house_number": "门牌号"
      },
      "geometry": {
        "location": {
          "lat": 纬度,
          "lng": 经度
        }
      }
    }
  }
}
```

### 反向地理编码
```
GET /api/goong-address/reverse-geocode
参数:
- lat: 纬度 (必填)
- lng: 经度 (必填)

返回: 与地点详情相同格式
```

## 🎯 使用场景

### 1. 订单地址填写
```javascript
// 在订单页面中集成地址选择
const vietnameseAddress = new UniAppVietnameseAddress();

// 监听地址选择
document.addEventListener('vietnameseAddressSelected', function(event) {
    const addressData = event.detail;
    // 自动填充订单地址表单
    fillOrderAddressForm(addressData.vietnamese_address);
});
```

### 2. 用户地址管理
```javascript
// 在地址管理页面中使用
export default {
    mixins: [vietnameseAddressMixin],
    methods: {
        async saveUserAddress() {
            if (this.validateAddressForm()) {
                const addressData = this.getFormattedAddress();
                await this.saveToUserAddressBook(addressData);
            }
        }
    }
};
```

### 3. 配送地址验证
```javascript
// 验证配送地址的完整性
const isValidAddress = await vietnameseAddress.validateAddress({
    province: 'Hồ Chí Minh',
    district: 'Quận 1', 
    ward: 'Phường Bến Nghé'
});
```

## 🔧 配置选项

### VietnameseAddressComponent配置
```javascript
const options = {
    apiKey: 'your-goong-api-key',           // Goong API密钥
    apiBaseUrl: '/api/goong-address',        // API基础URL
    mapContainer: 'address-map',             // 地图容器ID
    autocompleteContainer: 'address-autocomplete', // 搜索容器ID
    defaultCenter: [105.8342, 21.0278],     // 默认地图中心（河内）
    defaultZoom: 12,                        // 默认缩放级别
    debug: true                             // 调试模式
};
```

### UniApp集成配置
```javascript
const vietnameseAddress = new UniAppVietnameseAddress({
    mapId: 'vietnameseMap',                 // UniApp地图组件ID
    apiBaseUrl: '/api/goong-address'        // API基础URL
});
```

## 🎨 样式定制

### CSS类名说明
```css
.address-suggestions        /* 地址建议列表 */
.address-suggestion-item    /* 单个地址建议项 */
.main-text                  /* 主要地址文本 */
.secondary-text             /* 次要地址文本 */
.autocomplete-container     /* 自动补全容器 */
```

### 自定义样式示例
```css
.address-suggestions {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.address-suggestion-item:hover {
    background-color: #f0f8ff;
}
```

## 🛠️ 调试指南

### 开启调试模式
```javascript
const addressComponent = new VietnameseAddressComponent({
    debug: true  // 开启调试日志
});
```

### 常见问题

#### 1. API请求失败
```javascript
// 检查网络连接和API密钥
console.log('API Base URL:', addressComponent.options.apiBaseUrl);
console.log('API Key:', addressComponent.options.apiKey);
```

#### 2. 地图不显示
```javascript
// 确保Goong JS库已正确加载
if (typeof goongjs === 'undefined') {
    console.error('Goong JS库未加载');
}
```

#### 3. 地址解析错误
```javascript
// 检查返回的地址组件
console.log('Address Components:', addressData.address_components);
```

### 调试工具
```javascript
// 获取当前环境信息
window.vietnameseAddressDebug = {
    getEnvInfo: () => ({
        isUniApp: typeof uni !== 'undefined',
        hasGoongJS: typeof goongjs !== 'undefined',
        apiBaseUrl: addressComponent.options.apiBaseUrl
    }),
    
    testAPI: async (endpoint) => {
        const response = await fetch(`/api/goong-address/${endpoint}`);
        return response.json();
    }
};
```

## 📱 移动端优化

### 触摸优化
- 增大点击区域
- 添加触摸反馈
- 优化滚动性能

### 网络优化
- 请求防抖
- 结果缓存
- 离线降级

### 用户体验
- 加载状态提示
- 错误重试机制
- 智能默认值

## 🔒 安全考虑

### API密钥保护
- 后端代理API请求
- 域名限制
- 频率限制

### 数据验证
- 前端输入验证
- 后端数据清洗
- SQL注入防护

## 📈 性能监控

### 关键指标
- API响应时间
- 地址搜索成功率
- 用户操作完成率

### 埋点示例
```javascript
// 记录地址选择事件
document.addEventListener('vietnameseAddressSelected', function(event) {
    // 发送统计数据
    analytics.track('address_selected', {
        method: 'search', // 或 'map_click'
        address_type: event.detail.types,
        response_time: Date.now() - searchStartTime
    });
});
```

## 🔄 更新日志

### v1.0.0 (2025-01-XX)
- ✅ 基础地址搜索功能
- ✅ 地图选点功能
- ✅ UniApp集成
- ✅ 地址验证
- ✅ 响应式设计

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 📞 技术支持

如有问题，请参考：
- 📖 [Goong API文档](https://docs.goong.io/)
- 🐛 提交Issue到项目仓库
- 💬 联系技术支持团队

---

*最后更新: 2025年1月* 