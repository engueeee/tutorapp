"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingUI } from "@/components/ui/LoadingUI";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
}: RoleGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("RoleGuard Debug:", {
    user,
    allowedRoles,
    isAuthorized,
    isLoading,
    userRole: user?.role,
    hasUser: !!user,
  });

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") return;

    // If user is null (logged out), redirect to login immediately
    if (!user) {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        // We have auth data in localStorage, wait a bit for context to load
        console.log("Auth data found in localStorage, waiting for context...");
        return;
      } else {
        // No auth data at all, redirect to login
        console.log("No auth data found, redirecting to login");
        router.replace("/login");
        return;
      }
    }

    if (!allowedRoles.includes(user.role)) {
      // User role not allowed, redirect to appropriate dashboard
      if (user.role === "student") {
        router.replace("/dashboard/student");
      } else if (user.role === "tutor") {
        router.replace("/dashboard/tutor");
      } else {
        router.replace("/login");
      }
      return;
    }

    // User is authorized
    setIsAuthorized(true);
    setIsLoading(false);
  }, [user, allowedRoles, router, redirectTo]);

  // Add a timeout to handle cases where context takes too long to load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const timeout = setTimeout(() => {
      if (isLoading && !user) {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (allowedRoles.includes(parsedUser.role)) {
              console.log("Using localStorage data after timeout");
              setIsAuthorized(true);
              setIsLoading(false);
            } else {
              console.log("User role not allowed, redirecting");
              router.replace("/login");
            }
          } catch (error) {
            console.error("Error parsing stored user:", error);
            router.replace("/login");
          }
        } else {
          console.log("No auth data after timeout, redirecting to login");
          router.replace("/login");
        }
      }
    }, 2000); // Wait 2 seconds for context to load

    return () => clearTimeout(timeout);
  }, [isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return <LoadingUI variant="page" />;
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
}
