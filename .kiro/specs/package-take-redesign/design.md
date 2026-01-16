# Package Claim Page Redesign - Design

## Visual Design

### Layout Structure
```
┌─────────────────────────────────┐
│  Hero Section (Gradient)        │
│  - Title & Icon                 │
│  - Subtitle                     │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Quick Claim Card (Primary)     │
│  ┌───────────────────────────┐  │
│  │ Tracking Number Input     │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Category Selector         │  │
│  └───────────────────────────┘  │
│  [ Claim Now Button ]           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  OR Divider                     │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Browse Available Packages      │
│  ┌───────────────────────────┐  │
│  │ Search Bar                │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Package Card 1            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Package Card 2            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Color Scheme (LINE Theme)
- **Primary**: Blue gradient (`from-blue-500 to-blue-600`)
- **Success**: Green (`green-500`)
- **Background**: Light gray (`gray-50`)
- **Cards**: White with shadow
- **Text**: Gray scale (`gray-700`, `gray-900`)
- **Accents**: Orange for categories (`orange-500`)

### Typography
- **Hero Title**: `text-3xl font-black`
- **Section Headers**: `text-xl font-bold`
- **Body Text**: `text-base font-medium`
- **Labels**: `text-sm font-semibold`
- **Hints**: `text-xs text-gray-500`

## Component Architecture

### Main Component: `PackageTake.jsx`
```
PackageTake
├── HeroSection
├── QuickClaimCard
│   ├── TrackingNumberInput
│   ├── CategorySelector
│   └── ClaimButton
├── OrDivider
└── BrowseSection
    ├── SearchBar
    └── PackageList
        └── PackageCard[]
```

### Sub-Components

#### 1. CategorySelector Component
**Purpose**: Visual category selection with icons and multi-select

**Features**:
- Grid layout of category cards
- Icon + name display
- Multi-select with checkboxes
- Visual feedback on selection
- Quick-select common categories
- Search/filter categories

**Props**:
```typescript
interface CategorySelectorProps {
  selectedCategories: Category[];
  onSelect: (categories: Category[]) => void;
  maxSelections?: number;
}
```

#### 2. PackageCard Component
**Purpose**: Display available package info with claim action

**Features**:
- Tracking number (partially masked)
- Entry timestamp
- Storage location
- Quick claim button
- Hover effects

**Props**:
```typescript
interface PackageCardProps {
  package: Package;
  onClaim: (pkg: Package) => void;
}
```

## User Flows

### Flow 1: Quick Claim (Primary)
```
1. User lands on page
2. Sees prominent "Quick Claim" card
3. Enters tracking number
4. Selects item categories
5. Clicks "Claim Now"
6. System validates
7. Shows success animation
8. Redirects to package list
```

### Flow 2: Browse & Claim
```
1. User scrolls to "Browse" section
2. Sees list of available packages
3. (Optional) Uses search to filter
4. Clicks "Claim" on a package
5. System auto-fills tracking number
6. User selects categories
7. Clicks "Claim Now"
8. Shows success animation
9. Redirects to package list
```

### Flow 3: Error Handling
```
1. User submits claim
2. System detects error:
   - Invalid tracking number
   - Package already claimed
   - Network error
3. Shows error toast
4. Highlights problematic field
5. Provides helpful error message
6. User corrects and retries
```

## Animations & Interactions

### Entry Animations
- Hero section: Fade in from top
- Quick claim card: Slide up with bounce
- Package list: Stagger fade in

### Interaction Animations
- Button press: Scale down (0.95)
- Category select: Scale + color change
- Success: Confetti + checkmark animation
- Error: Shake animation

### Loading States
- Skeleton loaders for package list
- Spinner on claim button during submission
- Shimmer effect on loading cards

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Full-width cards
- Sticky header
- Bottom padding for safe area
- Touch-optimized buttons (min 44px)

### Tablet (768px - 1024px)
- Two-column category grid
- Wider cards with more spacing
- Side-by-side layout for some sections

### Desktop (> 1024px)
- Max width container (1200px)
- Three-column category grid
- Hover effects enabled
- Larger typography

## Accessibility

### ARIA Labels
- Form inputs with proper labels
- Button roles and states
- Loading states announced
- Error messages linked to inputs

### Keyboard Navigation
- Tab order follows visual flow
- Enter to submit forms
- Escape to close modals
- Arrow keys for category selection

### Screen Reader Support
- Semantic HTML structure
- Alt text for icons
- Status announcements
- Error descriptions

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load package list on scroll
2. **Debouncing**: Search input debounced (300ms)
3. **Memoization**: Category list memoized
4. **Code Splitting**: Separate bundle for this page
5. **Image Optimization**: Use WebP with fallbacks

### Loading Strategy
```
Initial Load:
├── Hero + Quick Claim (immediate)
├── Categories (lazy, on interaction)
└── Package List (lazy, on scroll)
```

## Error States

### Validation Errors
- **Empty tracking number**: "กรุณากรอกหมายเลขพัสดุ"
- **Invalid format**: "หมายเลขพัสดุไม่ถูกต้อง"
- **No categories**: "กรุณาเลือกประเภทสินค้า"

### API Errors
- **Package not found**: "ไม่พบพัสดุนี้ในระบบ"
- **Already claimed**: "พัสดุนี้ถูกรับไปแล้ว"
- **Network error**: "เกิดข้อผิดพลาด กรุณาลองใหม่"

### Empty States
- **No packages available**: Show illustration + message
- **Search no results**: "ไม่พบพัสดุที่ค้นหา"

## Success States

### Claim Success
1. Show success toast with checkmark
2. Brief confetti animation
3. Display claimed package info
4. Auto-redirect after 2 seconds
5. Option to claim another package

## Integration Points

### State Management (Recoil)
```javascript
// Atoms
const claimFormState = atom({
  key: 'claimFormState',
  default: {
    trackingNumber: '',
    selectedCategories: [],
  }
});

const availablePackagesState = atom({
  key: 'availablePackagesState',
  default: []
});
```

### API Integration
```javascript
// Quick claim
POST /package/getTakePackage
Body: { express_sn, class_ids }

// Get available packages
GET /package/packageForTaker
Query: { keyword?, page? }
```

### Navigation
```javascript
// After successful claim
navigate('/order/package', { 
  state: { claimedPackage: true } 
});
```

## Design Tokens

### Spacing
- `xs`: 0.5rem (8px)
- `sm`: 0.75rem (12px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)

### Border Radius
- `sm`: 0.5rem (8px)
- `md`: 0.75rem (12px)
- `lg`: 1rem (16px)
- `xl`: 1.5rem (24px)
- `2xl`: 2rem (32px)

### Shadows
- `sm`: 0 1px 2px rgba(0,0,0,0.05)
- `md`: 0 4px 6px rgba(0,0,0,0.1)
- `lg`: 0 10px 15px rgba(0,0,0,0.1)
- `xl`: 0 20px 25px rgba(0,0,0,0.1)

## Comparison with Current Design

| Aspect | Current | Redesign |
|--------|---------|----------|
| Steps | 2 pages | 1 page (unified) |
| Primary Action | Browse first | Quick claim first |
| Category Selection | Separate page | Inline component |
| Visual Design | Basic | Modern LINE theme |
| Animations | None | Smooth transitions |
| Error Handling | Alerts | Toast + inline |
| Mobile UX | Basic | Touch-optimized |
| Loading States | Simple spinner | Skeleton loaders |
