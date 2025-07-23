import { TutorDashboardHeader } from "./TutorDashboardHeader";
import { CoursesSection } from "./CoursesSection";
import { StudentManager } from "@/components/dashboard/StudentManager";
import { RevenueOverview } from "./RevenueOverview";
import { GroupedLessonsList } from "../lessons/GroupedLessonsList";
import { Course } from "../types";

interface TutorDashboardModuleProps {
  firstName: string;
  lastName: string;
  tutorId: string;
  courses: Course[];
  lessons?: any[];
  onStudentAdded?: () => void;
  onLessonsChanged?: () => void;
}

export function TutorDashboardModule({
  firstName,
  lastName,
  tutorId,
  courses,
  lessons = [],
  onStudentAdded,
  onLessonsChanged,
}: TutorDashboardModuleProps) {
  return (
    <main className="p-6 space-y-8">
      <TutorDashboardHeader firstName={firstName} lastName={lastName} />
      <RevenueOverview />
      <CoursesSection
        courses={courses}
        tutorId={tutorId}
        onCourseChanged={onStudentAdded}
        onLessonCreated={onLessonsChanged}
      />
      <StudentManager tutorId={tutorId} onStudentAdded={onStudentAdded} />
      <GroupedLessonsList
        lessons={lessons}
        tutorId={tutorId}
        onLessonsChanged={onLessonsChanged}
      />
    </main>
  );
}
