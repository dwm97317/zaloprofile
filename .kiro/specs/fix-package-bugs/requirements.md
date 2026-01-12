# Package Application and Status Bugs - Requirements

## Overview
Fix two critical bugs in the package management system:
1. Missing package application/packing functionality (需要参考微信小程序实现)
2. Incorrect package status and statistics in "我的包裹" (My Packages) page

## Background
User reported bugs after testing the frontend:
- Package application/packing feature is not implemented (should reference WeChat mini program)
- Package status and statistics are incorrect in the My Packages page

## User Stories

### US-1: Package Application/Packing Feature
**As a** user  
**I want to** apply for package packing from the "My Packages" page  
**So that** I can consolidate multiple packages into one shipment

**Acceptance Criteria:**
- AC-1.1: User can select multiple unpacked packages (status 2,3,4,7)
- AC-1.2: User can navigate to packing page with selected packages
- AC-1.3: Packing page shows all selected packages with details
- AC-1.4: User can select shipping line
- AC-1.5: User can select delivery address
- AC-1.6: User can select packing services (optional)
- AC-1.7: User can add remarks
- AC-1.8: System calculates estimated shipping cost
- AC-1.9: User can submit packing application
- AC-1.10: After submission, packages status changes to "待打包" (status 5)
- AC-1.11: System creates an Inpack order record
- AC-1.12: User receives confirmation message

### US-2: Fix Package Status Display
**As a** user  
**I want to** see correct package status in the My Packages page  
**So that** I can track my packages accurately

**Acceptance Criteria:**
- AC-2.1: Status 1 displays as "未入库" (Not Received)
- AC-2.2: Status 2 displays as "已入库" (Received)
- AC-2.3: Status 3 displays as "待查验" (Pending Verification)
- AC-2.4: Status 4 displays as "已查验" (Verified)
- AC-2.5: Status 5 displays as "待打包" (Pending Packing)
- AC-2.6: Status 6 displays as "已打包" (Packed)
- AC-2.7: Status 7 displays as "待支付" (Pending Payment)
- AC-2.8: Status 8 displays as "已发货" (Shipped)
- AC-2.9: Status -1 displays as "问题件" (Issue)

### US-3: Fix Package Statistics
**As a** user  
**I want to** see correct package counts for each status tab  
**So that** I know how many packages are in each state

**Acceptance Criteria:**
- AC-3.1: "未入库" tab shows count of packages with status=1
- AC-3.2: "已入库" tab shows count of packages with status=2
- AC-3.3: "已发货" tab shows count of packages with status=3 (should be status=8)
- AC-3.4: "问题件" tab shows count of packages with status=-1
- AC-3.5: Statistics update in real-time after any package operation
- AC-3.6: API endpoint returns correct counts

### US-4: Package List Filtering
**As a** user  
**I want to** filter packages by status  
**So that** I can easily find packages in specific states

**Acceptance Criteria:**
- AC-4.1: Clicking "未入库" tab shows only status=1 packages
- AC-4.2: Clicking "已入库" tab shows only status=2 packages
- AC-4.3: Clicking "已发货" tab shows only status=8 packages (not status=3)
- AC-4.4: Clicking "问题件" tab shows only status=-1 packages
- AC-4.5: Tab selection persists during session

## Technical Requirements

### TR-1: Backend API
- TR-1.1: Use existing `package/unpack` API to get unpacked packages
- TR-1.2: Use existing `package/postPack` API to submit packing application
- TR-1.3: Fix `package/countpack` API to return correct status counts
- TR-1.4: Fix `package/outside` API to filter by correct status values

### TR-2: Frontend Components
- TR-2.1: Create PackingApplication page component
- TR-2.2: Add package selection UI in Order/Package page
- TR-2.3: Update status display logic in Order/Package page
- TR-2.4: Fix tab filtering logic in Order/Package page

### TR-3: Status Mapping
```javascript
const STATUS_MAP = {
  1: { text: "未入库", color: "gray" },
  2: { text: "已入库", color: "blue" },
  3: { text: "待查验", color: "yellow" },
  4: { text: "已查验", color: "green" },
  5: { text: "待打包", color: "orange" },
  6: { text: "已打包", color: "purple" },
  7: { text: "待支付", color: "red" },
  8: { text: "已发货", color: "green" },
  -1: { text: "问题件", color: "red" }
};
```

### TR-4: Tab Status Mapping
```javascript
const TAB_STATUS_MAP = {
  1: [1],      // 未入库
  2: [2],      // 已入库
  3: [8],      // 已发货 (FIXED: was 3, should be 8)
  -1: [-1]     // 问题件
};
```

## Non-Functional Requirements

### NFR-1: Performance
- Page load time < 2 seconds
- API response time < 500ms
- Smooth animations and transitions

### NFR-2: Usability
- Clear visual feedback for package selection
- Intuitive packing application flow
- Error messages in Thai language
- Confirmation dialogs for important actions

### NFR-3: Compatibility
- Works on all modern browsers
- Responsive design for mobile devices
- Compatible with LINE LIFF SDK

## Out of Scope
- Payment processing (already implemented)
- Package tracking (already implemented)
- Address management (already implemented)
- Warehouse management (backend only)

## Dependencies
- Existing backend APIs: `package/unpack`, `package/postPack`, `package/countpack`, `package/outside`
- Existing components: LineButton, LineInput, Loading
- Existing utilities: request, toast, errorHandler
- Translation system (i18n)

## Success Metrics
- Users can successfully apply for package packing
- Package status displays correctly 100% of the time
- Package statistics are accurate
- Zero user complaints about status display
- Packing application success rate > 95%
