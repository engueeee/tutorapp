import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/modules/dashboard/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddStudentForm } from "@/components/forms/AddStudentForm";

interface AddLessonWithCourseFormProps {
  tutorId: string;
  onLessonCreated?: () => void;
  onCourseChanged?: () => void;
  selectedCourseId?: string; // Optional: pre-select a course
}

export function AddLessonWithCourseForm({
  tutorId,
  onLessonCreated,
  onCourseChanged,
  selectedCourseId,
}: AddLessonWithCourseFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSelectedCourseId, setCurrentSelectedCourseId] = useState<
    string | "new"
  >(selectedCourseId || "");
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
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
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

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

  // Set the selected course when selectedCourseId prop changes
  useEffect(() => {
    if (selectedCourseId) {
      setCurrentSelectedCourseId(selectedCourseId);
    }
  }, [selectedCourseId]);

  // Fetch all students for the tutor
  useEffect(() => {
    async function fetchAllStudents() {
      const res = await fetch(`/api/students?tutorId=${tutorId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    }
    if (currentSelectedCourseId) {
      fetchAllStudents();
    } else {
      setStudents([]);
    }
    setSelectedStudentIds([]);
  }, [currentSelectedCourseId, tutorId]);

  // Refresh students after adding
  const handleStudentAdded = async (newStudent?: any) => {
    if (!newStudent) return;
    setLoadingStudents(true);

    // Refresh the students list
    const res = await fetch(`/api/students?tutorId=${tutorId}`);
    const data = await res.json();
    setStudents(data);
    setSelectedStudentIds([newStudent.id]);

    setLoadingStudents(false);
    setShowAddStudent(false);
    toast.success(`Ajout effectué avec succès`, {
      description: `${newStudent.firstName} ${newStudent.lastName} est votre nouvel élève !`,
    });
  };

  const handleCourseChange = (value: string) => {
    setCurrentSelectedCourseId(value);
    if (value !== "new") {
      setNewCourse({ title: "", description: "" });
    }
  };

  const handleLessonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLesson({ ...lesson, [e.target.name]: e.target.value });
  };

  const handleNewCourseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let courseId = currentSelectedCourseId;
    try {
      // If creating a new course, create it first
      if (currentSelectedCourseId === "new") {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newCourse.title,
            description: newCourse.description,
            tutorId,
            studentIds:
              students.length > 0
                ? students.map((s) => s.id)
                : selectedStudentIds.length > 0
                ? selectedStudentIds
                : [],
          }),
        });
        if (!res.ok) throw new Error("Erreur lors de la création du cours");
        const createdCourse = await res.json();
        if (!createdCourse || !createdCourse.id) {
          toast.error("Erreur", {
            description:
              "Le cours créé n'a pas d'identifiant valide. Impossible de créer la leçon.",
          });
          setLoading(false);
          return;
        }
        courseId = createdCourse.id;
        if (onCourseChanged) onCourseChanged();
      }
      // Create the lesson
      const resLesson = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lesson,
          tutorId,
          courseId,
          studentIds: selectedStudentIds,
          studentId: selectedStudentIds[0], // Always send studentId for backend compatibility
        }),
      });
      if (!resLesson.ok)
        throw new Error("Erreur lors de la création de la leçon");
      toast.success("Leçon créée");
      setLesson({
        title: "",
        description: "",
        date: "",
        startTime: "",
        duration: "",
        zoomLink: "",
        subject: "",
      });
      setCurrentSelectedCourseId("");
      setSelectedStudentIds([]);
      if (onLessonCreated) onLessonCreated();
    } catch (err) {
      toast.error("Erreur", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 max-w-md w-full mx-auto p-2 sm:p-4">
      <CardHeader>
        <CardTitle>Ajouter une leçon</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={currentSelectedCourseId}
            onValueChange={handleCourseChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un cours ou en créer un nouveau" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
              <SelectItem value="new">+ Nouveau cours</SelectItem>
            </SelectContent>
          </Select>
          {currentSelectedCourseId === "new" && (
            <div className="space-y-2">
              <Input
                placeholder="Titre du cours"
                name="title"
                value={newCourse.title}
                onChange={handleNewCourseChange}
                required
                className="w-full"
              />
              <Textarea
                placeholder="Description du cours (optionnel)"
                name="description"
                value={newCourse.description}
                onChange={handleNewCourseChange}
                className="w-full"
              />
            </div>
          )}
          {/* Student selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Élèves pour cette leçon</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddStudent(true)}
                className="min-h-[36px]"
              >
                + Nouvel élève
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              {students.length > 0 ? (
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
          <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un élève</DialogTitle>
              </DialogHeader>
              <AddStudentForm
                tutorId={tutorId}
                onStudentAdded={(student: any) => handleStudentAdded(student)}
                suppressToast={true}
              />
            </DialogContent>
          </Dialog>
          <Input
            placeholder="Titre de la leçon"
            name="title"
            value={lesson.title}
            onChange={handleLessonChange}
            required
            className="w-full"
          />
          <Textarea
            placeholder="Description de la leçon (optionnel)"
            name="description"
            value={lesson.description}
            onChange={handleLessonChange}
            className="w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              name="date"
              value={lesson.date}
              onChange={handleLessonChange}
              required
              className="w-full"
            />
            <Input
              type="time"
              name="startTime"
              value={lesson.startTime}
              onChange={handleLessonChange}
              required
              className="w-full"
            />
          </div>
          <Input
            placeholder="Durée (ex: 1h)"
            name="duration"
            value={lesson.duration}
            onChange={handleLessonChange}
            required
            className="w-full"
          />
          <Input
            placeholder="Lien Zoom (optionnel)"
            name="zoomLink"
            value={lesson.zoomLink}
            onChange={handleLessonChange}
            className="w-full"
          />
          <Input
            placeholder="Sujet de la leçon (optionnel)"
            name="subject"
            value={lesson.subject}
            onChange={handleLessonChange}
            className="w-full"
          />
          <div className="flex items-center">
            <Button
              type="submit"
              disabled={
                loading ||
                !currentSelectedCourseId ||
                !lesson.title ||
                !lesson.date ||
                !lesson.startTime ||
                !lesson.duration ||
                selectedStudentIds.length === 0
              }
              className="w-full min-h-[44px] text-base"
            >
              {loading ? "Création en cours..." : "Créer la leçon"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
