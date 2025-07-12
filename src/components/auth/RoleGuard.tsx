"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!user) {
      // User not logged in, redirect to login
      router.replace("/login");
      return;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
}
