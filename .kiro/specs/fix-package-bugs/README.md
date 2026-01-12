# Fix Package Application and Status Bugs

## Overview
This spec addresses two critical bugs reported by the user after testing the frontend:
1. **Missing Feature**: Package application/packing functionality (需要参考微信小程序实现)
2. **Bug**: Incorrect package status and statistics in "我的包裹" (My Packages) page

## Problem Statement

### Bug 1: Missing Package Application Feature
Users cannot apply for package packing from the "My Packages" page. This feature exists in the WeChat mini program but is not implemented in the LINE mini app.

**Expected Behavior:**
- Users should be able to select multiple received packages (status=2)
- Users should be able to submit a packing application with:
  - Selected packages
  - Shipping line selection
  - Delivery address selection
  - Optional packing services
  - Remarks
- After submission, packages should change to "待打包" status (status=5)

### Bug 2: Incorrect Package Status and Statistics
The package status display and tab statistics are incorrect:

**Current Issues:**
- Status text mapping is incomplete or incorrect
- Tab 3 "已发货" (Shipped) filters by status=3 instead of status=8
- Statistics API returns wrong counts (especially for shipped packages)

**Expected Behavior:**
- All status values (1, 2, 3, 4, 5, 6, 7, 8, -1) should display correct Thai text
- Tab filtering should use correct status values
- Statistics should show accurate counts for each status

## Solution Summary

### Phase 1: Fix Status Display (HIGH Priority)
1. Create correct status mapping function
2. Fix tab filtering to use correct status values
3. Fix backend API `countpack()` to return correct counts

### Phase 2: Implement Package Application (HIGH Priority)
1. Add package selection UI with checkboxes
2. Create packing application page
3. Integrate with existing backend API `package/postPack`
4. Add form validation and error handling

### Phase 3: Add Translations (MEDIUM Priority)
1. Add Thai translations for all new features
2. Add status text translations

### Phase 4: Testing (HIGH Priority)
1. Manual testing of all features
2. Bug fixes
3. Performance optimization

## Key Files

### Frontend Files to Create:
- `src/pages/Packages/Pack.jsx` - Packing application page
- `src/pages/Packages/Pack.scss` - Styles

### Frontend Files to Modify:
- `src/pages/Order/Package.jsx` - Add selection UI, fix status display
- `src/state.js` - Add packageIds state
- `src/locales/th/translation.json` - Add translations
- `src/components/app.jsx` - Add route
- `src/components/layout.jsx` - Add route

### Backend Files to Modify:
- `Lineminiapp/source/application/api/controller/Package.php` - Fix countpack() method

## Status Mapping Reference

```javascript
const STATUS_MAP = {
  1: "未入库 (Not Received)",
  2: "已入库 (Received)",
  3: "待查验 (Pending Verification)",
  4: "已查验 (Verified)",
  5: "待打包 (Pending Packing)",
  6: "已打包 (Packed)",
  7: "待支付 (Pending Payment)",
  8: "已发货 (Shipped)",
  -1: "问题件 (Issue)"
};
```

## Tab Status Mapping (FIXED)

```javascript
const TAB_STATUS_MAP = {
  1: [1],      // 未入库 (Not Received)
  2: [2],      // 已入库 (Received)
  3: [8],      // 已发货 (Shipped) - FIXED: was 3, should be 8
  -1: [-1]     // 问题件 (Issue)
};
```

## API Endpoints Used

### Existing APIs (No Changes Needed):
- `GET package/unpack` - Get unpacked packages for packing
- `POST package/postPack` - Submit packing application
- `GET package/outside` - Get packages by status
- `GET line/lists` - Get shipping lines
- `GET address/lists` - Get user addresses
- `GET package/postservice` - Get packing services

### APIs to Fix:
- `GET package/countpack` - Fix to return correct status counts

## Estimated Timeline
- **Total Time**: 9-10 hours
- **Phase 1**: 1 hour (Status fixes)
- **Phase 2**: 4.5 hours (Package application feature)
- **Phase 3**: 0.5 hours (Translations)
- **Phase 4**: 2.5 hours (Testing and bug fixes)
- **Phase 5**: 0.5 hours (Documentation)

## Success Criteria
- ✅ Users can select multiple packages and apply for packing
- ✅ All package statuses display correctly
- ✅ Tab filtering works with correct status values
- ✅ Statistics show accurate counts
- ✅ Packing application submits successfully
- ✅ All text is translated to Thai
- ✅ No console errors
- ✅ Responsive design works on mobile

## Testing Checklist
- [ ] Package selection UI works correctly
- [ ] Packing application form validates properly
- [ ] Packing submission creates Inpack order
- [ ] Package status updates after packing
- [ ] All status values display correct text
- [ ] Tab filtering shows correct packages
- [ ] Statistics counts are accurate
- [ ] Error handling works properly
- [ ] Thai translations are correct
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings

## Related Documents
- [Requirements Document](./requirements.md) - Detailed requirements and user stories
- [Design Document](./design.md) - Technical design and architecture
- [Tasks Document](./tasks.md) - Detailed task breakdown and progress tracking

## Notes
- Backend API `package/postPack` already exists and works correctly
- Reference WeChat mini program for UX patterns (user mentioned this)
- Test with user 15027 (海阔天空) in development environment
- Focus on frontend implementation and fixing status display bugs first
