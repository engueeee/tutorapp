"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with Navigation */}
        <DashboardHeader
          title="Espace Tuteur"
          subtitle="Gérez vos cours, étudiants et leçons"
          showUserInfo={true}
          showNavigation={true}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
