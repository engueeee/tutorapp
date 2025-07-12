import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface StudentDashboardHeaderProps {
  userName: string;
}

export function StudentDashboardHeader({
  userName,
}: StudentDashboardHeaderProps) {
  return (
    <DashboardHeader
      title="Tableau de bord étudiant"
      subtitle={`Bienvenue, ${userName}`}
    />
  );
}
