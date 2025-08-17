interface TutorDashboardHeaderProps {
  firstName: string;
  lastName: string;
}

export function TutorDashboardHeader({
  firstName,
  lastName,
}: TutorDashboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">
        Bonjour, {firstName} {lastName} !
      </h1>
      <p className="text-blue-100">
        Gérez vos cours, vos étudiants et suivez vos revenus depuis votre
        tableau de bord.
      </p>
    </div>
  );
}
