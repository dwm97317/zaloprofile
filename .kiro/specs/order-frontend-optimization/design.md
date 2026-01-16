# Design Document

## Overview

This design document outlines the frontend architecture and implementation approach for optimizing the order management system. The optimization focuses on performance improvements, enhanced user experience, mobile-first interactions, and visual feedback mechanisms. All optimizations are implemented purely on the frontend without requiring backend API changes.

The design leverages modern React patterns, efficient rendering techniques, intelligent caching strategies, and native-like mobile interactions to create a smooth, responsive user experience.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Order List   │  │ Order Detail │  │ Filter Panel │      │
│  │ (Virtual)    │  │ (Timeline)   │  │ (Local)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Filter Hook  │  │ Cache Hook   │  │ Statistics   │      │
│  │              │  │              │  │ Hook         │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Cache        │  │ Local        │  │ API Client   │      │
│  │ Manager      │  │ Storage      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── OrderListPage
│   ├── PullToRefresh
│   │   └── VirtualizedOrderList
│   │       ├── OrderCard (with Swipeable)
│   │       │   ├── OptimizedImage (Lazy)
│   │       │   ├── MiniProgressBar
│   │       │   └── QuickActionPanel
│   │       └── InfiniteScroll
│   ├── FilterPanel
│   ├── SearchWithHistory
│   └── LocalStatisticsPanel
├── OrderDetailPage
│   ├── OrderTimeline
│   ├── OptimizedImage (Lazy)
│   └── ActionButtons
└── Common Components
    ├── Toast
    ├── Skeleton
    ├── EmptyState
    └── ErrorState
```

## Components and Interfaces

### 1. Cache Manager

**Purpose**: Manage multi-tier caching with configurable TTL

**Interface**:
```typescript
interface CacheConfig {
  ttl: number;
  storage: 'memory' | 'local';
}

interface CacheData<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  set<T>(key: string, value: T, type: string): void;
  get<T>(key: string, type: string): T | null;
  delete(key: string, type: string): void;
  clear(type?: string): void;
  clearOldCache(): void;
}
```

**Configuration**:
- `orderList`: 5 minutes, memory storage
- `orderDetail`: 10 minutes, local storage
- `statistics`: 15 minutes, local storage
- `userInfo`: 60 minutes, local storage

### 2. Virtual Scrolling Component

**Purpose**: Render only visible items for performance

**Interface**:
```typescript
interface VirtualizedListProps {
  items: Order[];
  estimateSize: number;
  overscan: number;
  renderItem: (item: Order, index: number) => ReactNode;
}
```

**Implementation Strategy**:
- Use `@tanstack/react-virtual` library
- Estimate item height: 200px
- Overscan: 5 items above and below viewport
- Dynamic height adjustment based on content

### 3. Lazy Image Component

**Purpose**: Load images only when needed

**Interface**:
```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: ReactNode;
  onError?: (e: Event) => void;
}
```

**Implementation Strategy**:
- Use `react-lazy-load-image-component` library
- Blur effect during load
- Threshold: 100px before viewport
- Fallback image on error
- Placeholder with pulse animation

### 4. Filter Hook

**Purpose**: Client-side filtering of loaded orders

**Interface**:
```typescript
interface FilterState {
  keyword: string;
  dateRange: { start: Date | null; end: Date | null };
  priceRange: { min: number; max: number };
  warehouses: number[];
  countries: number[];
  statuses: number[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface UseOrderFilterReturn {
  filteredOrders: Order[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

function useOrderFilter(orders: Order[]): UseOrderFilterReturn;
```

**Filtering Logic**:
1. Keyword search (case-insensitive, multiple fields)
2. Date range filtering
3. Price range filtering
4. Multi-select warehouse filtering
5. Multi-select country filtering
6. Multi-select status filtering
7. Sorting by configurable field and order

### 5. Order Timeline Component

**Purpose**: Visual representation of order status progression

**Interface**:
```typescript
interface OrderTimelineProps {
  order: Order;
  compact?: boolean;
}

interface StatusStep {
  id: number;
  name: string;
  icon: string;
  status: number;
}
```

**Status Flow**:
1. Package Forecast (📦) - Status 1
2. Warehouse Received (🏭) - Status 2
3. Quality Check Complete (✅) - Status 3
4. Awaiting Packing (📮) - Status 4
5. Packing Complete (📦) - Status 5
6. Awaiting Payment (💰) - Status 7
7. Shipped (🚚) - Status 8
8. Completed (🎉) - Status 9

**Visual Design**:
- Completed steps: Blue-purple gradient, white text
- Current step: Ring animation, pulse effect
- Pending steps: Gray background, gray text
- Progress bar showing percentage completion
- Connecting lines between steps

### 6. Quick Action Panel

**Purpose**: Provide rapid access to common operations

**Interface**:
```typescript
interface QuickAction {
  id: string;
  icon: string;
  label: string;
  action: () => void;
}

interface QuickActionPanelProps {
  order: Order;
  onClose: () => void;
}
```

**Actions**:
1. Copy tracking number
2. Copy order number
3. View logistics
4. View details
5. Share order
6. Add note

**Trigger**: Long press (500ms) on order card

### 7. Pull-to-Refresh Component

**Purpose**: Native-like refresh gesture

**Interface**:
```typescript
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}
```

**Behavior**:
- Threshold: 80px pull distance
- Damping factor: 0.5
- Visual indicator with rotation
- Haptic feedback on trigger
- Smooth animation on release

### 8. Infinite Scroll Component

**Purpose**: Automatic pagination on scroll

**Interface**:
```typescript
interface InfiniteScrollProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  children: ReactNode;
}
```

**Behavior**:
- Trigger distance: 100px from bottom
- Intersection Observer API
- Loading indicator at bottom
- "No more data" message when complete
- Prevent duplicate requests

### 9. Swipeable Card Component

**Purpose**: Reveal actions through swipe gesture

**Interface**:
```typescript
interface SwipeableCardProps {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Behavior**:
- Max swipe distance: 160px
- Snap threshold: 80px (50%)
- Left swipe only
- Smooth spring animation
- Auto-close on action

### 10. Toast Notification System

**Purpose**: Provide operation feedback

**Interface**:
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration: number;
  onClose: () => void;
}

interface UseToastReturn {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  ToastContainer: React.FC;
}
```

**Behavior**:
- Auto-dismiss after 3 seconds
- Slide down animation from top
- Queue multiple toasts
- Distinct colors per type
- Icon per type

## Data Models

### Order Model (Frontend)

```typescript
interface Order {
  id: number;
  order_sn: string;
  express_num: string;
  status: number;
  price: number;
  weight: number;
  created_time: string;
  storage_id: number;
  country_id: number;
  class_name: string;
  storage?: {
    shop_name: string;
  };
  country?: {
    title: string;
  };
  images?: string[];
}
```

### Filter State Model

```typescript
interface FilterState {
  keyword: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  priceRange: {
    min: number;
    max: number;
  };
  warehouses: number[];
  countries: number[];
  statuses: number[];
  sortBy: 'created_time' | 'price' | 'weight';
  sortOrder: 'asc' | 'desc';
}
```

### Statistics Model

```typescript
interface OrderStatistics {
  totalOrders: number;
  totalAmount: number;
  totalWeight: number;
  avgPrice: number;
  avgWeight: number;
  statusDistribution: Record<number, number>;
  warehouseDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
}
```

### Cache Entry Model

```typescript
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Virtual Scrolling Consistency

*For any* list of orders, the virtual scrolling component should render the same visible items as a non-virtualized list would show for the same scroll position.

**Validates: Requirements 1.1, 1.2**

### Property 2: Cache Expiration Correctness

*For any* cached data with TTL T, retrieving the data after time T has elapsed should return null and trigger a fresh fetch.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 3: Filter Composition Correctness

*For any* set of orders and any combination of filter criteria, applying filters should return only orders that satisfy all active filter conditions.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 4: Timeline Status Progression

*For any* order with status S, the timeline component should show all statuses less than or equal to S as completed, and all statuses greater than S as pending.

**Validates: Requirements 5.1, 5.2, 5.5**

### Property 5: Lazy Loading Viewport Detection

*For any* image component, the image should only load when it is within the threshold distance of the viewport or already visible.

**Validates: Requirements 2.1, 2.5**

### Property 6: Pull-to-Refresh Threshold

*For any* pull gesture, refresh should only trigger when the pull distance exceeds the threshold AND the list is scrolled to the top.

**Validates: Requirements 7.1, 7.2, 7.6**

### Property 7: Infinite Scroll Deduplication

*For any* sequence of scroll events, the infinite scroll component should never trigger multiple simultaneous load requests.

**Validates: Requirements 8.5**

### Property 8: Swipe Gesture Snap Behavior

*For any* swipe gesture on an order card, if the swipe distance is less than 50% of max distance, the card should snap back to closed position; otherwise it should snap to fully open.

**Validates: Requirements 9.2, 9.3**

### Property 9: Statistics Calculation Accuracy

*For any* set of orders, the calculated statistics (total amount, total weight, averages) should match the sum/average of the individual order values.

**Validates: Requirements 12.1, 12.5**

### Property 10: Search History Uniqueness

*For any* search keyword, adding it to history should remove any previous occurrence and place it at the front, maintaining a maximum of 10 unique entries.

**Validates: Requirements 13.1, 13.2**

### Property 11: Toast Queue Ordering

*For any* sequence of toast notifications, they should be displayed in the order they were triggered and auto-dismiss after their specified duration.

**Validates: Requirements 11.1, 11.2, 11.5**

### Property 12: Cache Storage Fallback

*For any* cache write operation, if local storage is full, the cache manager should clear expired entries before attempting to store new data.

**Validates: Requirements 3.4**

### Property 13: Filter Reset Idempotence

*For any* filter state, resetting filters should restore the default state, and resetting again should produce the same result.

**Validates: Requirements 4.6**

### Property 14: Image Error Handling

*For any* image that fails to load, the system should display the fallback image and not retry indefinitely.

**Validates: Requirements 2.3**

### Property 15: Performance Frame Rate

*For any* scrolling or animation operation, the system should maintain 60fps (16ms per frame) under normal load conditions.

**Validates: Requirements 1.4, 15.3**

## Error Handling

### Network Errors

**Strategy**: Graceful degradation with retry capability

**Implementation**:
1. Display error state component with friendly message
2. Provide retry button
3. Use cached data if available
4. Log errors for monitoring

### Cache Storage Errors

**Strategy**: Automatic cleanup and fallback

**Implementation**:
1. Catch QuotaExceededError
2. Clear expired cache entries
3. Retry storage operation
4. Fall back to memory cache if local storage fails

### Image Loading Errors

**Strategy**: Fallback image display

**Implementation**:
1. Catch image load errors
2. Display default fallback image
3. Log error for monitoring
4. Don't retry automatically

### Gesture Conflicts

**Strategy**: Priority-based resolution

**Implementation**:
1. Pull-to-refresh has priority when at top
2. Swipe gestures have priority on cards
3. Scroll has priority in other cases
4. Cancel conflicting gestures gracefully

### Performance Degradation

**Strategy**: Adaptive optimization

**Implementation**:
1. Monitor frame rate
2. Reduce overscan if performance drops
3. Disable animations on low-end devices
4. Provide simplified mode option

## Testing Strategy

### Unit Testing

**Focus**: Individual components and utilities

**Test Cases**:
1. CacheManager set/get/delete operations
2. Filter logic for each criterion
3. Statistics calculation accuracy
4. Search history management
5. Toast queue management
6. Gesture threshold calculations

**Tools**: Jest, React Testing Library

### Property-Based Testing

**Focus**: Universal properties across all inputs

**Configuration**:
- Minimum 100 iterations per property test
- Use fast-check library for JavaScript
- Tag format: `Feature: order-frontend-optimization, Property {N}: {description}`

**Property Tests**:
1. Virtual scrolling consistency across different list sizes
2. Cache expiration timing accuracy
3. Filter composition correctness with random criteria
4. Timeline status progression for all status values
5. Lazy loading trigger distance accuracy
6. Pull-to-refresh threshold behavior
7. Infinite scroll deduplication
8. Swipe gesture snap calculations
9. Statistics calculation with random order sets
10. Search history uniqueness and ordering
11. Toast queue FIFO ordering
12. Cache storage fallback behavior
13. Filter reset idempotence
14. Image error handling
15. Performance frame rate maintenance

### Integration Testing

**Focus**: Component interactions and data flow

**Test Cases**:
1. Order list with virtual scrolling + lazy images
2. Filter panel + order list updates
3. Pull-to-refresh + cache invalidation
4. Infinite scroll + API pagination
5. Swipe gesture + quick actions
6. Toast notifications + user actions

### Performance Testing

**Metrics**:
- First Contentful Paint < 1.5s
- Time to Interactive < 2.5s
- Scroll FPS = 60
- Memory usage < 50MB for 1000 items
- API call reduction > 60%

**Tools**: Lighthouse, Chrome DevTools Performance

### User Acceptance Testing

**Focus**: Real-world usage scenarios

**Scenarios**:
1. Browse 1000+ orders smoothly
2. Filter orders by multiple criteria
3. Refresh order list with pull gesture
4. Load more orders by scrolling
5. Swipe to reveal actions
6. View order status timeline
7. Use quick actions efficiently

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-virtual": "^3.0.0",
    "react-lazy-load-image-component": "^1.6.0"
  }
}
```

### Existing Dependencies

- React 18
- Recoil (state management)
- React Router (navigation)
- TailwindCSS (styling)
- react-i18next (internationalization)

## Implementation Notes

### Performance Considerations

1. **Virtual Scrolling**: Critical for lists > 100 items
2. **Image Lazy Loading**: Reduces initial load by 50-60%
3. **Caching**: Reduces API calls by 60-70%
4. **Memoization**: Use React.memo, useMemo, useCallback extensively
5. **Code Splitting**: Lazy load heavy components

### Mobile Optimization

1. **Touch Events**: Use touch events, not mouse events
2. **Haptic Feedback**: Provide when available
3. **Gesture Conflicts**: Prevent default browser behaviors
4. **Viewport Meta**: Ensure proper mobile viewport settings
5. **Safe Areas**: Respect device safe areas (notches, etc.)

### Accessibility

1. **Keyboard Navigation**: Support for all interactive elements
2. **Screen Readers**: Proper ARIA labels and roles
3. **Focus Management**: Logical focus order
4. **Color Contrast**: WCAG AA compliance
5. **Touch Targets**: Minimum 44x44px

### Browser Compatibility

**Target Browsers**:
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Polyfills**:
- Intersection Observer (for older browsers)
- ResizeObserver (for older browsers)

### Internationalization

All user-facing text must support:
- Thai (th)
- Vietnamese (vi)
- Chinese (zh)

Use i18next translation keys for all strings.
