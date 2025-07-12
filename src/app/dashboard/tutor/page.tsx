// Fichier : /src/app/dashboard/tutor/page.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TutorDashboardWithData } from "@/modules/dashboard/tutor/TutorDashboardWithData";

export default function TutorDashboardPage() {
  const pathname = usePathname();
  return (
    <div>
      <nav className="mb-4 text-sm text-gray-500 flex gap-2">
        <Link
          href="/dashboard/tutor"
          className={
            pathname === "/dashboard/tutor"
              ? "font-bold text-primary"
              : "hover:text-primary"
          }
        >
          Tableau de bord
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/tutor/courses"
          className={
            pathname.startsWith("/dashboard/tutor/courses")
              ? "font-bold text-primary"
              : "hover:text-primary"
          }
        >
          Cours
        </Link>
      </nav>
      <TutorDashboardWithData />
    </div>
  );
}
