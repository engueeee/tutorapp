import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronRight,
  Home,
  BookOpen,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getBreadcrumbItems = () => {
    const isTutor = user?.role === "tutor";
    const basePath = isTutor ? "/dashboard/tutor" : "/dashboard/student";

    if (isTutor) {
      const items = [
        {
          href: "/dashboard/tutor",
          label: "Tableau de bord",
          icon: Home,
        },
      ];

      if (pathname.startsWith("/dashboard/tutor/courses")) {
        items.push({
          href: "/dashboard/tutor/courses",
          label: "Cours",
          icon: BookOpen,
        });

        // Add course detail breadcrumb if we're on a specific course page
        if (pathname.match(/\/dashboard\/tutor\/courses\/[^\/]+$/)) {
          items.push({
            href: pathname,
            label: "Détails du cours",
            icon: BookOpen,
          });
        }
      }

      if (pathname.startsWith("/dashboard/tutor/calendar")) {
        items.push({
          href: "/dashboard/tutor/calendar",
          label: "Calendrier",
          icon: Calendar,
        });
      }

      if (pathname.startsWith("/dashboard/tutor/students")) {
        items.push({
          href: "/dashboard/tutor/students",
          label: "Étudiants",
          icon: Users,
        });
      }

      if (pathname.startsWith("/dashboard/tutor/revenue")) {
        items.push({
          href: "/dashboard/tutor/revenue",
          label: "Revenus",
          icon: BarChart3,
        });
      }

      return items;
    } else {
      const items = [
        {
          href: "/dashboard/student",
          label: "Tableau de bord",
          icon: Home,
        },
      ];

      if (pathname.startsWith("/dashboard/student/calendar")) {
        items.push({
          href: "/dashboard/student/calendar",
          label: "Calendrier",
          icon: Calendar,
        });
      }

      if (pathname.startsWith("/dashboard/student/courses")) {
        items.push({
          href: "/dashboard/student/courses",
          label: "Mes cours",
          icon: BookOpen,
        });
      }

      return items;
    }
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Don't show breadcrumbs on the main dashboard page
  if (pathname === "/dashboard/tutor" || pathname === "/dashboard/student") {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      {breadcrumbItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === breadcrumbItems.length - 1;
        const isActive = pathname === item.href;

        return (
          <div key={item.href} className="flex items-center space-x-2">
            <Link
              href={item.href}
              className={`flex items-center space-x-1 transition-colors ${
                isActive ? "text-primary font-bold" : "hover:text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
            {!isLast && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}
