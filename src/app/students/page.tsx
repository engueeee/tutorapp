import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { useAuth } from "@/context/AuthContext";

export default function StudentsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Ajouter un étudiant</h1>
      <AddStudentForm tutorId={user.id} />
    </div>
  );
}
