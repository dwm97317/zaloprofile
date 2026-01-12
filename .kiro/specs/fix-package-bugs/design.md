# Package Application and Status Bugs - Design Document

## Architecture Overview

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Order/Package.jsx (List + Selection)                       │
│  ├─ Package Selection UI                                     │
│  ├─ Status Display (Fixed)                                   │
│  └─ Statistics (Fixed)                                       │
│                                                              │
│  Packages/Pack.jsx (Packing Application)                    │
│  ├─ Selected Packages Display                               │
│  ├─ Line Selection                                          │
│  ├─ Address Selection                                       │
│  ├─ Packing Services Selection                             │
│  └─ Submit Button                                           │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (ThinkPHP)                      │
├─────────────────────────────────────────────────────────────┤
│  Package Controller                                          │
│  ├─ unpack() - Get unpacked packages                        │
│  ├─ postPack() - Submit packing application                 │
│  ├─ countpack() - Get status counts (FIXED)                 │
│  └─ outside() - Get packages by status (FIXED)              │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Package Status Enum
```javascript
const PackageStatus = {
  NOT_RECEIVED: 1,        // 未入库
  RECEIVED: 2,            // 已入库
  PENDING_VERIFY: 3,      // 待查验
  VERIFIED: 4,            // 已查验
  PENDING_PACK: 5,        // 待打包
  PACKED: 6,              // 已打包
  PENDING_PAYMENT: 7,     // 待支付
  SHIPPED: 8,             // 已发货
  ISSUE: -1               // 问题件
};
```

### Package Data Structure
```typescript
interface Package {
  id: number;
  order_sn: string;
  express_num: string;
  status: number;
  storage_id: number;
  storage?: {
    shop_name: string;
  };
  country_id: number;
  country?: {
    title: string;
  };
  class_name: string;
  created_time: string;
  weight?: number;
  remark?: string;
  source: number;
}
```

### Packing Application Data
```typescript
interface PackingApplication {
  packids: string;        // Comma-separated package IDs
  line_id: number;        // Shipping line ID
  address_id: number;     // Delivery address ID
  pack_ids?: string;      // Comma-separated packing service IDs
  remark?: string;        // User remarks
  waitreceivedmoney?: number; // COD amount
}
```

## Component Design

### 1. Order/Package.jsx (Enhanced)

#### State Management
```javascript
const [list, setList] = useState([]);
const [tab, setTab] = useState(1);
const [loading, setLoading] = useState(false);
const [count, setCount] = useState({
  nocount: 0,    // status=1
  yescount: 0,   // status=2
  yessend: 0,    // status=8 (FIXED)
  procount: 0    // status=-1
});
const [selectedPackages, setSelectedPackages] = useState([]); // NEW
const [selectionMode, setSelectionMode] = useState(false);    // NEW
```

#### New Functions
```javascript
// Toggle selection mode
const toggleSelectionMode = () => {
  setSelectionMode(!selectionMode);
  setSelectedPackages([]);
};

// Toggle package selection
const togglePackageSelection = (packageId) => {
  setSelectedPackages(prev => {
    if (prev.includes(packageId)) {
      return prev.filter(id => id !== packageId);
    } else {
      return [...prev, packageId];
    }
  });
};

// Navigate to packing page
const handleApplyPacking = () => {
  if (selectedPackages.length === 0) {
    toast.error(t("package.error.no_selection"));
    return;
  }
  
  // Store selected packages in Recoil state
  setPackageIds(selectedPackages);
  navigate("/packages/pack");
};

// Get status text with correct mapping
const getStatusText = (status) => {
  const statusMap = {
    1: t("package.status.not_received"),
    2: t("package.status.received"),
    3: t("package.status.pending_verify"),
    4: t("package.status.verified"),
    5: t("package.status.pending_pack"),
    6: t("package.status.packed"),
    7: t("package.status.pending_payment"),
    8: t("package.status.shipped"),
    -1: t("package.status.issue")
  };
  return statusMap[status] || t("package.status.unknown");
};
```

#### UI Changes
```jsx
{/* Selection Mode Toggle Button */}
{tab === 2 && list.length > 0 && (
  <div className="px-4 py-2 bg-white border-b">
    <button
      onClick={toggleSelectionMode}
      className="w-full py-2 rounded-xl bg-primary-500 text-white font-bold"
    >
      {selectionMode 
        ? t("package.cancel_selection") 
        : t("package.apply_packing")}
    </button>
  </div>
)}

{/* Selection Mode Actions */}
{selectionMode && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
    <div className="flex gap-3">
      <button
        onClick={toggleSelectionMode}
        className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold"
      >
        {t("common.cancel")}
      </button>
      <button
        onClick={handleApplyPacking}
        className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-bold"
        disabled={selectedPackages.length === 0}
      >
        {t("package.confirm_packing")} ({selectedPackages.length})
      </button>
    </div>
  </div>
)}

{/* Package Item with Selection Checkbox */}
<div className="relative">
  {selectionMode && (
    <div className="absolute top-4 left-4 z-10">
      <input
        type="checkbox"
        checked={selectedPackages.includes(item.id)}
        onChange={() => togglePackageSelection(item.id)}
        className="w-5 h-5 rounded border-2 border-primary-500"
      />
    </div>
  )}
  {/* Rest of package item UI */}
</div>
```

### 2. Packages/Pack.jsx (New Component)

#### Component Structure
```jsx
const PackingApplicationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const packageIds = useRecoilValue(packageIdsState);
  
  const [packages, setPackages] = useState([]);
  const [lines, setLines] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [packServices, setPackServices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    line_id: "",
    address_id: "",
    pack_ids: [],
    remark: "",
    waitreceivedmoney: 0
  });
  
  useEffect(() => {
    if (!packageIds || packageIds.length === 0) {
      toast.error(t("package.error.no_packages"));
      navigate("/order/package");
      return;
    }
    
    fetchPackageDetails();
    fetchLines();
    fetchAddresses();
    fetchPackServices();
  }, []);
  
  const fetchPackageDetails = async () => {
    // Fetch details of selected packages
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.line_id) {
      toast.error(t("package.error.select_line"));
      return;
    }
    
    if (!form.address_id) {
      toast.error(t("package.error.select_address"));
      return;
    }
    
    setLoading(true);
    try {
      const res = await request.post("package/postPack&wxapp_id=10001", {
        packids: packageIds.join(","),
        line_id: form.line_id,
        address_id: form.address_id,
        pack_ids: form.pack_ids.join(","),
        remark: form.remark,
        waitreceivedmoney: form.waitreceivedmoney
      });
      
      if (res.code === 1) {
        toast.success(t("package.success.packing_applied"));
        setTimeout(() => navigate("/order/index"), 1500);
      } else {
        handleApiError({ response: { data: res } });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <h1>{t("package.packing_application")}</h1>
      </div>
      
      {/* Selected Packages */}
      <div className="p-4">
        <h2>{t("package.selected_packages")} ({packages.length})</h2>
        {packages.map(pkg => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Line Selection */}
        <div>
          <label>{t("package.shipping_line")} *</label>
          <select
            value={form.line_id}
            onChange={(e) => setForm({...form, line_id: e.target.value})}
            required
          >
            <option value="">{t("package.select_line")}</option>
            {lines.map(line => (
              <option key={line.line_id} value={line.line_id}>
                {line.line_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Address Selection */}
        <div>
          <label>{t("package.delivery_address")} *</label>
          <select
            value={form.address_id}
            onChange={(e) => setForm({...form, address_id: e.target.value})}
            required
          >
            <option value="">{t("package.select_address")}</option>
            {addresses.map(addr => (
              <option key={addr.address_id} value={addr.address_id}>
                {addr.name} - {addr.detail}
              </option>
            ))}
          </select>
        </div>
        
        {/* Packing Services */}
        <div>
          <label>{t("package.packing_services")}</label>
          {packServices.map(service => (
            <label key={service.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.pack_ids.includes(service.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setForm({...form, pack_ids: [...form.pack_ids, service.id]});
                  } else {
                    setForm({...form, pack_ids: form.pack_ids.filter(id => id !== service.id)});
                  }
                }}
              />
              <span>{service.name} - ฿{service.price}</span>
            </label>
          ))}
        </div>
        
        {/* Remarks */}
        <LineInput
          label={t("package.remarks")}
          placeholder={t("package.remarks_placeholder")}
          value={form.remark}
          onChange={(val) => setForm({...form, remark: val})}
        />
        
        {/* Submit Button */}
        <LineButton
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          {t("package.submit_application")}
        </LineButton>
      </form>
    </div>
  );
};
```

## API Fixes

### 1. Fix `package/countpack` API

**Current Issue:** Returns incorrect status counts

**Fix:**
```php
public function countpack(){
    $this->user = $this->getUser(); 
    $PackageModel = new PackageModel();
    if(!\request()->get('token')){
        return $this->renderError('请先登录');
    }
    $where = [
      'is_delete' => 0,
      'member_id' => $this->user['user_id']
    ];
    $data = [
        'nocount' => $PackageModel->where($where)->where('status', 1)->count(),
        'yescount' => $PackageModel->where($where)->where('status', 2)->count(),
        'yessend' => $PackageModel->where($where)->where('status', 8)->count(), // FIXED: was 3
        'procount' => $PackageModel->where($where)->where('status', -1)->count(),
    ];
    return $this->renderSuccess($data);
}
```

### 2. Fix `package/outside` API

**Current Issue:** Tab 3 should show status=8 (shipped), not status=3

**Fix:** Frontend should pass correct status value when calling API

## State Management

### New Recoil Atoms
```javascript
// src/state.js
export const packageIdsState = atom({
  key: "packageIds",
  default: []
});

export const selectionModeState = atom({
  key: "selectionMode",
  default: false
});
```

## Translation Keys

### Thai Translations
```json
{
  "package": {
    "apply_packing": "สมัครแพ็คพัสดุ",
    "cancel_selection": "ยกเลิกการเลือก",
    "confirm_packing": "ยืนยันการแพ็ค",
    "packing_application": "สมัครแพ็คพัสดุ",
    "selected_packages": "พัสดุที่เลือก",
    "shipping_line": "เส้นทางการจัดส่ง",
    "select_line": "เลือกเส้นทางการจัดส่ง",
    "delivery_address": "ที่อยู่จัดส่ง",
    "select_address": "เลือกที่อยู่จัดส่ง",
    "packing_services": "บริการแพ็ค",
    "remarks": "หมายเหตุ",
    "remarks_placeholder": "กรอกหมายเหตุ (ไม่บังคับ)",
    "submit_application": "ยืนยันการสมัคร",
    "status": {
      "not_received": "ยังไม่ได้รับ",
      "received": "ได้รับแล้ว",
      "pending_verify": "รอตรวจสอบ",
      "verified": "ตรวจสอบแล้ว",
      "pending_pack": "รอแพ็ค",
      "packed": "แพ็คแล้ว",
      "pending_payment": "รอชำระเงิน",
      "shipped": "จัดส่งแล้ว",
      "issue": "มีปัญหา",
      "unknown": "ไม่ทราบสถานะ"
    },
    "error": {
      "no_selection": "กรุณาเลือกพัสดุอย่างน้อย 1 รายการ",
      "no_packages": "ไม่พบพัสดุที่เลือก",
      "select_line": "กรุณาเลือกเส้นทางการจัดส่ง",
      "select_address": "กรุณาเลือกที่อยู่จัดส่ง"
    },
    "success": {
      "packing_applied": "สมัครแพ็คพัสดุสำเร็จ"
    }
  }
}
```

## UI/UX Design

### Selection Mode
- Checkbox appears on top-left of each package card
- Selected packages have blue border
- Bottom action bar shows selected count
- Cancel and Confirm buttons in action bar

### Packing Application Page
- Clean, step-by-step layout
- Selected packages shown at top
- Form fields clearly labeled
- Required fields marked with *
- Submit button at bottom
- Loading state during submission

### Status Display
- Color-coded status badges
- Clear, concise status text
- Consistent across all pages

## Error Handling

### Validation Errors
- Empty selection: "กรุณาเลือกพัสดุอย่างน้อย 1 รายการ"
- No line selected: "กรุณาเลือกเส้นทางการจัดส่ง"
- No address selected: "กรุณาเลือกที่อยู่จัดส่ง"

### API Errors
- Network error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
- Server error: Display error message from backend
- Timeout: "การเชื่อมต่อหมดเวลา กรุณาลองใหม่"

## Performance Considerations

### Optimization Strategies
1. Lazy load package details
2. Cache line and address data
3. Debounce search input
4. Virtualize long lists
5. Optimize re-renders with React.memo

### Loading States
- Skeleton loaders for package list
- Spinner for form submission
- Disabled buttons during loading
- Progress indicators for multi-step operations

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate package IDs on backend
- Check user ownership of packages
- Prevent SQL injection
- Validate line and address IDs

### Authorization
- Verify user token
- Check package ownership
- Validate user permissions
- Rate limiting on API calls

## Testing Strategy

### Unit Tests
- Status mapping functions
- Selection logic
- Form validation
- API response handling

### Integration Tests
- Package selection flow
- Packing application submission
- Status update after packing
- Statistics calculation

### E2E Tests
- Complete packing application flow
- Status filtering
- Package search
- Error scenarios
