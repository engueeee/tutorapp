"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/modules/dashboard/types";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { CourseDetailHeader } from "@/components/courses/CourseDetailHeader";
import { CourseLessonsList } from "@/components/courses/CourseLessonsList";
import { CourseStudentsSection } from "@/components/courses/CourseStudentsSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { QuickLessonCreationModal } from "@/components/courses/QuickLessonCreationModal";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuickLessonModalOpen, setIsQuickLessonModalOpen] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/courses?courseId=${courseId}&includeStudents=true&includeLessons=true`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch course");
        }

        const courses = await res.json();
        if (courses.length === 0) {
          setError("Course not found");
          return;
        }

        setCourse(courses[0]);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  const handleLessonCreated = () => {
    // Refresh course data after lesson creation
    if (courseId) {
      const fetchCourse = async () => {
        try {
          const res = await fetch(
            `/api/courses?courseId=${courseId}&includeStudents=true&includeLessons=true`
          );
          if (res.ok) {
            const courses = await res.json();
            if (courses.length > 0) {
              setCourse(courses[0]);
            }
          }
        } catch (error) {
          console.error("Error refreshing course:", error);
        }
      };
      fetchCourse();
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <RoleGuard allowedRoles={["tutor"]}>
        <div className="p-6">
          <LoadingUI variant="course-module" />
        </div>
      </RoleGuard>
    );
  }

  if (error || !course) {
    return (
      <RoleGuard allowedRoles={["tutor"]}>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "Course not found"}
            </h2>
            <Button onClick={() => router.push("/dashboard/tutor/courses")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/tutor/courses")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <CourseDetailHeader course={course} />

        {/* Quick Actions */}
        <div className="flex justify-end">
          <QuickLessonCreationModal
            tutorId={user.id}
            courseId={course.id}
            onLessonCreated={handleLessonCreated}
            open={isQuickLessonModalOpen}
            onOpenChange={setIsQuickLessonModalOpen}
            trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            }
          />
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons Section - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <CourseLessonsList
              lessons={course.lessons || []}
              courseId={course.id}
              onLessonUpdated={handleLessonCreated}
            />
          </div>

          {/* Students Section - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <CourseStudentsSection students={course.students || []} />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
