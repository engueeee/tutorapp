import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getStudents,
  getCourses,
  getLessons,
  getRevenueData,
  dataManager,
} from "@/lib/dataManager";

interface DashboardData {
  students: any[];
  courses: any[];
  lessons: any[];
  revenue: any;
}

interface UseDashboardDataOptions {
  includeStudents?: boolean;
  includeCourses?: boolean;
  includeLessons?: boolean;
  includeRevenue?: boolean;
  lessonFilters?: {
    startDate?: string;
    endDate?: string;
    studentId?: string;
  };
  revenueFilters?: {
    startDate: string;
    endDate: string;
    studentId?: string;
  };
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    students: [],
    courses: [],
    lessons: [],
    revenue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(
    () => options,
    [
      options.includeStudents,
      options.includeCourses,
      options.includeLessons,
      options.includeRevenue,
      JSON.stringify(options.lessonFilters),
      JSON.stringify(options.revenueFilters),
    ]
  );

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises: Promise<any>[] = [];

      // Load students if requested
      if (memoizedOptions.includeStudents && user.role === "tutor") {
        promises.push(getStudents(user.id));
      }

      // Load courses if requested
      if (memoizedOptions.includeCourses && user.role === "tutor") {
        promises.push(getCourses(user.id));
      }

      // Load lessons if requested
      if (memoizedOptions.includeLessons) {
        const lessonFilters = {
          tutorId: user.role === "tutor" ? user.id : undefined,
          ...memoizedOptions.lessonFilters,
        };
        promises.push(getLessons(lessonFilters));
      }

      // Load revenue if requested
      if (
        memoizedOptions.includeRevenue &&
        user.role === "tutor" &&
        memoizedOptions.revenueFilters
      ) {
        promises.push(
          getRevenueData(
            memoizedOptions.revenueFilters.startDate,
            memoizedOptions.revenueFilters.endDate,
            memoizedOptions.revenueFilters.studentId
          )
        );
      }

      // Wait for all requests to complete
      const results = await Promise.allSettled(promises);

      // Process results
      const newData: DashboardData = {
        students: [],
        courses: [],
        lessons: [],
        revenue: null,
      };

      let resultIndex = 0;

      if (memoizedOptions.includeStudents && user.role === "tutor") {
        const result = results[resultIndex];
        if (result.status === "fulfilled") {
          newData.students = result.value;
        }
        resultIndex++;
      }

      if (memoizedOptions.includeCourses && user.role === "tutor") {
        const result = results[resultIndex];
        if (result.status === "fulfilled") {
          newData.courses = result.value;
        }
        resultIndex++;
      }

      if (memoizedOptions.includeLessons) {
        const result = results[resultIndex];
        if (result.status === "fulfilled") {
          newData.lessons = result.value;
        }
        resultIndex++;
      }

      if (
        memoizedOptions.includeRevenue &&
        user.role === "tutor" &&
        memoizedOptions.revenueFilters
      ) {
        const result = results[resultIndex];
        if (result.status === "fulfilled") {
          newData.revenue = result.value;
        }
      }

      setData(newData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, memoizedOptions]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh function
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Invalidate specific cache entries
  const invalidateCache = useCallback((pattern?: string) => {
    dataManager.invalidateCache(pattern);
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return dataManager.getCacheStats();
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    invalidateCache,
    getCacheStats,
  };
}
