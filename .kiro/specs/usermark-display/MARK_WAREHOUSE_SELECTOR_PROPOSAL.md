# 唛头+仓库地址选择器方案

> 增强唛头管理页面，实现唛头与仓库的双选择器，支持自由组合复制地址

## 一、功能概述

在现有唛头详情页基础上，增加仓库选择功能，用户可以：
1. 左侧选择唛头
2. 右侧选择仓库
3. 实时预览组合后的收件地址
4. 一键复制完整地址

## 二、UI 设计

### 2.1 唛头管理页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  ← 我的唛头                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 快速复制地址                                      │   │
│  │                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐           │   │
│  │  │  选择唛头  ▼    │  │  选择仓库  ▼    │           │   │
│  │  │  ABC123         │  │  广州仓         │           │   │
│  │  └─────────────────┘  └─────────────────┘           │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  收件人: ABC123 张三                         │    │   │
│  │  │  电话: 13800138000                          │    │   │
│  │  │  地址: 广东省广州市白云区xxx路xxx号          │    │   │
│  │  │  邮编: 510000                               │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              复制完整地址                     │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  我的唛头列表                                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ABC123                                    [复制]    │   │
│  │  淘宝专用                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  XYZ789                                    [复制]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 选择器下拉样式

```
┌─────────────────┐
│  选择唛头  ▼    │
├─────────────────┤
│  ✓ ABC123       │  ← 当前选中
│    XYZ789       │
│    DEF456       │
└─────────────────┘
```

## 三、数据结构

### 3.1 唛头数据 (来自 user/detail API)

```typescript
interface UserMark {
  id: number;
  mark: string;      // 唛头代码
  markdes: string;   // 唛头描述
}

// userInfo.usermark: UserMark[]
```

### 3.2 仓库数据 (来自 page/storageList API)

```typescript
interface Storage {
  shop_id: number;
  shop_name: string;    // 仓库名称
  linkman: string;      // 联系人
  phone: string;        // 电话
  address: string;      // 地址
  post: string;         // 邮编
  region?: {
    province: string;
    city: string;
    region: string;
  };
}
```

### 3.3 组件状态

```typescript
interface MarkPageState {
  marks: UserMark[];           // 用户唛头列表
  warehouses: Storage[];       // 仓库列表
  selectedMark: string;        // 选中的唛头
  selectedWarehouse: Storage | null;  // 选中的仓库
  showMarkDropdown: boolean;   // 唛头下拉显示
  showWarehouseDropdown: boolean;  // 仓库下拉显示
}
```

## 四、核心逻辑

### 4.1 地址组合规则

```javascript
const generateAddress = (mark, warehouse) => {
  if (!warehouse) return null;
  
  return {
    receiver: `${mark} ${warehouse.linkman}`,
    phone: warehouse.phone,
    address: warehouse.address,
    postcode: warehouse.post
  };
};

const formatAddressText = (addressInfo) => {
  return `收件人: ${addressInfo.receiver}
电话: ${addressInfo.phone}
地址: ${addressInfo.address}
邮编: ${addressInfo.postcode}`;
};
```

### 4.2 复制功能

```javascript
const handleCopyFullAddress = async () => {
  const addressInfo = generateAddress(selectedMark, selectedWarehouse);
  if (!addressInfo) {
    toast.error('请先选择仓库');
    return;
  }
  
  const text = formatAddressText(addressInfo);
  await navigator.clipboard.writeText(text);
  toast.success('地址已复制');
};
```

## 五、组件实现

### 5.1 MarkPage 组件结构

```jsx
// pages/Mark/Index.jsx
const MarkPage = () => {
  const [marks, setMarks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedMark, setSelectedMark] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  useEffect(() => {
    fetchUserMarks();
    fetchWarehouses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <Header title="我的唛头" />
      
      <div className="p-4 space-y-4">
        {/* 快速复制地址卡片 */}
        {marks.length > 0 && (
          <AddressCopyCard
            marks={marks}
            warehouses={warehouses}
            selectedMark={selectedMark}
            selectedWarehouse={selectedWarehouse}
            onMarkChange={setSelectedMark}
            onWarehouseChange={setSelectedWarehouse}
          />
        )}
        
        {/* 唛头列表 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">我的唛头列表</h3>
          {marks.map((item) => (
            <MarkCard key={item.id} mark={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 5.2 AddressCopyCard 组件

```jsx
const AddressCopyCard = ({
  marks,
  warehouses,
  selectedMark,
  selectedWarehouse,
  onMarkChange,
  onWarehouseChange
}) => {
  const [showMarkDropdown, setShowMarkDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  const addressInfo = selectedWarehouse ? {
    receiver: `${selectedMark} ${selectedWarehouse.linkman}`,
    phone: selectedWarehouse.phone,
    address: selectedWarehouse.address,
    postcode: selectedWarehouse.post
  } : null;

  const handleCopy = async () => {
    if (!addressInfo) {
      toast.error('请先选择仓库');
      return;
    }
    const text = `收件人: ${addressInfo.receiver}\n电话: ${addressInfo.phone}\n地址: ${addressInfo.address}\n邮编: ${addressInfo.postcode}`;
    await navigator.clipboard.writeText(text);
    toast.success('地址已复制');
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📋</span>
        <span className="font-medium text-gray-800">快速复制地址</span>
      </div>

      {/* 双选择器 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* 唛头选择器 */}
        <Dropdown
          label="选择唛头"
          value={selectedMark}
          options={marks.map(m => ({ value: m.mark, label: m.mark }))}
          onChange={onMarkChange}
          open={showMarkDropdown}
          onToggle={() => setShowMarkDropdown(!showMarkDropdown)}
        />
        
        {/* 仓库选择器 */}
        <Dropdown
          label="选择仓库"
          value={selectedWarehouse?.shop_name || ''}
          options={warehouses.map(w => ({ value: w.shop_id, label: w.shop_name, data: w }))}
          onChange={(_, data) => onWarehouseChange(data)}
          open={showWarehouseDropdown}
          onToggle={() => setShowWarehouseDropdown(!showWarehouseDropdown)}
        />
      </div>

      {/* 地址预览 */}
      {addressInfo && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
          <div><span className="text-gray-500">收件人:</span> <span className="text-gray-800">{addressInfo.receiver}</span></div>
          <div><span className="text-gray-500">电话:</span> <span className="text-gray-800">{addressInfo.phone}</span></div>
          <div><span className="text-gray-500">地址:</span> <span className="text-gray-800">{addressInfo.address}</span></div>
          <div><span className="text-gray-500">邮编:</span> <span className="text-gray-800">{addressInfo.postcode}</span></div>
        </div>
      )}

      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        disabled={!addressInfo}
        className={`w-full py-3 rounded-xl font-medium transition-all
          ${addressInfo 
            ? 'bg-primary-500 text-white active:scale-[0.98]' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        复制完整地址
      </button>
    </div>
  );
};
```

### 5.3 Dropdown 组件

```jsx
const Dropdown = ({ label, value, options, onChange, open, onToggle }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 
                   flex items-center justify-between text-sm"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || label}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg 
                        border border-gray-100 z-10 max-h-48 overflow-y-auto">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChange(opt.value, opt.data);
                onToggle();
              }}
              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50
                ${value === opt.value || value === opt.label ? 'text-primary-500 bg-primary-50' : 'text-gray-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 六、仓库地址页增强

### 6.1 Storage/Detail.jsx 修改

在仓库详情页也支持唛头选择：

```jsx
// 已实现：有唛头时显示选择器，无唛头时使用 UID
{userMarks.length > 0 && (
  <div className="pb-4 border-b border-gray-100">
    <div className="text-xs font-semibold text-gray-400 mb-2">选择唛头</div>
    <div className="flex flex-wrap gap-2">
      {userMarks.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelectedId(item.mark)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            selectedId === item.mark
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {item.mark}
        </button>
      ))}
    </div>
  </div>
)}
```

## 七、API 调用

### 7.1 获取用户唛头

```javascript
// 已在 user/detail API 中返回
const fetchUserMarks = async () => {
  const res = await request.post("user/detail&wxapp_id=10001");
  if (res.code === 1) {
    setMarks(res.data.userInfo.usermark || []);
  }
};
```

### 7.2 获取仓库列表

```javascript
const fetchWarehouses = async () => {
  const res = await request.get("page/storageList&wxapp_id=10001");
  if (Array.isArray(res.data)) {
    setWarehouses(res.data);
  }
};
```

### 7.3 获取仓库详情

```javascript
const fetchWarehouseDetail = async (id) => {
  const res = await request.get("page/storageDetails&wxapp_id=10001", { id });
  return res.data;
};
```

## 八、实施任务

| 任务 | 文件 | 说明 |
|------|------|------|
| 1. 增强唛头页面 | `src/pages/Mark/Index.jsx` | 添加双选择器和地址复制功能 |
| 2. 创建 Dropdown 组件 | `src/components/Common/Dropdown.jsx` | 通用下拉选择器 |
| 3. 创建 AddressCopyCard | `src/components/Mark/AddressCopyCard.jsx` | 地址复制卡片组件 |
| 4. 优化仓库详情页 | `src/pages/Storage/Detail.jsx` | 已完成唛头选择器 |

## 九、工时估算

| 任务 | 工时 |
|------|------|
| Dropdown 组件 | 0.5h |
| AddressCopyCard 组件 | 1h |
| 唛头页面增强 | 1h |
| 测试调试 | 0.5h |

**总计**: 约 3 小时

---

*文档版本: 1.0*
*创建日期: 2026-01-14*
