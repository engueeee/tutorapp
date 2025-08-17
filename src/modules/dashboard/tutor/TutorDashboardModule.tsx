import { useMemo } from "react";
import { TutorDashboardHeader } from "./TutorDashboardHeader";
import { CourseModule } from "./CourseModule";
import { StudentManager } from "@/components/dashboard/StudentManager";
import { RevenueOverview } from "./RevenueOverview";
import { GroupedLessonsList } from "../lessons/GroupedLessonsList";
import { Course, Lesson } from "../types";

interface TutorDashboardModuleProps {
  firstName: string;
  lastName: string;
  tutorId: string;
  courses: Course[];
  lessons?: Lesson[];
  onStudentAdded?: () => void;
  onLessonsChanged?: () => void;
  onLessonDeleted?: (lessonId: string) => void;
  onLessonUpdated?: (updatedLesson: Lesson) => void;
  onLessonCreated?: (newLesson: Lesson) => void;
}

export function TutorDashboardModule({
  firstName,
  lastName,
  tutorId,
  courses,
  lessons = [],
  onStudentAdded,
  onLessonsChanged,
  onLessonDeleted,
  onLessonUpdated,
  onLessonCreated,
}: TutorDashboardModuleProps) {
  // Memoize safe lessons array to prevent unnecessary re-renders
  const safeLessons = useMemo(() => lessons || [], [lessons]);

  // Memoize safe courses array to prevent unnecessary re-renders
  const safeCourses = useMemo(() => courses || [], [courses]);

  // Memoize user display name to prevent unnecessary re-renders
  const userDisplayName = useMemo(
    () => ({
      firstName: firstName || "",
      lastName: lastName || "",
    }),
    [firstName, lastName]
  );

  return (
    <div className="space-y-6">
      <TutorDashboardHeader
        firstName={userDisplayName.firstName}
        lastName={userDisplayName.lastName}
      />
      <RevenueOverview />
      <CourseModule tutorId={tutorId} onCourseChanged={onStudentAdded} />
      <StudentManager tutorId={tutorId} onStudentAdded={onStudentAdded} />
      <GroupedLessonsList
        lessons={safeLessons}
        tutorId={tutorId}
        onLessonsChanged={onLessonsChanged}
        onLessonDeleted={onLessonDeleted}
        onLessonUpdated={onLessonUpdated}
        onLessonCreated={onLessonCreated}
      />
    </div>
  );
}
