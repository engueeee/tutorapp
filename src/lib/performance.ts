import { useMemo, useCallback } from "react";

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Memoization utility for expensive computations
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Callback memoization utility
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Lazy loading utility
export function lazyLoad<T>(
  importFunc: () => Promise<{ default: T }>
): () => Promise<T> {
  let cached: T | null = null;
  return async () => {
    if (!cached) {
      const module = await importFunc();
      cached = module.default;
    }
    return cached;
  };
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    return new IntersectionObserver(callback, options);
  }, [callback, options]);
}
