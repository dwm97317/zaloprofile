import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * VirtualizedOrderList Component
 * 
 * Renders a virtualized list of orders for optimal performance with large datasets.
 * Only renders visible items plus an overscan buffer to maintain smooth scrolling.
 */
const VirtualizedOrderList = ({
  items = [],
  renderItem,
  estimateSize = 200,
  overscan = 5,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const parentRef = useRef(null);

  // Initialize virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: overscan,
    // Enable dynamic height measurement
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Infinite scroll detection
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;

    const [lastItem] = [...virtualItems].reverse();
    
    if (!lastItem) return;

    // Trigger load more when within 5 items of the end
    if (lastItem.index >= items.length - 5) {
      onLoadMore();
    }
  }, [virtualItems, items.length, onLoadMore, hasMore, loading]);

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedOrderList;
