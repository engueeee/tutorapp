import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
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
  student: Student;
  lessonStudents?: {
    student: Student;
  }[];
}

interface EditLessonModalProps {
  open: boolean;
  lesson: Lesson | null;
  tutorId: string;
  courseId: string;
  onClose: () => void;
  onSave: (updated: Partial<Lesson>) => void;
}

export function EditLessonModal({
  open,
  lesson,
  tutorId,
  courseId,
  onClose,
  onSave,
}: EditLessonModalProps) {
  const [form, setForm] = useState<Partial<Lesson>>(lesson || {});
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Update form state when lesson changes
  React.useEffect(() => {
    setForm(lesson || {});
    if (lesson?.lessonStudents && lesson.lessonStudents.length > 0) {
      // Use multiple students from lessonStudents
      setSelectedStudentIds(lesson.lessonStudents.map((ls) => ls.student.id));
    } else if (lesson?.student) {
      // Fallback to single student for backward compatibility
      setSelectedStudentIds([lesson.student.id]);
    } else {
      setSelectedStudentIds([]);
    }
  }, [lesson]);

  // Fetch all students for the tutor
  useEffect(() => {
    if (open && tutorId) {
      setLoadingStudents(true);
      fetch(`/api/students?tutorId=${tutorId}`)
        .then((res) => res.json())
        .then((data) => {
          setStudents(data || []);
        })
        .catch((error) => {
          // Handle error silently or show toast
        })
        .finally(() => setLoadingStudents(false));
    }
  }, [open, tutorId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Include selected students in the form data
    const updatedForm = {
      ...form,
      studentIds: selectedStudentIds,
    };

    await onSave(updatedForm);
    setLoading(false);
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la leçon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            placeholder="Titre"
            required
          />
          <Textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="date"
              type="date"
              value={form.date || ""}
              onChange={handleChange}
              required
            />
            <Input
              name="startTime"
              type="time"
              value={form.startTime || ""}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            name="duration"
            value={form.duration || ""}
            onChange={handleChange}
            placeholder="Durée"
            required
          />
          <Input
            name="zoomLink"
            value={form.zoomLink || ""}
            onChange={handleChange}
            placeholder="Lien Zoom (optionnel)"
          />
          <Input
            name="subject"
            value={form.subject || ""}
            onChange={handleChange}
            placeholder="Sujet (optionnel)"
          />

          {/* Student selection */}
          <div className="space-y-2">
            <Label>Élèves pour cette leçon</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              {loadingStudents ? (
                <div className="text-center text-gray-500 py-4">
                  Chargement des élèves...
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-1">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                        selectedStudentIds.includes(student.id)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedStudentIds((ids) =>
                          ids.includes(student.id)
                            ? ids.filter((id) => id !== student.id)
                            : [...ids, student.id]
                        );
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.email && (
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        )}
                      </div>
                      {selectedStudentIds.includes(student.id) ? (
                        <Check className="h-4 w-4 text-blue-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Aucun élève disponible
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || selectedStudentIds.length === 0}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
