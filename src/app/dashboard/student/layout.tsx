"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </RoleGuard>
  );
}

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Get page title and subtitle based on current path
  const getPageInfo = () => {
    switch (pathname) {
      case "/dashboard/student":
        return {
          title: "Tableau de bord étudiant",
          subtitle: "Voici un aperçu de vos cours et de vos prochaines leçons.",
        };
      case "/dashboard/student/calendar":
        return {
          title: "Mon Calendrier",
          subtitle: "Gérez vos leçons et événements personnels",
        };
      case "/dashboard/student/courses":
        return {
          title: "Mes Cours",
          subtitle: "Consultez tous vos cours et leçons",
        };
      case "/dashboard/student/settings":
        return {
          title: "Paramètres",
          subtitle: "Gérez vos préférences et votre profil",
        };
      default:
        return {
          title: "Tableau de bord étudiant",
          subtitle: "Voici un aperçu de vos cours et de vos prochaines leçons.",
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={pageInfo.title}
        subtitle={pageInfo.subtitle}
        showUserInfo={true}
        showNavigation={true}
      />
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
