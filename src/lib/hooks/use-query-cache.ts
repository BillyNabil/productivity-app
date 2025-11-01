"use client";

/**
 * 🚀 Query Cache Hook - Prevents unnecessary database calls
 * 
 * Features:
 * - Caches query results in sessionStorage
 * - Auto-invalidates on mutations (create, update, delete)
 * - TTL (Time To Live) support
 * - Automatic cleanup
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const CACHE_PREFIX = "productivity_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function useQueryCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
) {
  const cacheKey = `${CACHE_PREFIX}${key}`;

  const getFromCache = (): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;

      const entry = JSON.parse(cached) as CacheEntry<T>;
      const now = Date.now();

      // Check if cache has expired
      if (now - entry.timestamp > entry.ttl) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Cache read error:", error);
      return null;
    }
  };

  const setInCache = (data: T): void => {
    if (typeof window === "undefined") return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.error("Cache write error:", error);
    }
  };

  const invalidate = (): void => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(cacheKey);
  };

  return { getFromCache, setInCache, invalidate };
}

/**
 * 🧹 Clear all caches - call this when mutations happen
 */
export function clearAllCaches(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

/**
 * 📊 Get cache stats (for debugging)
 */
export function getCacheStats(): { size: number; entries: string[] } {
  if (typeof window === "undefined") {
    return { size: 0, entries: [] };
  }

  const entries: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      entries.push(key.replace(CACHE_PREFIX, ""));
    }
  }

  return {
    size: entries.length,
    entries,
  };
}
