import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export const usePerformance = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });

  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !localStorage.getItem('enable-performance-monitoring')) {
      return;
    }

    // Check if Performance API is available
    if (!('performance' in window) || !('PerformanceObserver' in window)) {
      console.warn('Performance API not supported');
      return;
    }

    // First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.fcp = lastEntry.startTime;
        console.log('FCP:', lastEntry.startTime);
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observation not supported');
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
        console.log('LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metricsRef.current.fid = entry.processingStart - entry.startTime;
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metricsRef.current.cls = clsValue;
        console.log('CLS:', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }

    // Time to First Byte (from navigation timing)
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart;
      console.log('TTFB:', navigation.responseStart - navigation.requestStart);
    }

    // Send metrics to analytics service (in production)
    const sendMetrics = () => {
      const metrics = metricsRef.current;

      // Example: Send to Google Analytics 4
      if ((window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'Performance Metrics',
          custom_map: {
            metric_fcp: metrics.fcp,
            metric_lcp: metrics.lcp,
            metric_fid: metrics.fid,
            metric_cls: metrics.cls,
            metric_ttfb: metrics.ttfb
          }
        });
      }

      // Example: Send to custom analytics endpoint
      // fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metrics)
      // });
    };

    // Send metrics after page load
    window.addEventListener('load', () => {
      setTimeout(sendMetrics, 0);
    });

    // Send metrics before page unload
    window.addEventListener('beforeunload', sendMetrics);

    return () => {
      // Cleanup observers
      try {
        if (typeof PerformanceObserver !== 'undefined') {
          // Note: In a real implementation, you'd keep references to observers and disconnect them
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  return metricsRef.current;
};
