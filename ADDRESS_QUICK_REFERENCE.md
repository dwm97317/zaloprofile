# 📍 地址地图功能 - 快速参考

## 🚀 快速开始

```bash
# 启动开发服务器
cd D:\2025profile\zalo_mini_app-master
npm start

# 访问页面
https://localhost:9000/address/create-map
```

---

## 📁 文件位置

| 文件 | 路径 |
|------|------|
| 地图组件 | `src/components/InteractiveMapPicker/index.jsx` |
| 增强版页面 | `src/pages/Address/CreateWithMap.jsx` |
| 原版页面 | `src/pages/Address/Create.jsx` |
| 地址解析 | `src/utils/addressParser.js` |
| 路由配置 | `src/components/app.jsx` |

---

## 🔗 路由

```javascript
// 增强版 (带地图)
navigate("/address/create-map");

// 原版 (不带地图)
navigate("/address/create");
```

---

## 🎯 核心 API

### InteractiveMapPicker 组件

```javascript
import InteractiveMapPicker from '../components/InteractiveMapPicker';

<InteractiveMapPicker
  initialLat={13.7563}
  initialLng={100.5018}
  onLocationSelect={(data) => {
    console.log('Selected:', data);
    // data: { province, city, sub_district, postal_code, detail, coordinates }
  }}
/>
```

---

### reverseGeocodeThai 函数

```javascript
import { reverseGeocodeThai } from '../utils/addressParser';

const addressData = await reverseGeocodeThai(lat, lng);
// 返回: { province, city, sub_district, postal_code, detail, coordinates }
```

---

## 🎨 UI 组件

### 地图展开/收起

```javascript
const [showMap, setShowMap] = useState(false);

<button onClick={() => setShowMap(!showMap)}>
  {showMap ? "ซ่อนแผนที่" : "เลือกจากแผนที่"}
</button>

<AnimatePresence>
  {showMap && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      <InteractiveMapPicker />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 📊 数据结构

### 地址表单

```javascript
const form = {
  name: "",              // 姓名 *
  phone: "",             // 电话 *
  telcode: "66",         // 国家代码
  province: "",          // 省份 *
  city: "",              // 区/县
  sub_district: "",      // 街道/乡
  postal_code: "",       // 邮编
  detail: "",            // 详细地址
  identitycard: "",      // 身份证
  clearancecode: "",     // 清关码
  latitude: 13.7563,     // 纬度
  longitude: 100.5018,   // 经度
  country_id: 2          // 国家ID (泰国)
};
```

---

### 地址数据 (API 返回)

```javascript
const addressData = {
  province: "กรุงเทพมหานคร",      // 省份
  city: "บางกะปิ",                // 区/县
  sub_district: "หัวหมาก",        // 街道/乡
  postal_code: "10240",           // 邮编
  detail: "ถนนรามคำแหง",          // 详细地址
  coordinates: {
    lat: 13.7563,                 // 纬度
    lng: 100.5018                 // 经度
  }
};
```

---

## 🔧 常用代码片段

### 1. 地图点击事件

```javascript
map.addListener('click', async (e) => {
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();
  marker.setPosition(e.latLng);
  await handleReverseGeocode(lat, lng);
});
```

---

### 2. 标记拖拽事件

```javascript
marker.addListener('dragend', async (e) => {
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();
  map.panTo(e.latLng);
  await handleReverseGeocode(lat, lng);
});
```

---

### 3. 获取当前位置

```javascript
navigator.geolocation.getCurrentPosition(
  async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    map.panTo({ lat, lng });
    map.setZoom(16);
    marker.setPosition({ lat, lng });
    
    await handleReverseGeocode(lat, lng);
  },
  (error) => {
    alert("无法获取位置");
  }
);
```

---

### 4. 表单自动填充

```javascript
const handleLocationSelect = (data) => {
  setForm(prev => ({
    ...prev,
    province: data.province || prev.province,
    city: data.city || prev.city,
    sub_district: data.sub_district || prev.sub_district,
    postal_code: data.postal_code || prev.postal_code,
    detail: data.detail || prev.detail,
    latitude: data.coordinates?.lat || prev.latitude,
    longitude: data.coordinates?.lng || prev.longitude
  }));
};
```

---

### 5. 表单提交

```javascript
const handleSubmit = async () => {
  // 验证
  if (!form.name || !form.phone || !form.province) {
    alert("请填写必填字段");
    return;
  }

  // 构建数据
  const regionStr = `Thailand,${form.province},${form.city},${form.sub_district}`;
  const payload = {
    ...form,
    region: regionStr,
    userstree: form.detail,
  };

  // 提交
  const res = await request.post("address/add&wxapp_id=10001", payload);
  if (res.code === 1) {
    alert("保存成功");
    navigate(-1);
  }
};
```

---

## 🎯 测试用例

### 测试坐标

```javascript
// 曼谷市中心
{ lat: 13.7563, lng: 100.5018 }

// 素万那普机场
{ lat: 13.6900, lng: 100.7501 }

// 芭提雅
{ lat: 12.9236, lng: 100.8825 }

// 清迈
{ lat: 18.7883, lng: 98.9853 }
```

---

### 测试关键词

```javascript
// 地址搜索
"สยามพารากอน"        // Siam Paragon
"สนามบินสุวรรณภูมิ"    // Suvarnabhumi Airport
"ถนนข้าวสาร"          // Khao San Road
"เซ็นทรัลเวิลด์"      // Central World
```

---

## 🐛 调试技巧

### 1. 检查 Google Maps 加载

```javascript
console.log('Google Maps:', window.google?.maps);
```

---

### 2. 测试反向地理编码

```javascript
const test = async () => {
  const data = await reverseGeocodeThai(13.7563, 100.5018);
  console.log('Address:', data);
};
test();
```

---

### 3. 监控地图事件

```javascript
map.addListener('click', (e) => {
  console.log('Clicked:', e.latLng.lat(), e.latLng.lng());
});

marker.addListener('dragend', (e) => {
  console.log('Dragged:', e.latLng.lat(), e.latLng.lng());
});
```

---

### 4. 检查表单数据

```javascript
console.log('Form:', form);
console.log('Payload:', payload);
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `ADDRESS_IMPLEMENTATION_SUMMARY.md` | 实现总结 |
| `ADDRESS_TESTING_GUIDE.md` | 测试指南 |
| `ADDRESS_FEATURE_COMPARISON.md` | 功能对比 |
| `ADDRESS_MAP_IMPLEMENTATION_COMPLETE.md` | 详细实现 |

---

## 🔗 有用链接

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 💡 提示

### 性能优化

```javascript
// 防抖处理
const debouncedGeocode = debounce(handleReverseGeocode, 500);

// 缓存结果
const geocodeCache = new Map();
```

---

### 错误处理

```javascript
try {
  const data = await reverseGeocodeThai(lat, lng);
  // 使用数据
} catch (error) {
  console.error('Error:', error);
  // 返回默认值
  return { province: "", city: "", ... };
}
```

---

### 用户体验

```javascript
// 加载状态
const [isLoading, setIsLoading] = useState(false);

// 错误提示
const [error, setError] = useState(null);

// 成功提示
const [success, setSuccess] = useState(false);
```

---

**最后更新**: 2026年1月15日
