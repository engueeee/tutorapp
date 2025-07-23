import { useState, useEffect, useCallback, useRef } from "react";
import { AsyncState, AppError } from "@/types";
import { studentsApi, coursesApi, lessonsApi } from "@/lib/api";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  immediate?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: "idle",
    error: null,
  });

  const hasInitialized = useRef(false);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: "loading", error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: "success", error: null });
      options.onSuccess?.(data);
    } catch (error) {
      const appError: AppError = {
        code: "API_ERROR",
        message: error instanceof Error ? error.message : "An error occurred",
        details: error,
      };
      setState({ data: null, loading: "error", error: appError });
      options.onError?.(appError);
    }
  }, [apiCall, options.onSuccess, options.onError]);

  useEffect(() => {
    if (options.immediate !== false && !hasInitialized.current) {
      hasInitialized.current = true;
      execute();
    }
  }, [options.immediate, execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch,
    execute,
  };
}

// Specialized hooks for common operations
export function useStudents(tutorId: string) {
  const apiCall = useCallback(() => {
    return studentsApi.getAll(tutorId);
  }, [tutorId]);
  return useApi(apiCall, { immediate: !!tutorId });
}

export function useCourses(tutorId: string) {
  const apiCall = useCallback(() => coursesApi.getAll(tutorId), [tutorId]);
  return useApi(apiCall, { immediate: !!tutorId });
}

export function useLessons(params?: {
  tutorId?: string;
  courseId?: string;
  studentId?: string;
}) {
  const apiCall = useCallback(() => lessonsApi.getAll(params), [params]);
  return useApi(apiCall, {
    immediate: !!params?.tutorId || !!params?.courseId || !!params?.studentId,
  });
}
