// Centralized Data Manager for efficient API request handling
// Handles caching, request deduplication, and data synchronization

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

interface RequestOptions {
  forceRefresh?: boolean;
  cacheDuration?: number;
}

class DataManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private defaultCacheDuration = 5 * 60 * 1000; // 5 minutes

  // Request deduplication - prevents multiple identical requests
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Generic fetch with caching and deduplication
  async fetchWithCache<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const { forceRefresh = false, cacheDuration = this.defaultCacheDuration } =
      options;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        console.log(`📦 DataManager: Using cached data for ${key}`);
        return cached.data;
      }
    }

    // Deduplicate request
    return this.deduplicateRequest(key, async () => {
      console.log(`🌐 DataManager: Fetching fresh data for ${key}`);
      const data = await requestFn();

      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });

      return data;
    });
  }

  // User data management
  async getUserData(userId: string, includeAll = false): Promise<any> {
    const key = `user:${userId}:${includeAll ? "full" : "basic"}`;

    return this.fetchWithCache(key, async () => {
      const url = `/api/users/${userId}${includeAll ? "?includeAll=true" : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      return response.json();
    });
  }

  // Students data management
  async getStudents(tutorId?: string, userId?: string): Promise<any[]> {
    const key = `students:${tutorId || "all"}:${userId || "none"}`;

    return this.fetchWithCache(key, async () => {
      let url = "/api/students";
      const params = new URLSearchParams();

      if (tutorId) params.append("tutorId", tutorId);
      if (userId) params.append("userId", userId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }

      return response.json();
    });
  }

  // Courses data management
  async getCourses(tutorId?: string): Promise<any[]> {
    const key = `courses:${tutorId || "all"}`;

    return this.fetchWithCache(key, async () => {
      let url = "/api/courses";
      if (tutorId) {
        url += `?tutorId=${tutorId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      return response.json();
    });
  }

  // Lessons data management
  async getLessons(
    filters: {
      tutorId?: string;
      studentId?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<any[]> {
    const key = `lessons:${JSON.stringify(filters)}`;

    return this.fetchWithCache(
      key,
      async () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const url = `/api/lessons${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch lessons: ${response.status}`);
        }

        return response.json();
      },
      { cacheDuration: 2 * 60 * 1000 }
    ); // 2 minutes for lessons
  }

  // Revenue data management
  async getRevenueData(
    startDate: string,
    endDate: string,
    studentId?: string
  ): Promise<any> {
    const key = `revenue:${startDate}:${endDate}:${studentId || "all"}`;

    return this.fetchWithCache(
      key,
      async () => {
        const params = new URLSearchParams({
          startDate,
          endDate,
          ...(studentId && { studentId }),
        });

        const response = await fetch(`/api/revenue?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch revenue data: ${response.status}`);
        }

        return response.json();
      },
      { cacheDuration: 1 * 60 * 1000 }
    ); // 1 minute for revenue data
  }

  // Invalidate cache entries
  invalidateCache(pattern?: string): void {
    if (pattern) {
      // Invalidate specific pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          console.log(`🗑️ DataManager: Invalidated cache for ${key}`);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
      console.log("🗑️ DataManager: Cleared all cache");
    }
  }

  // Invalidate user-related cache
  invalidateUserCache(userId: string): void {
    this.invalidateCache(`user:${userId}`);
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Preload data for better performance
  async preloadUserData(userId: string): Promise<void> {
    try {
      await this.getUserData(userId, false); // Preload basic data
      console.log(`🚀 DataManager: Preloaded user data for ${userId}`);
    } catch (error) {
      console.warn(
        `⚠️ DataManager: Failed to preload user data for ${userId}:`,
        error
      );
    }
  }
}

// Singleton instance
export const dataManager = new DataManager();

// Convenience functions
export const getUserData = (userId: string, includeAll = false) =>
  dataManager.getUserData(userId, includeAll);

export const getStudents = (tutorId?: string, userId?: string) =>
  dataManager.getStudents(tutorId, userId);

export const getCourses = (tutorId?: string) => dataManager.getCourses(tutorId);

export const getLessons = (filters: any = {}) =>
  dataManager.getLessons(filters);

export const getRevenueData = (
  startDate: string,
  endDate: string,
  studentId?: string
) => dataManager.getRevenueData(startDate, endDate, studentId);

export const invalidateCache = (pattern?: string) =>
  dataManager.invalidateCache(pattern);

export const preloadUserData = (userId: string) =>
  dataManager.preloadUserData(userId);
