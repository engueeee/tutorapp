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
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { AddLessonWithCourseForm } from "@/components/courses/AddLessonWithCourseForm";
import { EditCourseForm } from "@/components/courses/EditCourseForm";
import { Course } from "../types";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] =
    useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);

  // Map unified Course type to display shape for tutor dashboard
  const displayCourses = courses.map((course) => {
    // Get all unique students from lessons (including multiple students per lesson)
    const allLessonStudentIds = new Set<string>();

    (course.lessons || []).forEach((lesson) => {
      // Add single student (for backward compatibility)
      if (lesson.student?.id) {
        allLessonStudentIds.add(lesson.student.id);
      }
      // Add multiple students from lessonStudents
      if (lesson.lessonStudents) {
        lesson.lessonStudents.forEach((ls) => {
          if (ls.student?.id) {
            allLessonStudentIds.add(ls.student.id);
          }
        });
      }
    });

    const lessonStudentIds = Array.from(allLessonStudentIds);
    const lessonStudents = (course.students || []).filter((s) =>
      lessonStudentIds.includes(s.id)
    );

    return {
      ...course,
      studentsCount: lessonStudents.length,
      lessonStudents,
      lessonsCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
      status: "Active",
    };
  });

  const handleViewLessons = async (course: Course) => {
    // Fetch fresh course data to ensure we have the latest lessons
    try {
      const res = await fetch(
        `/api/courses?tutorId=${tutorId}&includeStudents=true&includeLessons=true`
      );
      if (res.ok) {
        const coursesData = await res.json();
        const updatedCourse = coursesData.find(
          (c: Course) => c.id === course.id
        );
        if (updatedCourse) {
          setSelectedCourse(updatedCourse);
        } else {
          setSelectedCourse(course);
        }
      } else {
        setSelectedCourse(course);
      }
    } catch (error) {
      console.error("Error fetching updated course data:", error);
      setSelectedCourse(course);
    }
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

  // Handler for when a lesson is created or modified
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

  // Handler for when lessons are modified (created, updated, or deleted)
  const handleLessonModified = () => {
    if (onLessonCreated) {
      onLessonCreated();
    }
  };

  // Handler for editing a course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsEditCourseOpen(true);
  };

  // Handler for deleting a course
  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setIsDeleteCourseOpen(true);
  };

  // Handler for confirming course deletion
  const handleConfirmDeleteCourse = async () => {
    if (!deletingCourse) return;

    try {
      const res = await fetch(
        `/api/courses?courseId=${deletingCourse.id}&tutorId=${tutorId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setIsDeleteCourseOpen(false);
        setDeletingCourse(null);
        if (onCourseChanged) onCourseChanged();
      } else {
        console.error("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // Handler for saving course edits
  const handleSaveCourseEdit = async (updatedCourse: Partial<Course>) => {
    if (!editingCourse) return;

    try {
      const res = await fetch(`/api/courses?courseId=${editingCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedCourse,
          courseId: editingCourse.id,
          tutorId: tutorId,
        }),
      });

      if (res.ok) {
        setIsEditCourseOpen(false);
        setEditingCourse(null);
        if (onCourseChanged) onCourseChanged();
      } else {
        console.error("Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Current Courses</h2>
      {/* Remove AddLessonWithCourseForm from here, now only show the course list */}
      <Card>
        <CardContent className="overflow-x-auto p-2 sm:p-4">
          <table className="min-w-[700px] w-full text-sm">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.studentsCount}</span>
                      {course.lessonStudents &&
                        course.lessonStudents.length > 0 && (
                          <div className="text-xs text-gray-500">
                            (
                            {course.lessonStudents.slice(0, 3).map((s, i) => (
                              <span key={s.id} className="mr-1">
                                {s.firstName} {s.lastName.charAt(0)}.
                                {i <
                                Math.min(2, course.lessonStudents.length - 1)
                                  ? ","
                                  : ""}
                              </span>
                            ))}
                            {course.lessonStudents.length > 3 && (
                              <span>...</span>
                            )}
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* View Lessons Button (keep as is) */}
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
                            className="flex items-center gap-1"
                            aria-label="Voir les leçons"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 justify-between">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Lessons - {selectedCourse?.title}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewLessons(selectedCourse!)
                                }
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                              </Button>
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
                                          Students:
                                        </span>
                                        <span>
                                          {(lesson.lessonStudents &&
                                          lesson.lessonStudents.length > 0
                                            ? lesson.lessonStudents.map(
                                                (ls) => ls.student
                                              )
                                            : lesson.student
                                            ? [lesson.student]
                                            : []
                                          ).map((student, index, array) => (
                                            <span key={student.id}>
                                              {student.firstName}{" "}
                                              {student.lastName}
                                              {index < array.length - 1
                                                ? ", "
                                                : ""}
                                            </span>
                                          ))}
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

                      {/* Actions Dropdown: Add, Edit, Delete */}
                      <Select
                        onValueChange={(value) => {
                          if (value === "add")
                            setSelectedCourseForLesson(course),
                              setIsAddLessonOpen(true);
                          if (value === "edit") handleEditCourse(course);
                          if (value === "delete") handleDeleteCourse(course);
                        }}
                      >
                        <SelectTrigger
                          className="w-8 h-8 p-0 border-none bg-transparent hover:bg-accent"
                          aria-label="Actions"
                        >
                          <Plus className="h-5 w-5" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">
                            <Plus className="h-4 w-4 mr-2" /> Ajouter une leçon
                          </SelectItem>
                          <SelectItem value="edit">
                            <Edit className="h-4 w-4 mr-2" /> Modifier le cours
                          </SelectItem>
                          <SelectItem value="delete">
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" />{" "}
                            Supprimer le cours
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Course
            </DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <EditCourseForm
              course={editingCourse}
              onSave={handleSaveCourseEdit}
              onCancel={() => {
                setIsEditCourseOpen(false);
                setEditingCourse(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteCourseOpen} onOpenChange={setIsDeleteCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Course
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the course "
              {deletingCourse?.title}"?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. All lessons associated with this
              course will also be deleted.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteCourseOpen(false);
                setDeletingCourse(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCourse}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
