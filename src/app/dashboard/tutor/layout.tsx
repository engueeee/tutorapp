"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Calendar } from "lucide-react";

export default function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col p-6">
          <img
            src="/logo.png"
            alt="TutorApp Logo"
            className="mx-auto mb-3 max-w-[120px]"
          />
          <div className="flex justify-center text-2xl font-bold mb-8 text-primary">
            <Link href="/dashboard/tutor">Tutor Together</Link>
          </div>
          <nav className="flex flex-col gap-4">
            <Link
              href="/dashboard/tutor"
              className={
                pathname === "/dashboard/tutor"
                  ? "text-primary font-bold"
                  : "hover:text-primary font-medium"
              }
            >
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/tutor/courses"
              className={
                pathname.startsWith("/dashboard/tutor/courses")
                  ? "text-primary font-bold"
                  : "hover:text-primary"
              }
            >
              Cours
            </Link>
            <Link
              href="/dashboard/tutor/calendar"
              className={
                pathname.startsWith("/dashboard/tutor/calendar")
                  ? "text-primary font-bold"
                  : "hover:text-primary"
              }
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendrier
              </div>
            </Link>
            <Link href="/dashboard/tutor" className="hover:text-primary">
              Leçons
            </Link>
            {/* Add more links as needed */}
          </nav>
          <div className="mt-auto pt-8 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} TutorApp
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <div className="font-semibold text-lg text-primary">
              Espace Tuteur
            </div>
            <LogoutButton />
          </header>
          {/* Breadcrumbs placeholder */}
          <div className="px-8 py-2 bg-gray-100 border-b">
            {/* Breadcrumbs will go here */}
          </div>
          {/* Page content */}
          <div className="flex-1 p-8">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
