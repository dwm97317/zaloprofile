# Design Document - 包裹预报功能优化与 LINE Mini App UI 改进

## Overview

本设计文档描述了包裹预报功能的优化方案，以及将整体 UI 改造为符合 LINE Mini App 主题和泰国用户审美的详细设计。设计遵循 LINE 的设计语言，使用绿色主题色（#00B900），圆润的视觉风格，以及适合泰国用户的鲜艳配色和大字体。

## Architecture

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     LINE Mini App Frontend                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Home Page   │  │ Parcel Pages │  │  Mine Page   │     │
│  │  - 功能网格   │  │ - 单个预报    │  │  - 充值入口   │     │
│  │  - 新增入口   │  │ - 批量预报    │  │  - 优惠券     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Shared Components (LINE Theme)              │  │
│  │  - Button  - Card  - Modal  - Input  - Upload        │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      API Layer (Axios)                       │
├─────────────────────────────────────────────────────────────┤
│                   Backend API (ThinkPHP)                     │
│  - package/add (预报)  - recharge/apply (充值)              │
│  - user.coupon/lists (优惠券)  - package/claim (认领)       │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **前端框架**: React 18.2.0
- **样式方案**: Tailwind CSS 3.4.1
- **状态管理**: Recoil 0.7.7
- **路由**: React Router 6.21.2
- **国际化**: i18next + react-i18next
- **图片上传**: LIFF SDK + Axios
- **本地存储**: localStorage

## Components and Interfaces

### 1. 主题配置 (Theme Configuration)


#### 颜色系统

```javascript
// src/config/theme.js
export const lineTheme = {
  // LINE 品牌色
  primary: {
    DEFAULT: '#00B900',  // LINE 绿色
    light: '#00E600',
    dark: '#009900',
    50: '#E6F9E6',
    100: '#CCF3CC',
    200: '#99E699',
    300: '#66D966',
    400: '#33CC33',
    500: '#00B900',
    600: '#009900',
    700: '#007300',
    800: '#004D00',
    900: '#002600',
  },
  
  // 辅助色（泰国审美 - 鲜艳活泼）
  secondary: {
    orange: '#FF6B35',   // 橙色
    pink: '#FF006E',     // 粉色
    purple: '#8338EC',   // 紫色
    yellow: '#FFD60A',   // 黄色
    blue: '#00B4D8',     // 蓝色
  },
  
  // 状态色
  status: {
    success: '#00B900',
    warning: '#FFD60A',
    error: '#FF006E',
    info: '#00B4D8',
  },
  
  // 中性色
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};
```

#### 圆角系统

```javascript
// Tailwind 配置
borderRadius: {
  'none': '0',
  'sm': '8px',
  'DEFAULT': '12px',
  'md': '16px',
  'lg': '20px',
  'xl': '24px',
  '2xl': '28px',
  '3xl': '32px',
  'full': '9999px',
}
```

#### 字体系统

```javascript
// 泰语优化字体
fontSize: {
  'xs': ['12px', { lineHeight: '16px' }],
  'sm': ['14px', { lineHeight: '20px' }],
  'base': ['16px', { lineHeight: '24px' }],  // 基础字号
  'lg': ['18px', { lineHeight: '28px' }],
  'xl': ['20px', { lineHeight: '28px' }],
  '2xl': ['24px', { lineHeight: '32px' }],
  '3xl': ['30px', { lineHeight: '36px' }],
  '4xl': ['36px', { lineHeight: '40px' }],
}

fontFamily: {
  'sans': ['Noto Sans Thai', 'system-ui', 'sans-serif'],
}
```

### 2. 包裹预报组件设计

#### 2.1 预报模式选择器 (ForecastModeSelector)

```typescript
interface ForecastModeSelectorProps {
  mode: 'single' | 'batch';
  onChange: (mode: 'single' | 'batch') => void;
}

// 组件结构
<div className="flex gap-3 p-4">
  <button 
    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
      mode === 'single' 
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
        : 'bg-white text-gray-600 border-2 border-gray-200'
    }`}
  >
    单个包裹
  </button>
  <button 
    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
      mode === 'batch' 
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
        : 'bg-white text-gray-600 border-2 border-gray-200'
    }`}
  >
    多个包裹
  </button>
</div>
```


#### 2.2 单个包裹预报表单 (SingleParcelForm)

```typescript
interface SingleParcelFormData {
  warehouse_id: string;      // 仓库ID
  tracking_number: string;   // 快递单号
  mark?: string;             // 唛头（可选）
}

interface SingleParcelFormProps {
  warehouses: Warehouse[];
  onSubmit: (data: SingleParcelFormData) => Promise<void>;
}

// 表单字段
const SingleParcelForm = () => {
  return (
    <form className="space-y-6 p-4">
      {/* 仓库选择 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          เลือกคลังสินค้า *
        </label>
        <select className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 
                         focus:border-green-500 focus:ring-4 focus:ring-green-100 
                         transition-all text-base font-medium">
          <option>เลือกคลังสินค้า</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {/* 快递单号 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          หมายเลขพัสดุ *
        </label>
        <input 
          type="text"
          placeholder="กรอกหมายเลขพัสดุ"
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 
                   focus:border-green-500 focus:ring-4 focus:ring-green-100 
                   transition-all text-base font-medium"
        />
      </div>

      {/* 唛头（可选） */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          เครื่องหมาย (ไม่บังคับ)
        </label>
        <input 
          type="text"
          placeholder="กรอกเครื่องหมายพัสดุ"
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 
                   focus:border-green-500 focus:ring-4 focus:ring-green-100 
                   transition-all text-base font-medium"
        />
      </div>

      {/* 提交按钮 */}
      <button 
        type="submit"
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 
                 text-white font-bold text-lg shadow-lg shadow-green-200 
                 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] 
                 transition-all duration-200"
      >
        ยืนยันการแจ้งพัสดุ
      </button>
    </form>
  );
};
```

#### 2.3 批量包裹预报表单 (BatchParcelForm)

```typescript
interface BatchParcelFormData {
  warehouse_id: string;
  tracking_numbers: string[];  // 多个快递单号
}

interface BatchParcelFormProps {
  warehouses: Warehouse[];
  onSubmit: (data: BatchParcelFormData) => Promise<void>;
}

// 组件状态
const [trackingNumbers, setTrackingNumbers] = useState<string[]>([]);
const [currentInput, setCurrentInput] = useState('');

// 添加单号
const handleAddTracking = () => {
  if (currentInput.trim()) {
    setTrackingNumbers([...trackingNumbers, currentInput.trim()]);
    setCurrentInput('');
  }
};

// 删除单号
const handleRemoveTracking = (index: number) => {
  setTrackingNumbers(trackingNumbers.filter((_, i) => i !== index));
};

// UI 结构
<form className="space-y-6 p-4">
  {/* 仓库选择 */}
  <div>...</div>

  {/* 快递单号输入 */}
  <div>
    <label className="block text-base font-bold text-gray-800 mb-3">
      หมายเลขพัสดุ *
    </label>
    <div className="flex gap-2">
      <input 
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAddTracking()}
        placeholder="กรอกหมายเลขพัสดุ"
        className="flex-1 px-4 py-4 rounded-2xl border-2 border-gray-200 
                 focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
      <button 
        type="button"
        onClick={handleAddTracking}
        className="w-14 h-14 rounded-2xl bg-green-500 text-white font-bold text-2xl
                 hover:bg-green-600 active:scale-95 transition-all shadow-lg"
      >
        +
      </button>
    </div>
  </div>

  {/* 已添加的单号列表 */}
  {trackingNumbers.length > 0 && (
    <div className="space-y-2">
      <div className="text-sm font-bold text-gray-600">
        รายการพัสดุ ({trackingNumbers.length})
      </div>
      {trackingNumbers.map((num, idx) => (
        <div key={idx} 
             className="flex items-center justify-between p-4 bg-green-50 
                      rounded-2xl border-2 border-green-100">
          <span className="font-mono font-medium text-gray-800">{num}</span>
          <button 
            onClick={() => handleRemoveTracking(idx)}
            className="w-8 h-8 rounded-full bg-red-100 text-red-600 
                     hover:bg-red-200 transition-all"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  {/* 提交按钮 */}
  <button 
    type="submit"
    disabled={trackingNumbers.length === 0}
    className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 
             text-white font-bold text-lg shadow-lg shadow-green-200 
             disabled:opacity-50 disabled:cursor-not-allowed"
  >
    ยืนยันการแจ้งพัสดุ ({trackingNumbers.length} รายการ)
  </button>
</form>
```


### 3. 转账充值组件设计

#### 3.1 转账充值表单 (TransferRechargeForm)

```typescript
interface TransferRechargeFormData {
  transfer_date: string;      // 转账日期 YYYY-MM-DD
  transfer_time: string;      // 转账时间 HH:mm
  amount: number;             // 充值金额
  screenshots: File[];        // 转账截图（最多3张）
  remarks?: string;           // 备注
}

interface TransferRechargeFormProps {
  onSubmit: (data: TransferRechargeFormData) => Promise<void>;
}

// 组件实现
const TransferRechargeForm = () => {
  const [formData, setFormData] = useState<TransferRechargeFormData>({
    transfer_date: '',
    transfer_time: '',
    amount: 0,
    screenshots: [],
    remarks: '',
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.screenshots.length + files.length > 3) {
      alert('สามารถอัปโหลดได้สูงสุด 3 รูป');
      return;
    }

    // 压缩图片
    const compressedFiles = await Promise.all(
      files.map(file => compressImage(file, 0.8, 1920))
    );

    setFormData({
      ...formData,
      screenshots: [...formData.screenshots, ...compressedFiles]
    });

    // 生成预览
    const urls = compressedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...urls]);
  };

  return (
    <form className="space-y-6 p-4">
      {/* 日期选择 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          วันที่โอนเงิน *
        </label>
        <input 
          type="date"
          value={formData.transfer_date}
          onChange={(e) => setFormData({...formData, transfer_date: e.target.value})}
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 
                   focus:border-green-500 focus:ring-4 focus:ring-green-100 
                   text-base font-medium"
        />
      </div>

      {/* 时间选择 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          เวลาโอนเงิน *
        </label>
        <input 
          type="time"
          value={formData.transfer_time}
          onChange={(e) => setFormData({...formData, transfer_time: e.target.value})}
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 
                   focus:border-green-500 focus:ring-4 focus:ring-green-100 
                   text-base font-medium"
        />
      </div>

      {/* 金额输入 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          จำนวนเงิน (฿) *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
            ฿
          </span>
          <input 
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-200 
                     focus:border-green-500 focus:ring-4 focus:ring-green-100 
                     text-base font-bold"
          />
        </div>
      </div>

      {/* 截图上传 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          หลักฐานการโอนเงิน * (สูงสุด 3 รูป)
        </label>
        
        {/* 上传按钮 */}
        {formData.screenshots.length < 3 && (
          <label className="flex flex-col items-center justify-center w-full h-32 
                          border-2 border-dashed border-gray-300 rounded-2xl 
                          hover:border-green-500 hover:bg-green-50 
                          cursor-pointer transition-all">
            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm text-gray-500 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}

        {/* 图片预览 */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden 
                                      border-2 border-gray-200 group">
                <img src={url} alt={`Screenshot ${idx + 1}`} 
                     className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      screenshots: formData.screenshots.filter((_, i) => i !== idx)
                    });
                    setPreviewUrls(previewUrls.filter((_, i) => i !== idx));
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 
                           text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 备注 */}
      <div>
        <label className="block text-base font-bold text-gray-800 mb-3">
          หมายเหตุ (ไม่บังคับ)
        </label>
        <textarea 
          value={formData.remarks}
          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
          rows={3}
          placeholder="กรอกหมายเหตุเพิ่มเติม"
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 
                   focus:border-green-500 focus:ring-4 focus:ring-green-100 
                   text-base resize-none"
        />
      </div>

      {/* 提交按钮 */}
      <button 
        type="submit"
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 
                 text-white font-bold text-lg shadow-lg shadow-green-200 
                 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] 
                 transition-all duration-200"
      >
        ส่งคำขอเติมเงิน
      </button>
    </form>
  );
};

// 图片压缩工具函数
const compressImage = (file: File, quality: number, maxWidth: number): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```


### 4. 首页优化设计

#### 4.1 功能网格 (FeatureGrid)

```typescript
interface FeatureItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  gradient?: string;  // 渐变色
  badge?: string;     // 角标（如"新"）
}

const features: FeatureItem[] = [
  {
    id: 'forecast',
    title: 'แจ้งพัสดุ',
    icon: 'https://zhuanyun.sllowly.cn/assets/api/images/dzx_img2.png',
    route: '/order/forecast',
    gradient: 'from-green-400 to-green-500',
  },
  {
    id: 'my-parcels',
    title: 'พัสดุของฉัน',
    icon: 'https://zhuanyun.sllowly.cn/assets/api/images/dzx_img3.png',
    route: '/order',
    gradient: 'from-blue-400 to-blue-500',
  },
  {
    id: 'recharge',
    title: 'เติมเงิน',
    icon: 'https://zhuanyun.sllowly.cn/assets/api/images/dzx_img127.png',
    route: '/mine/recharge',
    gradient: 'from-orange-400 to-orange-500',
    badge: 'ใหม่',
  },
  {
    id: 'claim',
    title: 'รับพัสดุ',
    icon: 'https://zhuanyun.sllowly.cn/assets/api/images/dzx_img6.png',
    route: '/packages/claim',
    gradient: 'from-pink-400 to-pink-500',
    badge: 'ใหม่',
  },
  {
    id: 'coupon',
    title: 'คูปอง',
    icon: 'https://zhuanyun.sllowly.cn/assets/api/images/dzx_img_coupon.png',
    route: '/common/coupon',
    gradient: 'from-purple-400 to-purple-500',
    badge: 'ใหม่',
  },
  // ... 其他功能
];

// 组件实现
const FeatureGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 -mt-8 relative z-10">
      <div className="grid grid-cols-4 gap-4 bg-white p-5 rounded-3xl shadow-2xl 
                    border border-gray-50">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => navigate(feature.route)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            {/* 图标容器 */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} 
                          flex items-center justify-center overflow-hidden
                          shadow-lg group-hover:shadow-xl group-hover:scale-110 
                          group-active:scale-95 transition-all duration-200`}>
              <img 
                src={feature.icon} 
                alt={feature.title}
                className="w-10 h-10 object-contain"
              />
              
              {/* 角标 */}
              {feature.badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white 
                              text-[10px] font-bold px-1.5 py-0.5 rounded-full 
                              shadow-lg animate-pulse">
                  {feature.badge}
                </div>
              )}
            </div>

            {/* 标题 */}
            <span className="text-xs font-bold text-gray-700 text-center leading-tight
                           group-hover:text-green-600 transition-colors">
              {feature.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 4.2 顶部横幅优化 (HeroBanner)

```typescript
const HeroBanner = () => {
  return (
    <div className="relative h-56 bg-gradient-to-br from-green-500 via-green-600 to-green-700 
                  overflow-hidden">
      {/* 装饰性背景图案 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* 轮播图 */}
      <div className="flex overflow-x-auto snap-x h-full hide-scrollbar">
        {banners.map((banner, idx) => (
          <img 
            key={idx}
            src={banner.image} 
            className="w-full h-full object-cover snap-center shrink-0" 
            alt={`banner-${idx}`}
          />
        ))}
      </div>

      {/* 指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <div 
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === currentBanner 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
```


### 5. 优惠券页面优化

#### 5.1 优惠券卡片 (CouponCard)

```typescript
interface Coupon {
  id: string;
  name: string;
  discount: string;        // 折扣金额或百分比
  min_amount?: number;     // 最低消费
  expire_time: string;     // 过期时间
  status: 'unused' | 'used' | 'expired';
}

const CouponCard = ({ coupon }: { coupon: Coupon }) => {
  const getStatusColor = () => {
    switch (coupon.status) {
      case 'unused': return 'from-green-500 to-green-600';
      case 'used': return 'from-gray-400 to-gray-500';
      case 'expired': return 'from-gray-300 to-gray-400';
    }
  };

  const getStatusText = () => {
    switch (coupon.status) {
      case 'unused': return 'ใช้งาน';
      case 'used': return 'ใช้แล้ว';
      case 'expired': return 'หมดอายุ';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getStatusColor()} rounded-3xl shadow-xl 
                   overflow-hidden relative transform transition-all duration-200
                   ${coupon.status === 'unused' ? 'hover:scale-[1.02] hover:shadow-2xl' : 'opacity-75'}`}>
      <div className="flex">
        {/* 左侧：优惠信息 */}
        <div className="flex-1 p-6 text-white">
          <div className="text-4xl font-black mb-2">
            {coupon.discount}
          </div>
          <div className="text-base font-bold opacity-95 mb-1">
            {coupon.name}
          </div>
          {coupon.min_amount && (
            <div className="text-sm opacity-80">
              ขั้นต่ำ ฿{coupon.min_amount}
            </div>
          )}
          <div className="text-xs opacity-75 mt-3">
            หมดอายุ: {coupon.expire_time}
          </div>
        </div>

        {/* 右侧：使用按钮 */}
        <div className="w-28 flex items-center justify-center bg-white bg-opacity-10 relative">
          {/* 半圆切口 */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 
                        bg-gray-50 rounded-full"></div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 
                        bg-gray-50 rounded-full"></div>
          
          <button
            disabled={coupon.status !== 'unused'}
            className={`px-5 py-3 rounded-2xl text-base font-bold shadow-lg
                     transition-all duration-200
                     ${coupon.status === 'unused' 
                       ? 'bg-white text-green-600 hover:bg-gray-50 hover:scale-105 active:scale-95' 
                       : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            {getStatusText()}
          </button>
        </div>
      </div>

      {/* 虚线分隔 */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px 
                    border-t-2 border-dashed border-white opacity-20"></div>
    </div>
  );
};
```

### 6. 共享组件库

#### 6.1 LINE 风格按钮 (LineButton)

```typescript
interface LineButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const LineButton = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick 
}: LineButtonProps) => {
  const baseClasses = 'font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
    outline: 'border-2 border-green-500 text-green-600 hover:bg-green-50 active:bg-green-100',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? disabledClasses : ''}
      `}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
```

#### 6.2 LINE 风格输入框 (LineInput)

```typescript
interface LineInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'time';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const LineInput = ({
  label,
  required,
  error,
  placeholder,
  value,
  onChange,
  type = 'text',
  prefix,
  suffix,
}: LineInputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-base font-bold text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`relative flex items-center rounded-2xl border-2 transition-all
                     ${error 
                       ? 'border-red-500 ring-4 ring-red-100' 
                       : 'border-gray-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100'
                     }`}>
        {prefix && (
          <div className="pl-4 text-gray-400 font-bold">
            {prefix}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 bg-transparent outline-none text-base font-medium"
        />
        
        {suffix && (
          <div className="pr-4 text-gray-400">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
```


## Data Models

### 包裹预报数据模型

```typescript
// 单个包裹预报
interface SingleParcelForecast {
  warehouse_id: string;
  tracking_number: string;
  mark?: string;
}

// 批量包裹预报
interface BatchParcelForecast {
  warehouse_id: string;
  tracking_numbers: string[];
}

// 仓库信息
interface Warehouse {
  id: string;
  shop_name: string;
  address: string;
  phone: string;
}
```

### 转账充值数据模型

```typescript
interface TransferRecharge {
  transfer_date: string;      // YYYY-MM-DD
  transfer_time: string;      // HH:mm
  amount: number;
  screenshots: string[];      // Base64 或 URL
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
```

### 优惠券数据模型

```typescript
interface Coupon {
  id: string;
  name: string;
  discount: string;           // "฿100" 或 "20%"
  coupon_type: 10 | 20;      // 10=满减券, 20=折扣券
  min_amount?: number;
  expire_time: string;
  status: 'unused' | 'used' | 'expired';
  create_time: string;
}
```

## API Interfaces

### 包裹预报 API

```typescript
// POST /api/package/add&wxapp_id=10001
interface AddParcelRequest {
  storage_id: string;         // 仓库ID
  express_no: string;         // 快递单号
  mark?: string;              // 唛头
}

interface AddParcelResponse {
  code: number;
  msg: string;
  data: {
    order_id: string;
  };
}

// 批量预报（循环调用单个接口）
const batchAddParcels = async (data: BatchParcelForecast) => {
  const results = await Promise.all(
    data.tracking_numbers.map(tracking_number =>
      request.post('package/add&wxapp_id=10001', {
        storage_id: data.warehouse_id,
        express_no: tracking_number,
      })
    )
  );
  return results;
};
```

### 转账充值 API

```typescript
// POST /api/recharge/transfer&wxapp_id=10001
interface TransferRechargeRequest {
  transfer_date: string;
  transfer_time: string;
  amount: number;
  screenshots: string[];      // Base64 图片数组
  remarks?: string;
}

interface TransferRechargeResponse {
  code: number;
  msg: string;
  data: {
    recharge_id: string;
    status: string;
  };
}
```

### 优惠券 API

```typescript
// GET /api/user.coupon/lists&wxapp_id=10001
interface GetCouponsRequest {
  data_type: 0 | 1 | 2;  // 0=未使用, 1=已使用, 2=已过期
}

interface GetCouponsResponse {
  code: number;
  msg: string;
  data: {
    list: Coupon[];
  };
}
```

### 包裹认领 API

```typescript
// POST /api/package/claim&wxapp_id=10001
interface ClaimParcelRequest {
  package_identifier: string;  // 包裹识别码
}

interface ClaimParcelResponse {
  code: number;
  msg: string;
  data: {
    package_id: string;
  };
}
```

## Error Handling

### 错误处理策略

```typescript
// 统一错误处理
const handleApiError = (error: any) => {
  if (error.response) {
    // 服务器返回错误
    const { code, msg } = error.response.data;
    switch (code) {
      case 0:
        showToast(msg || 'เกิดข้อผิดพลาด');
        break;
      case 401:
        showToast('กรุณาเข้าสู่ระบบใหม่');
        // 跳转到登录
        break;
      default:
        showToast(msg || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    }
  } else if (error.request) {
    // 网络错误
    showToast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
  } else {
    // 其他错误
    showToast('เกิดข้อผิดพลาด');
  }
};

// Toast 通知组件
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
  // 使用 React Toast 库或自定义实现
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.className = `fixed top-20 left-1/2 -translate-x-1/2 ${colors[type]} text-white 
                    px-6 py-3 rounded-2xl shadow-2xl z-50 font-bold text-base
                    animate-in fade-in slide-in-from-top-4 duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 3秒后移除
  setTimeout(() => {
    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-4');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
```

### 表单验证

```typescript
// 包裹预报验证
const validateParcelForecast = (data: SingleParcelForecast): string | null => {
  if (!data.warehouse_id) {
    return 'กรุณาเลือกคลังสินค้า';
  }
  if (!data.tracking_number || data.tracking_number.trim().length === 0) {
    return 'กรุณากรอกหมายเลขพัสดุ';
  }
  if (data.tracking_number.length < 5) {
    return 'หมายเลขพัสดุต้องมีอย่างน้อย 5 ตัวอักษร';
  }
  return null;
};

// 转账充值验证
const validateTransferRecharge = (data: TransferRechargeFormData): string | null => {
  if (!data.transfer_date) {
    return 'กรุณาเลือกวันที่โอนเงิน';
  }
  if (!data.transfer_time) {
    return 'กรุณาเลือกเวลาโอนเงิน';
  }
  if (!data.amount || data.amount <= 0) {
    return 'กรุณากรอกจำนวนเงินที่ถูกต้อง';
  }
  if (data.screenshots.length === 0) {
    return 'กรุณาอัปโหลดหลักฐานการโอนเงิน';
  }
  return null;
};
```


## Testing Strategy

### 单元测试

使用 Jest 和 React Testing Library 进行组件测试：

```typescript
// LineButton.test.tsx
describe('LineButton', () => {
  it('renders with primary variant', () => {
    render(<LineButton variant="primary">Click me</LineButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<LineButton onClick={handleClick}>Click me</LineButton>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<LineButton disabled>Click me</LineButton>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});

// SingleParcelForm.test.tsx
describe('SingleParcelForm', () => {
  it('validates required fields', async () => {
    render(<SingleParcelForm warehouses={mockWarehouses} onSubmit={jest.fn()} />);
    
    fireEvent.click(screen.getByText('ยืนยันการแจ้งพัสดุ'));
    
    await waitFor(() => {
      expect(screen.getByText('กรุณาเลือกคลังสินค้า')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const handleSubmit = jest.fn();
    render(<SingleParcelForm warehouses={mockWarehouses} onSubmit={handleSubmit} />);
    
    // 填写表单
    fireEvent.change(screen.getByLabelText(/เลือกคลังสินค้า/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/หมายเลขพัสดุ/), { target: { value: 'ABC123456' } });
    
    fireEvent.click(screen.getByText('ยืนยันการแจ้งพัสดุ'));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        warehouse_id: '1',
        tracking_number: 'ABC123456',
      });
    });
  });
});
```

### 集成测试

测试完整的用户流程：

```typescript
// ParcelForecast.integration.test.tsx
describe('Parcel Forecast Flow', () => {
  it('completes single parcel forecast flow', async () => {
    render(<App />);
    
    // 1. 导航到预报页面
    fireEvent.click(screen.getByText('แจ้งพัสดุ'));
    
    // 2. 选择单个包裹模式
    fireEvent.click(screen.getByText('单个包裹'));
    
    // 3. 填写表单
    fireEvent.change(screen.getByLabelText(/เลือกคลังสินค้า/), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/หมายเลขพัสดุ/), { target: { value: 'TEST123' } });
    
    // 4. 提交
    fireEvent.click(screen.getByText('ยืนยันการแจ้งพัสดุ'));
    
    // 5. 验证成功消息
    await waitFor(() => {
      expect(screen.getByText(/สำเร็จ/)).toBeInTheDocument();
    });
  });

  it('completes batch parcel forecast flow', async () => {
    render(<App />);
    
    // 1. 导航到预报页面
    fireEvent.click(screen.getByText('แจ้งพัสดุ'));
    
    // 2. 选择批量模式
    fireEvent.click(screen.getByText('多个包裹'));
    
    // 3. 选择仓库
    fireEvent.change(screen.getByLabelText(/เลือกคลังสินค้า/), { target: { value: '1' } });
    
    // 4. 添加多个单号
    const input = screen.getByPlaceholderText(/กรอกหมายเลขพัสดุ/);
    const addButton = screen.getByText('+');
    
    fireEvent.change(input, { target: { value: 'TEST001' } });
    fireEvent.click(addButton);
    
    fireEvent.change(input, { target: { value: 'TEST002' } });
    fireEvent.click(addButton);
    
    // 5. 提交
    fireEvent.click(screen.getByText(/ยืนยันการแจ้งพัสดุ/));
    
    // 6. 验证成功
    await waitFor(() => {
      expect(screen.getByText(/สำเร็จ/)).toBeInTheDocument();
    });
  });
});
```

### E2E 测试

使用 Playwright 进行端到端测试：

```typescript
// e2e/parcel-forecast.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Parcel Forecast', () => {
  test('should complete single parcel forecast', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 点击预报入口
    await page.click('text=แจ้งพัสดุ');
    
    // 选择单个包裹
    await page.click('text=单个包裹');
    
    // 填写表单
    await page.selectOption('select', '1');
    await page.fill('input[placeholder*="กรอกหมายเลขพัสดุ"]', 'TEST123456');
    
    // 提交
    await page.click('text=ยืนยันการแจ้งพัสดุ');
    
    // 验证成功消息
    await expect(page.locator('text=สำเร็จ')).toBeVisible();
  });

  test('should upload transfer screenshot', async ({ page }) => {
    await page.goto('http://localhost:3000/mine/recharge');
    
    // 填写日期和金额
    await page.fill('input[type="date"]', '2025-01-10');
    await page.fill('input[type="time"]', '14:30');
    await page.fill('input[type="number"]', '1000');
    
    // 上传截图
    await page.setInputFiles('input[type="file"]', 'test-screenshot.jpg');
    
    // 验证预览
    await expect(page.locator('img[alt*="Screenshot"]')).toBeVisible();
    
    // 提交
    await page.click('text=ส่งคำขอเติมเงิน');
    
    // 验证成功
    await expect(page.locator('text=สำเร็จ')).toBeVisible();
  });
});
```

### 性能测试

```typescript
// 图片压缩性能测试
describe('Image Compression Performance', () => {
  it('compresses large image within 2 seconds', async () => {
    const largeImage = new File([new ArrayBuffer(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    const startTime = performance.now();
    const compressed = await compressImage(largeImage, 0.8, 1920);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(2000);
    expect(compressed.size).toBeLessThan(2 * 1024 * 1024);
  });
});

// 批量预报性能测试
describe('Batch Forecast Performance', () => {
  it('handles 10 parcels within 5 seconds', async () => {
    const trackingNumbers = Array.from({ length: 10 }, (_, i) => `TEST${i}`);
    
    const startTime = performance.now();
    await batchAddParcels({
      warehouse_id: '1',
      tracking_numbers: trackingNumbers,
    });
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

## 动画和过渡效果

### Tailwind 动画配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
};
```

### 页面过渡动画

```typescript
// 使用 Framer Motion
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};
```

## 国际化配置

### 泰语翻译文件

```json
// src/locales/th.json
{
  "parcel_forecast": {
    "title": "แจ้งพัสดุ",
    "single_mode": "พัสดุเดี่ยว",
    "batch_mode": "หลายพัสดุ",
    "warehouse": "คลังสินค้า",
    "tracking_number": "หมายเลขพัสดุ",
    "mark": "เครื่องหมาย",
    "add_tracking": "เพิ่มหมายเลข",
    "submit": "ยืนยันการแจ้งพัสดุ",
    "success": "แจ้งพัสดุสำเร็จ",
    "error": "เกิดข้อผิดพลาด"
  },
  "recharge": {
    "title": "เติมเงิน",
    "transfer_date": "วันที่โอนเงิน",
    "transfer_time": "เวลาโอนเงิน",
    "amount": "จำนวนเงิน",
    "screenshot": "หลักฐานการโอนเงิน",
    "remarks": "หมายเหตุ",
    "submit": "ส่งคำขอเติมเงิน",
    "success": "ส่งคำขอสำเร็จ รอการตรวจสอบ"
  },
  "coupon": {
    "title": "คูปอง",
    "unused": "ยังไม่ใช้",
    "used": "ใช้แล้ว",
    "expired": "หมดอายุ",
    "use_now": "ใช้งาน",
    "min_amount": "ขั้นต่ำ"
  }
}
```

## 部署和优化

### 构建优化

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['recoil', 'i18next', 'react-i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@line/liff'],
  },
};
```

### 图片优化

- 使用 WebP 格式
- 懒加载图片
- 响应式图片
- CDN 加速

### 性能指标

- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.5s
- Cumulative Layout Shift (CLS) < 0.1

---

## 总结

本设计文档详细描述了包裹预报功能优化和 LINE Mini App UI 改进的完整方案。设计遵循 LINE 的设计语言，使用绿色主题色，圆润的视觉风格，以及适合泰国用户的鲜艳配色和大字体。所有组件都经过精心设计，确保良好的用户体验和性能表现。

