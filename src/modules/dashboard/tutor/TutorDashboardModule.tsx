import { TutorDashboardHeader } from "./TutorDashboardHeader";
import { CoursesSection } from "./CoursesSection";
import { StudentManager } from "@/components/dashboard/StudentManager";
import { Course } from "../types";

interface TutorDashboardModuleProps {
  firstName: string;
  lastName: string;
  tutorId: string;
  courses: Course[];
  onStudentAdded?: () => void;
}

export function TutorDashboardModule({
  firstName,
  lastName,
  tutorId,
  courses,
  onStudentAdded,
}: TutorDashboardModuleProps) {
  return (
    <main className="p-6 space-y-8">
      <TutorDashboardHeader firstName={firstName} lastName={lastName} />
      <CoursesSection courses={courses} tutorId={tutorId} />
      <StudentManager tutorId={tutorId} onStudentAdded={onStudentAdded} />
    </main>
  );
}
