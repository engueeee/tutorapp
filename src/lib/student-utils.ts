export interface StudentStatus {
  status: "active" | "recent" | "absent";
  color: string;
  label: string;
  description: string;
}

export function calculateStudentStatus(
  lastActivity: Date | null
): StudentStatus {
  if (!lastActivity) {
    return {
      status: "absent",
      color: "bg-red-500",
      label: "Absent",
      description: "Aucune activité récente",
    };
  }

  const now = new Date();
  const diffInHours =
    (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  if (diffInHours <= 24) {
    return {
      status: "active",
      color: "bg-green-500",
      label: "Actif",
      description: "Actif aujourd'hui",
    };
  } else if (diffInHours <= 48) {
    return {
      status: "recent",
      color: "bg-orange-500",
      label: "Récent",
      description: "Connecté récemment",
    };
  } else {
    return {
      status: "absent",
      color: "bg-red-500",
      label: "Absent",
      description: "Dernière activité il y a plus de 3 jours",
    };
  }
}

export function getStudentInitials(
  firstName: string,
  lastName: string
): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getDefaultAvatarColor(studentId: string): string {
  // Generate a consistent color based on student ID
  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600",
    "from-red-500 to-red-600",
  ];

  const hash = studentId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}
