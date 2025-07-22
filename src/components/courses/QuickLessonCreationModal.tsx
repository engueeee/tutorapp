import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Course } from "@/modules/dashboard/types";

interface QuickLessonCreationModalProps {
  tutorId: string;
  onLessonCreated?: () => void;
  selectedCourseId?: string; // Pre-fill course if provided
  trigger?: React.ReactNode; // Custom trigger element
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickLessonCreationModal({
  tutorId,
  onLessonCreated,
  selectedCourseId,
  trigger,
  open,
  onOpenChange,
}: QuickLessonCreationModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSelectedCourseId, setCurrentSelectedCourseId] =
    useState<string>(selectedCourseId || "");
  const [lesson, setLesson] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    duration: "",
    zoomLink: "",
    subject: "",
  });
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Set the selected course when selectedCourseId prop changes
  useEffect(() => {
    if (selectedCourseId) {
      setCurrentSelectedCourseId(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch(`/api/courses?tutorId=${tutorId}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    }
    if (tutorId) fetchCourses();
  }, [tutorId]);

  // Fetch students for selected course
  useEffect(() => {
    async function fetchStudents() {
      if (!currentSelectedCourseId) {
        setStudents([]);
        return;
      }

      setLoadingStudents(true);
      try {
        const res = await fetch(`/api/students?tutorId=${tutorId}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchStudents();
    setSelectedStudentIds([]);
  }, [currentSelectedCourseId, tutorId]);

  const handleCourseChange = (value: string) => {
    setCurrentSelectedCourseId(value);
  };

  const handleLessonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLesson((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSelectedCourseId) {
      toast.error("Veuillez sélectionner un cours");
      return;
    }

    if (!lesson.title.trim()) {
      toast.error("Veuillez saisir un titre pour la leçon");
      return;
    }

    if (!lesson.date) {
      toast.error("Veuillez sélectionner une date");
      return;
    }

    if (!lesson.startTime) {
      toast.error("Veuillez sélectionner une heure de début");
      return;
    }

    if (!lesson.duration) {
      toast.error("Veuillez saisir la durée de la leçon");
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un étudiant");
      return;
    }

    setLoading(true);

    try {
      // Create the lesson
      const lessonData = {
        title: lesson.title,
        description: lesson.description,
        date: lesson.date,
        startTime: lesson.startTime,
        duration: lesson.duration,
        zoomLink: lesson.zoomLink,
        subject: lesson.subject,
        courseId: currentSelectedCourseId,
        studentId: selectedStudentIds[0], // Main student
        additionalStudentIds: selectedStudentIds.slice(1), // Additional students
      };

      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      toast.success("Leçon créée avec succès !");

      // Reset form
      setLesson({
        title: "",
        description: "",
        date: "",
        startTime: "",
        duration: "",
        zoomLink: "",
        subject: "",
      });
      setSelectedStudentIds([]);

      // Close modal
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Notify parent
      if (onLessonCreated) {
        onLessonCreated();
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Erreur lors de la création de la leçon");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLesson({
      title: "",
      description: "",
      date: "",
      startTime: "",
      duration: "",
      zoomLink: "",
      subject: "",
    });
    setSelectedStudentIds([]);
    if (!selectedCourseId) {
      setCurrentSelectedCourseId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-[#050f8b] hover:bg-[#050f8b]/90">
            <Plus className="h-4 w-4 mr-2" />
            Créer une leçon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#050f8b]">
            Créer une nouvelle leçon
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course" className="text-sm font-medium">
              Cours *
            </Label>
            <Select
              value={currentSelectedCourseId}
              onValueChange={handleCourseChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un cours" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre de la leçon *
            </Label>
            <Input
              id="title"
              name="title"
              value={lesson.title}
              onChange={handleLessonChange}
              placeholder="Ex: Introduction aux équations"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date *
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={lesson.date}
                onChange={handleLessonChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">
                Heure de début *
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={lesson.startTime}
                onChange={handleLessonChange}
                required
              />
            </div>
          </div>

          {/* Duration and Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                Durée *
              </Label>
              <Input
                id="duration"
                name="duration"
                value={lesson.duration}
                onChange={handleLessonChange}
                placeholder="Ex: 1h30, 2h"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Matière
              </Label>
              <Input
                id="subject"
                name="subject"
                value={lesson.subject}
                onChange={handleLessonChange}
                placeholder="Ex: Mathématiques"
              />
            </div>
          </div>

          {/* Zoom Link */}
          <div className="space-y-2">
            <Label htmlFor="zoomLink" className="text-sm font-medium">
              Lien Zoom
            </Label>
            <Input
              id="zoomLink"
              name="zoomLink"
              value={lesson.zoomLink}
              onChange={handleLessonChange}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={lesson.description}
              onChange={handleLessonChange}
              placeholder="Description de la leçon..."
              rows={3}
            />
          </div>

          {/* Students Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Étudiants * ({selectedStudentIds.length} sélectionné(s))
            </Label>
            {loadingStudents ? (
              <div className="text-sm text-gray-500">
                Chargement des étudiants...
              </div>
            ) : students.length === 0 ? (
              <div className="text-sm text-gray-500">
                Aucun étudiant disponible pour ce cours
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => handleStudentToggle(student.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedStudentIds.includes(student.id)
                          ? "bg-[#050f8b] border-[#050f8b]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedStudentIds.includes(student.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span className="text-sm">
                      {student.firstName} {student.lastName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              Réinitialiser
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#050f8b] hover:bg-[#050f8b]/90"
            >
              {loading ? "Création..." : "Créer la leçon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
