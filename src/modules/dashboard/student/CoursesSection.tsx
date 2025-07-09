import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Calendar, Clock } from "lucide-react";

interface CoursesSectionProps {
  studentId: string;
}

interface CourseWithTutor {
  id: string;
  title: string;
  description?: string | null;
  tutorId: string;
  createdAt: string;
  tutor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lessons: Array<{
    id: string;
    date: string;
    startTime: string;
    title: string;
    duration: string;
    createdAt: string;
    tutorId: string;
    courseId: string;
    studentId: string;
  }>;
}

export function CoursesSection({ studentId }: CoursesSectionProps) {
  const [courses, setCourses] = useState<CourseWithTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log(
          "CoursesSection: Fetching courses for studentId:",
          studentId
        );
        console.log(
          "CoursesSection: studentId value:",
          JSON.stringify(studentId)
        );

        if (!studentId || studentId.trim() === "") {
          console.log("CoursesSection: studentId is invalid, skipping fetch");
          setLoading(false);
          return;
        }

        // First, let's verify the student exists
        const studentResponse = await fetch(
          `/api/students?userId=${studentId}`
        );
        console.log(
          "CoursesSection: Student check response:",
          studentResponse.status
        );

        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          console.log("CoursesSection: Student data:", studentData);
        }

        const response = await fetch(
          `/api/courses?studentId=${encodeURIComponent(
            studentId
          )}&includeLessons=true`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("CoursesSection: API error:", errorData);
          throw new Error(
            `Failed to fetch courses: ${errorData.error || response.statusText}`
          );
        }

        const data = await response.json();
        console.log("CoursesSection: Courses data:", data);
        console.log("CoursesSection: Courses data type:", typeof data);
        console.log(
          "CoursesSection: Courses data length:",
          Array.isArray(data) ? data.length : "Not an array"
        );

        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("CoursesSection: API returned non-array:", data);
          setError("Invalid data format received from server");
        }
      } catch (err) {
        console.error("CoursesSection: Error fetching courses:", err);
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (studentId && studentId.trim() !== "") {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  const getNextLesson = (lessons: CourseWithTutor["lessons"]) => {
    if (!lessons || lessons.length === 0) return null;

    const now = new Date();
    const upcomingLessons = lessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.date);
        return lessonDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcomingLessons[0] || null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mes Cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              Chargement des cours...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mes Cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mes Cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours assigné
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas encore de cours assignés par vos tuteurs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Mes Cours ({courses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const nextLesson = getNextLesson(course.lessons);
            const lessonCount = course.lessons?.length || 0;

            return (
              <div
                key={course.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {lessonCount} leçon{lessonCount !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {course.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span>
                      {course.tutor.firstName} {course.tutor.lastName}
                    </span>
                  </div>

                  {nextLesson && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Prochaine leçon: {formatDate(nextLesson.date)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Créé le {formatDate(course.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
