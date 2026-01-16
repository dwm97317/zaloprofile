/**
 * Performance Monitor Utility
 * 
 * Monitors and logs key performance metrics.
 * Tracks FCP, TTI, FPS, memory usage, and API calls.
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fcp: null,
      tti: null,
      fps: [],
      memoryUsage: [],
      apiCalls: 0,
      cacheHits: 0,
    };
    
    this.observers = [];
    this.isMonitoring = false;
  }

  /**
   * Start monitoring performance
   */
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupPerformanceObserver();
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Setup Performance Observer for paint and navigation timing
   */
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            console.log(`[Performance] First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.metrics.tti = entry.domInteractive;
            console.log(`[Performance] Time to Interactive: ${entry.domInteractive.toFixed(2)}ms`);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (error) {
      console.warn('[Performance] Observer setup failed:', error);
    }
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      if (!this.isMonitoring) return;

      frames++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      // Calculate FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frames * 1000) / elapsed);
        this.metrics.fps.push(fps);
        
        // Keep only last 60 samples (1 minute at 1 sample/sec)
        if (this.metrics.fps.length > 60) {
          this.metrics.fps.shift();
        }

        // Warn if FPS drops below 60
        if (fps < 60) {
          console.warn(`[Performance] FPS dropped to ${fps}`);
        }

        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    if (!performance.memory) {
      console.warn('[Performance] Memory API not available');
      return;
    }

    const measureMemory = () => {
      if (!this.isMonitoring) return;

      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      this.metrics.memoryUsage.push(memoryMB);

      // Keep only last 60 samples
      if (this.metrics.memoryUsage.length > 60) {
        this.metrics.memoryUsage.shift();
      }

      // Warn if memory exceeds 50MB
      if (memoryMB > 50) {
        console.warn(`[Performance] Memory usage: ${memoryMB.toFixed(2)}MB`);
      }

      setTimeout(measureMemory, 1000);
    };

    measureMemory();
  }

  /**
   * Track API call
   */
  trackAPICall() {
    this.metrics.apiCalls++;
  }

  /**
   * Track cache hit
   */
  trackCacheHit() {
    this.metrics.cacheHits++;
  }

  /**
   * Get current metrics
   * @returns {object} - Current performance metrics
   */
  getMetrics() {
    const avgFPS = this.metrics.fps.length > 0
      ? this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length
      : 0;

    const avgMemory = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length
      : 0;

    const cacheHitRate = this.metrics.apiCalls > 0
      ? (this.metrics.cacheHits / (this.metrics.apiCalls + this.metrics.cacheHits)) * 100
      : 0;

    return {
      fcp: this.metrics.fcp,
      tti: this.metrics.tti,
      avgFPS: Math.round(avgFPS),
      currentFPS: this.metrics.fps[this.metrics.fps.length - 1] || 0,
      avgMemoryMB: avgMemory.toFixed(2),
      currentMemoryMB: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]?.toFixed(2) || 0,
      apiCalls: this.metrics.apiCalls,
      cacheHits: this.metrics.cacheHits,
      cacheHitRate: cacheHitRate.toFixed(2) + '%',
    };
  }

  /**
   * Log performance report
   */
  logReport() {
    const metrics = this.getMetrics();
    
    console.group('[Performance Report]');
    console.log('First Contentful Paint:', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A');
    console.log('Time to Interactive:', metrics.tti ? `${metrics.tti.toFixed(2)}ms` : 'N/A');
    console.log('Average FPS:', metrics.avgFPS);
    console.log('Current FPS:', metrics.currentFPS);
    console.log('Average Memory:', `${metrics.avgMemoryMB}MB`);
    console.log('Current Memory:', `${metrics.currentMemoryMB}MB`);
    console.log('API Calls:', metrics.apiCalls);
    console.log('Cache Hits:', metrics.cacheHits);
    console.log('Cache Hit Rate:', metrics.cacheHitRate);
    console.groupEnd();

    return metrics;
  }

  /**
   * Check if performance targets are met
   * @returns {object} - Test results
   */
  validateTargets() {
    const metrics = this.getMetrics();
    
    const results = {
      fcp: {
        target: 1500,
        actual: metrics.fcp,
        passed: metrics.fcp ? metrics.fcp < 1500 : null,
      },
      tti: {
        target: 2500,
        actual: metrics.tti,
        passed: metrics.tti ? metrics.tti < 2500 : null,
      },
      fps: {
        target: 60,
        actual: metrics.avgFPS,
        passed: metrics.avgFPS >= 60,
      },
      memory: {
        target: 50,
        actual: parseFloat(metrics.avgMemoryMB),
        passed: parseFloat(metrics.avgMemoryMB) < 50,
      },
      cacheHitRate: {
        target: 60,
        actual: parseFloat(metrics.cacheHitRate),
        passed: parseFloat(metrics.cacheHitRate) > 60,
      },
    };

    console.group('[Performance Validation]');
    Object.entries(results).forEach(([key, result]) => {
      const status = result.passed === null ? '⏳' : result.passed ? '✅' : '❌';
      console.log(`${status} ${key}:`, `${result.actual} (target: ${result.target})`);
    });
    console.groupEnd();

    return results;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
