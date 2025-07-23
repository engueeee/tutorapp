"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with Navigation */}
        <DashboardHeader
          title="Espace Étudiant"
          subtitle="Accédez à vos cours et leçons"
          showUserInfo={true}
          showNavigation={true}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
