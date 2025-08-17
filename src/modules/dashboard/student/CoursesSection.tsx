import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Calendar, Clock, Video } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface CoursesSectionProps {
  studentId: string;
}

interface CourseWithTutor {
  id: string;
  title: string;
  description?: string | null;
  zoomLink?: string | null;
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
        setError(null);

        if (!studentId || studentId.trim() === "") {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/courses?studentId=${encodeURIComponent(
            studentId
          )}&includeLessons=true`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to fetch courses: ${errorData.error || response.statusText}`
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          setError("Invalid data format received from server");
        }
      } catch (err) {
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
          <LoadingSkeleton />
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
                {course.zoomLink && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Video className="h-4 w-4 text-blue-600" />
                    <a
                      href={course.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Lien Zoom
                    </a>
                  </div>
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
