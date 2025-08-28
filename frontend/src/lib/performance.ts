// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for search inputs and other frequent updates
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events and resize handlers
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Intersection Observer wrapper for lazy loading
  createIntersectionObserver: (
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
  ) => {
    if (typeof window === 'undefined') return null;

    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, defaultOptions);
  },

  // Preload resources
  preloadResource: (href: string, as: string = 'fetch') => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = href;
    document.head.appendChild(link);
  },

  // Image lazy loading helper
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = performanceUtils.createIntersectionObserver((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        img.classList.remove('blur-sm');
        observer?.disconnect();
      }
    });

    if (observer) {
      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = src;
    }
  },

  // Measure performance metrics
  measurePerformance: <T>(name: string, fn: () => T | Promise<T>): T | Promise<T> => {
    if (typeof window === 'undefined') return fn();

    const start = performance.now();

    try {
      const result = fn();

      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result.then((actualResult) => {
          const end = performance.now();
          console.log(`⚡ Performance [${name}]: ${(end - start).toFixed(2)}ms`);
          return actualResult;
        }).catch((error) => {
          const end = performance.now();
          console.log(`⚡ Performance [${name}]: ${(end - start).toFixed(2)}ms (ERROR)`);
          throw error;
        });
      } else {
        const end = performance.now();
        console.log(`⚡ Performance [${name}]: ${(end - start).toFixed(2)}ms`);
        return result;
      }
    } catch (error) {
      const end = performance.now();
      console.log(`⚡ Performance [${name}]: ${(end - start).toFixed(2)}ms (ERROR)`);
      throw error;
    }
  }
};

// React hooks for performance optimization
export const usePerformance = () => {
  return {
    debounce: performanceUtils.debounce,
    throttle: performanceUtils.throttle,
    createIntersectionObserver: performanceUtils.createIntersectionObserver,
    preloadResource: performanceUtils.preloadResource,
    lazyLoadImage: performanceUtils.lazyLoadImage,
    measurePerformance: performanceUtils.measurePerformance as <T>(name: string, fn: () => T | Promise<T>) => T | Promise<T>
  };
};

export default performanceUtils;
