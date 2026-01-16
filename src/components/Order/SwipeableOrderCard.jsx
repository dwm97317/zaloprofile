import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SwipeableOrderCard Component
 * 
 * Wraps OrderCard with swipe gesture to reveal action buttons.
 * Supports left swipe only with snap behavior.
 */
const SwipeableOrderCard = ({ children, onEdit, onDelete, disabled = false }) => {
  const { t } = useTranslation();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentOffset = useRef(0);
  const swipeDirection = useRef(null);
  
  const MAX_SWIPE = 160; // Maximum swipe distance
  const SNAP_THRESHOLD = 80; // 50% of max swipe
  const MOVE_THRESHOLD = 10; // Minimum movement to detect swipe direction

  const handleTouchStart = useCallback((e) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    swipeDirection.current = null;
    setIsSwiping(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping || disabled) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (swipeDirection.current === null && (Math.abs(deltaX) > MOVE_THRESHOLD || Math.abs(deltaY) > MOVE_THRESHOLD)) {
      swipeDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    }

    // Only handle horizontal swipes
    if (swipeDirection.current === 'horizontal') {
      e.preventDefault(); // Prevent scroll
      
      // Only allow left swipe (negative deltaX)
      if (deltaX < 0) {
        const newOffset = Math.max(deltaX, -MAX_SWIPE);
        currentOffset.current = newOffset;
        setSwipeOffset(newOffset);
      } else if (currentOffset.current < 0) {
        // Allow closing swipe (positive deltaX when already open)
        const newOffset = Math.min(currentOffset.current + deltaX, 0);
        currentOffset.current = newOffset;
        setSwipeOffset(newOffset);
      }
    }
  }, [isSwiping, disabled]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    setIsSwiping(false);

    // Snap behavior
    if (Math.abs(currentOffset.current) >= SNAP_THRESHOLD) {
      // Snap to open
      currentOffset.current = -MAX_SWIPE;
      setSwipeOffset(-MAX_SWIPE);
    } else {
      // Snap to closed
      currentOffset.current = 0;
      setSwipeOffset(0);
    }
  }, [isSwiping]);

  const handleActionClick = useCallback((action) => {
    // Close swipe and execute action
    currentOffset.current = 0;
    setSwipeOffset(0);
    action();
  }, []);

  const isOpen = swipeOffset < -SNAP_THRESHOLD;

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons background */}
      <div
        className="absolute top-0 right-0 bottom-0 flex items-center gap-2 pr-4"
        style={{
          width: `${MAX_SWIPE}px`,
          opacity: isOpen ? 1 : 0,
          transition: isSwiping ? 'none' : 'opacity 0.3s ease-out',
        }}
      >
        <button
          onClick={() => handleActionClick(onEdit)}
          className="flex-1 h-full bg-blue-500 text-white rounded-xl flex flex-col items-center justify-center gap-1 active:bg-blue-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-xs font-medium">{t('common.edit', 'แก้ไข')}</span>
        </button>
        <button
          onClick={() => handleActionClick(onDelete)}
          className="flex-1 h-full bg-red-500 text-white rounded-xl flex flex-col items-center justify-center gap-1 active:bg-red-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-xs font-medium">{t('common.delete', 'ลบ')}</span>
        </button>
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableOrderCard;
