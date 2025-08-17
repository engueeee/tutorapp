"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { CourseCard } from "./CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, BookOpen } from "lucide-react";
import { Course } from "@/modules/dashboard/types";
import { AddCourseForm } from "./AddCourseForm";
import { QuickLessonCreationModal } from "./QuickLessonCreationModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CourseGridProps {
  tutorId: string;
  onCourseChanged?: () => void;
  onLessonCreated?: () => void;
}

export function CourseGrid({
  tutorId,
  onCourseChanged,
  onLessonCreated,
}: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickLessonModalOpen, setIsQuickLessonModalOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `/api/courses?tutorId=${tutorId}&includeStudents=true&includeLessons=true`
      );
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [tutorId]);

  const handleCourseAdded = () => {
    fetchCourses();
    setIsCreateModalOpen(false);
    if (onCourseChanged) {
      onCourseChanged();
    }
  };

  const handleLessonCreated = () => {
    fetchCourses();
    if (onLessonCreated) {
      onLessonCreated();
    }
  };

  const handleCourseDeleted = () => {
    fetchCourses();
    if (onCourseChanged) {
      onCourseChanged();
    }
  };

  if (loading) {
    return <LoadingUI variant="course-module" />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Cours</h2>
          <p className="text-gray-600 mt-1">Gérez vos cours et vos leçons</p>
        </div>
        <div className="flex gap-2">
          <QuickLessonCreationModal
            tutorId={tutorId}
            onLessonCreated={handleLessonCreated}
            open={isQuickLessonModalOpen}
            onOpenChange={setIsQuickLessonModalOpen}
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une leçon
              </Button>
            }
          />
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer un cours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Créer un nouveau cours
                </DialogTitle>
              </DialogHeader>
              <AddCourseForm
                tutorId={tutorId}
                onCourseAdded={handleCourseAdded}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="Aucun cours"
          description="Vous n'avez pas encore créé de cours. Commencez par en créer un !"
          action={
            <div className="flex gap-2">
              <QuickLessonCreationModal
                tutorId={tutorId}
                onLessonCreated={handleLessonCreated}
                open={isQuickLessonModalOpen}
                onOpenChange={setIsQuickLessonModalOpen}
                trigger={
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une leçon
                  </Button>
                }
              />
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier cours
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              tutorId={tutorId}
              onCourseChanged={handleCourseDeleted}
              onLessonCreated={handleLessonCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
