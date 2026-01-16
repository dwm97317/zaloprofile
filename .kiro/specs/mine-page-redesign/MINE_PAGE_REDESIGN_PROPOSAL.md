# Mine Page Redesign Proposal - Logistics Theme

## Overview
Redesign the `/mine` (个人中心) page with a clean, professional logistics-focused design that emphasizes clarity, organization, and easy access to key features.

## Design Principles

### 1. **Logistics Industry Theme**
- Professional, trustworthy appearance
- Clear visual hierarchy
- Organized sections with clear boundaries
- Shipping/logistics iconography
- Blue/teal color scheme (trust, reliability)

### 2. **Simplified Layout**
- Remove clutter and unnecessary elements
- Group related features logically
- Clear section headers
- Consistent spacing and padding
- Card-based design for better organization

### 3. **Key Sections**
1. **Profile Header** - User info + grade badge
2. **Quick Stats** - Balance, SMS, Coupon, Points
3. **Primary Actions** - Most used features (Recharge, Package, Address)
4. **Order Status** - Quick access to order states
5. **Additional Services** - Secondary features
6. **Warehouse Marks** - User's shipping marks (if any)

## Visual Design

### Color Palette
```
Primary: #2563EB (Blue 600) - Trust, reliability
Secondary: #0EA5E9 (Sky 500) - Logistics, shipping
Accent: #10B981 (Emerald 500) - Success, completion
Background: #F9FAFB (Gray 50) - Clean, professional
Card: #FFFFFF - White cards with shadows
Text Primary: #111827 (Gray 900)
Text Secondary: #6B7280 (Gray 500)
Border: #E5E7EB (Gray 200)
```

### Typography
- Headers: font-bold, text-lg/xl
- Body: font-medium, text-sm
- Labels: text-xs, text-gray-500
- Consistent line-height for readability

### Spacing
- Section gaps: mt-6
- Card padding: p-4 to p-6
- Element gaps: gap-3 to gap-4
- Rounded corners: rounded-2xl for cards

## Component Structure

### 1. Profile Header
```
┌─────────────────────────────────────┐
│  [Avatar]  Name                     │
│            Grade Badge              │
│            User ID: XXXXX           │
│                        [Logout Btn] │
└─────────────────────────────────────┘
```
- Gradient background (blue theme)
- Large avatar with border
- Grade badge integrated
- Logout button in corner

### 2. Quick Stats Card
```
┌─────────────────────────────────────┐
│  Balance    SMS    Coupon   Points  │
│   ฿XXX      XX      XX       XX     │
└─────────────────────────────────────┘
```
- Floating card (negative margin)
- 4-column grid
- Clickable items
- Clear labels and values

### 3. Primary Actions
```
┌─────────────────────────────────────┐
│  [Icon] เติมเงิน (Recharge)    →   │
│  [Icon] รับพัสดุ (Receive)     →   │
│  [Icon] ที่อยู่ (Address)      →   │
└─────────────────────────────────────┘
```
- Large, prominent buttons
- SVG icons (no emojis)
- Clear Thai labels
- Hover/active states

### 4. Order Status Section
```
┌─────────────────────────────────────┐
│  คำสั่งซื้อของฉัน        ดูทั้งหมด →│
│  ┌───┬───┬───┬───┬───┐             │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │             │
│  └───┴───┴───┴───┴───┘             │
└─────────────────────────────────────┘
```
- 5-column grid
- Icon + label for each status
- "View All" link
- Consistent sizing

### 5. Additional Services
```
┌─────────────────────────────────────┐
│  [Icon] คลังสินค้า (Warehouse)  →  │
│  [Icon] คำถามที่พบบ่อย (FAQ)    →  │
└─────────────────────────────────────┘
```
- List-style layout
- Dividers between items
- Hover states
- Right arrow indicators

### 6. Warehouse Marks (Conditional)
```
┌─────────────────────────────────────┐
│  [Icon] ฉลากคลังสินค้าของฉัน    →  │
│         (X รายการ)                  │
└─────────────────────────────────────┘
```
- Only shown if user has marks
- Shows count
- Links to marks page

## Icon Strategy

### Use Heroicons (SVG)
- **Recharge**: BanknotesIcon
- **Package**: CubeIcon
- **Address**: MapPinIcon
- **Warehouse**: BuildingStorefrontIcon
- **FAQ**: QuestionMarkCircleIcon
- **Orders**: ShoppingBagIcon
- **Balance**: WalletIcon
- **SMS**: ChatBubbleLeftIcon
- **Coupon**: TicketIcon
- **Points**: StarIcon

### No Emojis
Replace all emoji icons (🏷️, etc.) with proper SVG icons from Heroicons.

## Interaction Design

### Hover States
- Cards: `hover:shadow-lg transition-shadow`
- Buttons: `hover:bg-blue-700 transition-colors`
- List items: `hover:bg-gray-50 transition-colors`

### Active States
- Buttons: `active:scale-[0.98] transition-transform`
- Cards: `active:scale-[0.99] transition-transform`

### Cursor
- All clickable elements: `cursor-pointer`
- Disabled elements: `cursor-not-allowed opacity-50`

## Responsive Design

### Mobile First (320px+)
- Single column layout
- Full-width cards
- Adequate touch targets (min 44px)
- Readable font sizes (min 14px)

### Tablet (768px+)
- Maintain mobile layout
- Slightly larger cards
- More generous spacing

## Accessibility

### Requirements
- All images have alt text
- Sufficient color contrast (4.5:1)
- Focus states visible
- Keyboard navigation support
- Screen reader friendly labels

## Implementation Plan

### Phase 1: Component Extraction
1. Create `ProfileHeader.jsx` component
2. Create `QuickStatsCard.jsx` component
3. Create `PrimaryActionsCard.jsx` component
4. Create `OrderStatusCard.jsx` component
5. Create `ServiceListCard.jsx` component

### Phase 2: Icon Integration
1. Install `@heroicons/react`
2. Replace all emoji/image icons with Heroicons
3. Ensure consistent sizing (w-6 h-6)

### Phase 3: Styling
1. Apply new color palette
2. Update spacing and layout
3. Add hover/active states
4. Test responsive behavior

### Phase 4: Testing
1. Test all navigation links
2. Verify API integration
3. Test login/logout flow
4. Check grade badge integration
5. Verify conditional rendering (marks)

## File Structure
```
src/
├── pages/
│   └── Mine/
│       ├── Index.jsx (main page)
│       ├── Balance.jsx
│       ├── Recharge.jsx
│       └── Mine.scss
├── components/
│   └── Mine/
│       ├── ProfileHeader.jsx
│       ├── QuickStatsCard.jsx
│       ├── PrimaryActionsCard.jsx
│       ├── OrderStatusCard.jsx
│       └── ServiceListCard.jsx
```

## Success Criteria

### Visual Quality
- ✅ No emojis used as icons
- ✅ Consistent icon set (Heroicons)
- ✅ Professional logistics theme
- ✅ Clear visual hierarchy
- ✅ Proper spacing and alignment

### Functionality
- ✅ All navigation works
- ✅ Grade badge displays correctly
- ✅ Conditional rendering works (marks, login state)
- ✅ API integration intact
- ✅ Responsive on all devices

### User Experience
- ✅ Clear section organization
- ✅ Easy to find key features
- ✅ Smooth interactions
- ✅ Fast loading
- ✅ Accessible to all users

## Next Steps
1. Review and approve this proposal
2. Create component files
3. Implement redesign
4. Test thoroughly
5. Deploy to development environment
