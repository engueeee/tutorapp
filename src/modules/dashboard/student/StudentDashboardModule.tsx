import { StudentDashboardHeader } from "./StudentDashboardHeader";
import { UpcomingLessons } from "./UpcomingLessons";
import { HomeworkSection } from "./HomeworkSection";
import { CoursesSection } from "./CoursesSection";
import { TutorInfoCard } from "./TutorInfoCard";
import { Lesson, Homework } from "../types";
import { Calendar } from "lucide-react";
import Link from "next/link";

interface StudentDashboardModuleProps {
  userName: string;
  studentId: string;
  lessons: Lesson[];
  homework: Homework[];
}

export function StudentDashboardModule({
  userName,
  studentId,
  lessons,
  homework,
}: StudentDashboardModuleProps) {
  return (
    <main className="p-6 space-y-8">
      <StudentDashboardHeader userName={userName} />

      {/* Tutor Information Card */}
      <TutorInfoCard studentId={studentId} />

      {/* Courses Section */}
      <CoursesSection studentId={studentId} />

      {/* Calendar Quick Access */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Calendrier</h2>
          <Link
            href="/dashboard/student/calendar"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              Voir le calendrier complet
            </span>
          </Link>
        </div>
        <p className="text-gray-600 text-sm">
          Gérez vos leçons et événements personnels dans un calendrier
          interactif.
        </p>
      </div>

      {/* Other sections */}
      <UpcomingLessons lessons={lessons} />
      <HomeworkSection homework={homework} />
    </main>
  );
}
