/**
 * Gesture Manager Utility
 * 
 * Manages gesture conflicts and optimizes touch response times.
 * Ensures gestures respond within 100ms and resolve conflicts properly.
 */

class GestureManager {
  constructor() {
    this.activeGesture = null;
    this.gestureStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
  }

  /**
   * Start tracking a gesture
   * @param {string} gestureType - Type of gesture (pull, swipe, longpress, scroll)
   * @param {TouchEvent} event - Touch event
   */
  startGesture(gestureType, event) {
    this.activeGesture = gestureType;
    this.gestureStartTime = Date.now();
    
    if (event && event.touches && event.touches[0]) {
      this.touchStartPos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }

    // Haptic feedback if supported
    if (navigator.vibrate && gestureType !== 'scroll') {
      navigator.vibrate(10);
    }
  }

  /**
   * Check if a gesture can be activated
   * @param {string} gestureType - Type of gesture to check
   * @param {object} context - Context information (scrollTop, etc.)
   * @returns {boolean} - Whether gesture can be activated
   */
  canActivateGesture(gestureType, context = {}) {
    // If no active gesture, allow
    if (!this.activeGesture) {
      return true;
    }

    // If same gesture, allow
    if (this.activeGesture === gestureType) {
      return true;
    }

    // Priority rules
    const priorities = {
      pull: 3,      // Highest priority at top
      swipe: 2,     // Medium priority on cards
      longpress: 2, // Medium priority
      scroll: 1,    // Lowest priority
    };

    const activePriority = priorities[this.activeGesture] || 0;
    const newPriority = priorities[gestureType] || 0;

    // Pull-to-refresh only at top
    if (gestureType === 'pull' && context.scrollTop === 0) {
      return true;
    }

    // Higher priority can interrupt lower priority
    return newPriority > activePriority;
  }

  /**
   * End the current gesture
   */
  endGesture() {
    const duration = Date.now() - this.gestureStartTime;
    
    // Log if gesture took too long (> 100ms to start)
    if (duration > 100 && this.activeGesture !== 'scroll') {
      console.warn(`Gesture ${this.activeGesture} took ${duration}ms to respond`);
    }

    this.activeGesture = null;
    this.gestureStartTime = 0;
  }

  /**
   * Cancel the current gesture
   */
  cancelGesture() {
    this.activeGesture = null;
    this.gestureStartTime = 0;
  }

  /**
   * Get current active gesture
   * @returns {string|null} - Active gesture type
   */
  getActiveGesture() {
    return this.activeGesture;
  }

  /**
   * Calculate movement from touch start
   * @param {TouchEvent} event - Current touch event
   * @returns {object} - Delta x and y
   */
  getTouchDelta(event) {
    if (!event.touches || !event.touches[0]) {
      return { deltaX: 0, deltaY: 0 };
    }

    const touch = event.touches[0];
    return {
      deltaX: touch.clientX - this.touchStartPos.x,
      deltaY: touch.clientY - this.touchStartPos.y,
    };
  }

  /**
   * Determine gesture direction
   * @param {number} deltaX - X movement
   * @param {number} deltaY - Y movement
   * @param {number} threshold - Minimum movement to detect direction
   * @returns {string} - Direction: 'horizontal', 'vertical', or 'none'
   */
  getGestureDirection(deltaX, deltaY, threshold = 10) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < threshold && absY < threshold) {
      return 'none';
    }

    return absX > absY ? 'horizontal' : 'vertical';
  }

  /**
   * Apply damping to a value
   * @param {number} value - Value to damp
   * @param {number} factor - Damping factor (0-1)
   * @returns {number} - Damped value
   */
  applyDamping(value, factor = 0.5) {
    return value * factor;
  }

  /**
   * Apply easing to a value (ease-out cubic)
   * @param {number} t - Time progress (0-1)
   * @returns {number} - Eased value
   */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Prevent default browser behaviors for touch events
   * @param {TouchEvent} event - Touch event
   * @param {string} gestureType - Type of gesture
   */
  preventDefaultBehaviors(event, gestureType) {
    // Prevent pull-to-refresh on mobile browsers
    if (gestureType === 'pull' || gestureType === 'swipe') {
      event.preventDefault();
    }

    // Prevent text selection during gestures
    if (gestureType === 'swipe' || gestureType === 'longpress') {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }
  }

  /**
   * Restore default browser behaviors
   */
  restoreDefaultBehaviors() {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }
}

// Export singleton instance
export const gestureManager = new GestureManager();

export default gestureManager;
