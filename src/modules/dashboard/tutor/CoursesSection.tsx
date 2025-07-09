import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Users } from "lucide-react";
import { AddLessonWithCourseForm } from "@/components/courses/AddLessonWithCourseForm";
import { AddStudentToCourseForm } from "@/components/courses/AddStudentToCourseForm";
import { Course } from "../types";

interface CoursesSectionProps {
  courses: Course[];
  tutorId: string;
  onCourseChanged?: () => void;
  onLessonCreated?: () => void;
}

export function CoursesSection({
  courses,
  tutorId,
  onCourseChanged,
  onLessonCreated,
}: CoursesSectionProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLessonViewOpen, setIsLessonViewOpen] = useState(false);

  // Map unified Course type to display shape for tutor dashboard
  const displayCourses = courses.map((course) => ({
    ...course,
    studentsCount: Array.isArray(course.students) ? course.students.length : 0,
    lessonsCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
    status: "Active", // You can add logic to determine status if needed
  }));

  const handleViewLessons = (course: Course) => {
    setSelectedCourse(course);
    setIsLessonViewOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Handler for when a lesson is created
  const handleLessonCreated = () => {
    if (onLessonCreated) {
      onLessonCreated();
    }
  };

  // Handler for when a student is added to a course
  const handleStudentAdded = () => {
    if (onCourseChanged) {
      onCourseChanged();
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Current Courses</h2>
      <AddLessonWithCourseForm
        tutorId={tutorId}
        onCourseChanged={onCourseChanged}
        onLessonCreated={handleLessonCreated}
      />
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Course</th>
                <th className="text-left py-2">Students</th>
                <th className="text-left py-2">Lessons</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayCourses.map((course) => (
                <tr key={course.title} className="border-b">
                  <td className="py-2 font-medium">{course.title}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.studentsCount}</span>
                      {course.students && course.students.length > 0 && (
                        <div className="text-xs text-gray-500">
                          (
                          {course.students
                            .map((s) => `${s.firstName} ${s.lastName}`)
                            .join(", ")}
                          )
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{course.lessonsCount}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        course.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : course.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <AddStudentToCourseForm
                        course={course}
                        tutorId={tutorId}
                        onStudentAdded={handleStudentAdded}
                      />
                      <Dialog
                        open={
                          isLessonViewOpen && selectedCourse?.id === course.id
                        }
                        onOpenChange={setIsLessonViewOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleViewLessons(course)}
                          >
                            View Lessons
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Lessons - {selectedCourse?.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {selectedCourse?.lessons &&
                            selectedCourse.lessons.length > 0 ? (
                              <div className="grid gap-4">
                                {selectedCourse.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <h3 className="font-semibold text-lg text-gray-900">
                                        {lesson.title}
                                      </h3>
                                      {lesson.subject && (
                                        <Badge variant="secondary">
                                          {lesson.subject}
                                        </Badge>
                                      )}
                                    </div>

                                    {lesson.description && (
                                      <p className="text-gray-600 text-sm mb-3">
                                        {lesson.description}
                                      </p>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                          Date:
                                        </span>
                                        <span>{formatDate(lesson.date)}</span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                          Time:
                                        </span>
                                        <span>
                                          {formatTime(lesson.startTime)}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                          Duration:
                                        </span>
                                        <span>{lesson.duration}</span>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                          Student:
                                        </span>
                                        <span>
                                          {lesson.student.firstName}{" "}
                                          {lesson.student.lastName}
                                        </span>
                                      </div>
                                    </div>

                                    {lesson.zoomLink && (
                                      <div className="mt-3 pt-3 border-t">
                                        <a
                                          href={lesson.zoomLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                                        >
                                          Zoom Link
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  No Lessons
                                </h3>
                                <p className="text-gray-600">
                                  No lessons have been created for this course.
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
