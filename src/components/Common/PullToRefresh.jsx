import { useState, useRef, useCallback } from 'react';

/**
 * PullToRefresh Component
 * 
 * Implements pull-to-refresh gesture for mobile devices.
 * Provides native-like refresh experience with visual feedback.
 */
const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const touchStartY = useRef(0);
  const containerRef = useRef(null);
  
  const THRESHOLD = 80; // 80px to trigger refresh
  const DAMPING = 0.5; // Damping factor for pull resistance
  const MAX_PULL = 120; // Maximum pull distance

  const handleTouchStart = useCallback((e) => {
    // Only allow pull-to-refresh when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY.current;

    // Only pull down
    if (deltaY > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      // Prevent default page scroll
      e.preventDefault();
      
      // Apply damping and limit max pull
      const dampedDistance = Math.min(deltaY * DAMPING, MAX_PULL);
      setPullDistance(dampedDistance);
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    // Trigger refresh if pulled beyond threshold
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back if not enough pull
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const getRotation = () => {
    // Rotate indicator based on pull distance
    return Math.min((pullDistance / THRESHOLD) * 360, 360);
  };

  const getOpacity = () => {
    return Math.min(pullDistance / THRESHOLD, 1);
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center transition-opacity"
        style={{
          height: `${Math.min(pullDistance, MAX_PULL)}px`,
          opacity: getOpacity(),
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-3 border-primary-500 border-t-transparent transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? 'rotate(0deg)' : `rotate(${getRotation()}deg)`,
          }}
        />
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="h-full overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
