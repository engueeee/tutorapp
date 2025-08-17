import { useState, useEffect, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

interface UseApiOptions {
  cacheTime?: number; // Cache time in milliseconds (default: 5 minutes)
  staleTime?: number; // Time before data is considered stale (default: 1 minute)
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

const cache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();

export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
} {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 60 * 1000, // 1 minute
    refetchOnWindowFocus = true,
    refetchOnMount = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (forceRefetch = false) => {
      if (!url) return;

      const cacheKey = url;
      const now = Date.now();
      const cachedEntry = cache.get(cacheKey);

      // Check if we have valid cached data
      if (
        !forceRefetch &&
        cachedEntry &&
        now - cachedEntry.timestamp < staleTime
      ) {
        setData(cachedEntry.data);
        setError(null);
        return;
      }

      // Check if there's already a pending request
      if (pendingRequests.has(cacheKey)) {
        try {
          const result = await pendingRequests.get(cacheKey);
          setData(result);
          setError(null);
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Request failed");
          return;
        }
      }

      setLoading(true);
      setError(null);

      const fetchPromise = fetch(url)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          // Cache the result
          cache.set(cacheKey, {
            data: result,
            timestamp: now,
          });

          // Clean up old cache entries
          for (const [key, entry] of cache.entries()) {
            if (now - entry.timestamp > cacheTime) {
              cache.delete(key);
            }
          }

          setData(result);
          setError(null);
          pendingRequests.delete(cacheKey);
          return result;
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Request failed");
          pendingRequests.delete(cacheKey);
          throw err;
        })
        .finally(() => {
          setLoading(false);
        });

      pendingRequests.set(cacheKey, fetchPromise);
    },
    [url, cacheTime, staleTime]
  );

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  const mutate = useCallback(
    (newData: T) => {
      if (!url) return;

      setData(newData);
      const cacheKey = url;
      cache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
      });
    },
    [url]
  );

  // Simple useEffect that only depends on url
  useEffect(() => {
    if (refetchOnMount && url) {
      const fetchDataDirect = async () => {
        if (!url) return;

        const cacheKey = url;
        const now = Date.now();
        const cachedEntry = cache.get(cacheKey);

        // Check if we have valid cached data
        if (cachedEntry && now - cachedEntry.timestamp < staleTime) {
          setData(cachedEntry.data);
          setError(null);
          return;
        }

        // Check if there's already a pending request
        if (pendingRequests.has(cacheKey)) {
          try {
            const result = await pendingRequests.get(cacheKey);
            setData(result);
            setError(null);
            return;
          } catch (err) {
            setError(err instanceof Error ? err.message : "Request failed");
            return;
          }
        }

        setLoading(true);
        setError(null);

        const fetchPromise = fetch(url)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((result) => {
            // Cache the result
            cache.set(cacheKey, {
              data: result,
              timestamp: now,
            });

            // Clean up old cache entries
            for (const [key, entry] of cache.entries()) {
              if (now - entry.timestamp > cacheTime) {
                cache.delete(key);
              }
            }

            setData(result);
            setError(null);
            pendingRequests.delete(cacheKey);
            return result;
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Request failed");
            pendingRequests.delete(cacheKey);
            throw err;
          })
          .finally(() => {
            setLoading(false);
          });

        pendingRequests.set(cacheKey, fetchPromise);
      };

      fetchDataDirect();
    }
  }, [url, refetchOnMount, cacheTime, staleTime]);

  useEffect(() => {
    if (!refetchOnWindowFocus || !url) return;

    const handleFocus = () => {
      fetchData(true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [url, refetchOnWindowFocus, fetchData]);

  return { data, loading, error, refetch, mutate };
}

// Utility function to clear cache
export function clearApiCache(pattern?: string) {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
  pendingRequests.clear();
}

// Utility function to prefetch data
export async function prefetchApi<T>(url: string): Promise<T> {
  const cacheKey = url;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!.data;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const promise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      pendingRequests.delete(cacheKey);
      return result;
    })
    .catch((err) => {
      pendingRequests.delete(cacheKey);
      throw err;
    });

  pendingRequests.set(cacheKey, promise);
  return promise;
}
