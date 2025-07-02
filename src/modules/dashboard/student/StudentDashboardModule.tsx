import { StudentDashboardHeader } from "./StudentDashboardHeader";
import { UpcomingLessons } from "./UpcomingLessons";
import { HomeworkSection } from "./HomeworkSection";
import { Lesson, Homework } from "../types";

interface StudentDashboardModuleProps {
  userName: string;
  lessons: Lesson[];
  homework: Homework[];
}

export function StudentDashboardModule({
  userName,
  lessons,
  homework,
}: StudentDashboardModuleProps) {
  return (
    <main className="p-6 space-y-8">
      <StudentDashboardHeader userName={userName} />
      <UpcomingLessons lessons={lessons} />
      <HomeworkSection homework={homework} />
    </main>
  );
}
