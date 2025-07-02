import { LogoutButton } from "@/components/auth/LogoutButton";

interface TutorDashboardHeaderProps {
  firstName: string;
  lastName: string;
}

export function TutorDashboardHeader({
  firstName,
  lastName,
}: TutorDashboardHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
      <p className="text-muted-foreground">
        Welcome back, {firstName} {lastName}
      </p>
    </div>
  );
}
