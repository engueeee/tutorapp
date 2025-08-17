import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserData } from "@/lib/dataManager";

interface UseFastDashboardOptions {
  requireOnboarding?: boolean;
  role?: "tutor" | "student";
}

export function useFastDashboard(options: UseFastDashboardOptions = {}) {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(
    () => options,
    [options.requireOnboarding, options.role]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("No user found");
      setLoading(false);
      return;
    }

    if (memoizedOptions.role && user.role !== memoizedOptions.role) {
      setError(`User is not a ${memoizedOptions.role}`);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Use centralized data manager for efficient caching and deduplication
        const data = await getUserData(
          user.id,
          memoizedOptions.requireOnboarding
        );

        if (data) {
          setUserData(data);
          setOnboardingCompleted(data.onboardingCompleted || false);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, memoizedOptions]);

  return {
    user,
    userData,
    loading: authLoading || loading,
    error,
    onboardingCompleted,
    isReady: !authLoading && !loading && !error && user,
  };
}
