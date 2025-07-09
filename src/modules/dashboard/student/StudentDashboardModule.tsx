import { StudentDashboardHeader } from "./StudentDashboardHeader";
import { UpcomingLessons } from "./UpcomingLessons";
import { HomeworkSection } from "./HomeworkSection";
import { CoursesSection } from "./CoursesSection";
import { TutorInfoCard } from "./TutorInfoCard";
import { Lesson, Homework } from "../types";

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

      {/* Other sections */}
      <UpcomingLessons lessons={lessons} />
      <HomeworkSection homework={homework} />
    </main>
  );
}
