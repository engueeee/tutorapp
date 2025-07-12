import { LogoutButton } from "@/components/auth/LogoutButton";
import { ProfilePhoto } from "@/components/ui/ProfilePhoto";
import { useAuth } from "@/context/AuthContext";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showUserInfo?: boolean;
}

export function DashboardHeader({
  title,
  subtitle,
  showUserInfo = true,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.email?.split("@")?.[0] || "Utilisateur";

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {showUserInfo && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">
                {user?.role === "tutor" ? "Tuteur" : "Étudiant"}
              </p>
            </div>
            <ProfilePhoto size="xl" />
          </div>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
