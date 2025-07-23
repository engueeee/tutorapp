import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ProfilePhoto } from "@/components/ui/ProfilePhoto";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Calendar,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showUserInfo?: boolean;
  showNavigation?: boolean;
}

export function DashboardHeader({
  title,
  subtitle,
  showUserInfo = true,
  showNavigation = true,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.email?.split("@")?.[0] || "Utilisateur";

  const getNavigationItems = () => {
    const isTutor = user?.role === "tutor";
    const basePath = isTutor ? "/dashboard/tutor" : "/dashboard/student";

    if (isTutor) {
      return [
        {
          href: "/dashboard/tutor",
          label: "Tableau de bord",
          icon: Home,
          active: pathname === "/dashboard/tutor",
        },
        {
          href: "/dashboard/tutor/courses",
          label: "Cours",
          icon: BookOpen,
          active: pathname.startsWith("/dashboard/tutor/courses"),
        },
        {
          href: "/dashboard/tutor/calendar",
          label: "Calendrier",
          icon: Calendar,
          active: pathname.startsWith("/dashboard/tutor/calendar"),
        },
        {
          href: "/dashboard/tutor/students",
          label: "Étudiants",
          icon: Users,
          active: pathname.startsWith("/dashboard/tutor/students"),
        },
        {
          href: "/dashboard/tutor/revenue",
          label: "Revenus",
          icon: BarChart3,
          active: pathname.startsWith("/dashboard/tutor/revenue"),
        },
      ];
    } else {
      return [
        {
          href: "/dashboard/student",
          label: "Tableau de bord",
          icon: Home,
          active: pathname === "/dashboard/student",
        },
        {
          href: "/dashboard/student/calendar",
          label: "Calendrier",
          icon: Calendar,
          active: pathname.startsWith("/dashboard/student/calendar"),
        },
        {
          href: "/dashboard/student/courses",
          label: "Mes cours",
          icon: BookOpen,
          active: pathname.startsWith("/dashboard/student/courses"),
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link
              href={
                user?.role === "tutor"
                  ? "/dashboard/tutor"
                  : "/dashboard/student"
              }
              className="flex items-center gap-2"
            >
              <img src="/logo.png" alt="TutorApp Logo" className="h-8 w-auto" />
              <span className="hidden sm:block text-xl font-bold text-primary">
                Tutor Together
              </span>
            </Link>

            {/* Desktop Navigation */}
            {showNavigation && (
              <nav className="hidden md:flex items-center gap-6 ml-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.active
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:text-primary hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4">
            {/* Page Title (Mobile) */}
            <div className="md:hidden">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>

            {/* Desktop User Info */}
            {showUserInfo && (
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === "tutor" ? "Tuteur" : "Étudiant"}
                  </p>
                </div>
                <ProfilePhoto size="md" />
                <LogoutButton />
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && showNavigation && (
          <div className="md:hidden border-t bg-white">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      item.active
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info */}
            {showUserInfo && (
              <div className="border-t pt-4 px-3 pb-3">
                <div className="flex items-center gap-3">
                  <ProfilePhoto size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role === "tutor" ? "Tuteur" : "Étudiant"}
                    </p>
                  </div>
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Page Title */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8 py-4 border-t">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
