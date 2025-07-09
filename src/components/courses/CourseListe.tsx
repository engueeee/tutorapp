// Fichier : /src/components/courses/CourseList.tsx

"use client";

import { useEffect, useState } from "react";
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
import { AddStudentToCourseForm } from "./AddStudentToCourseForm";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Course {
  id: string;
  title: string;
  description?: string;
  students: Student[];
  lessons: Lesson[];
  createdAt: string;
  status: "Active" | "Pending";
}

interface CourseListProps {
  tutorId: string;
}

export function CourseList({ tutorId }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLessonViewOpen, setIsLessonViewOpen] = useState(false);

  const refreshCourses = async () => {
    try {
      const res = await fetch(
        `/api/courses?tutorId=${tutorId}&includeLessons=true`
      );
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch(
          `/api/courses?tutorId=${tutorId}&includeLessons=true`
        );
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
    fetchCourses();
  }, [tutorId]);

  const handleViewLessons = (course: Course) => {
    setSelectedCourse(course);
    setIsLessonViewOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Cours actuels</h2>
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cours</th>
                <th className="text-left py-2">Élèves</th>
                <th className="text-left py-2">Leçons</th>
                <th className="text-left py-2">Statut</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b">
                  <td className="py-2 font-medium">{course.title}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.students?.length || 0}</span>
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
                      <span>{course.lessons?.length || 0}</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        course.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="py-2">
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
                          Voir les leçons
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Leçons - {selectedCourse?.title}
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
                                      <span className="font-medium">Date:</span>
                                      <span>{formatDate(lesson.date)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">
                                        Heure:
                                      </span>
                                      <span>
                                        {formatTime(lesson.startTime)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">
                                        Durée:
                                      </span>
                                      <span>{lesson.duration}</span>
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-3 border-t">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">
                                        Élève:
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
                                        Lien Zoom
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
                                Aucune leçon
                              </h3>
                              <p className="text-gray-600">
                                Aucune leçon n'a été créée pour ce cours.
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AddStudentToCourseForm
                      course={course}
                      tutorId={tutorId}
                      onStudentAdded={refreshCourses}
                    />
                    <Button variant="secondary" size="sm" className="ml-2">
                      Modifier
                    </Button>
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
