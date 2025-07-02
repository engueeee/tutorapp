import { LogoutButton } from "@/components/auth/LogoutButton";

interface StudentDashboardHeaderProps {
  userName: string;
}

export function StudentDashboardHeader({
  userName,
}: StudentDashboardHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="text-muted-foreground">Welcome back, {userName}</p>
    </div>
  );
}
