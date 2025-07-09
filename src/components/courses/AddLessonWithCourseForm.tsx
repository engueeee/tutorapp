import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
}

export function AddLessonWithCourseForm({
  tutorId,
  onLessonCreated,
  onCourseChanged,
}: AddLessonWithCourseFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | "new">("");
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
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [showAddStudent, setShowAddStudent] = useState(false);

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

  // Fetch students for the selected course or all for tutor
  useEffect(() => {
    async function fetchStudentsForCourse(courseId: string) {
      const res = await fetch(
        `/api/courses?courseId=${courseId}&includeStudents=true`
      );
      if (res.ok) {
        const data = await res.json();
        // data[0] if findMany, or just data if findUnique
        const course = Array.isArray(data) ? data[0] : data;
        setStudents(course?.students || []);
      }
    }
    async function fetchAllStudents() {
      const res = await fetch(`/api/students?tutorId=${tutorId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    }
    if (selectedCourseId && selectedCourseId !== "new") {
      fetchStudentsForCourse(selectedCourseId);
    } else if (selectedCourseId === "new") {
      fetchAllStudents();
    } else {
      setStudents([]);
    }
    setSelectedStudentId("");
  }, [selectedCourseId, tutorId]);

  // Refresh students after adding
  const handleStudentAdded = () => {
    if (selectedCourseId === "new") {
      // fetch all students for tutor
      fetch(`/api/students?tutorId=${tutorId}`)
        .then((res) => res.json())
        .then((data) => setStudents(data));
    } else if (selectedCourseId) {
      // fetch students for course
      fetch(`/api/courses?courseId=${selectedCourseId}&includeStudents=true`)
        .then((res) => res.json())
        .then((data) => {
          const course = Array.isArray(data) ? data[0] : data;
          setStudents(course?.students || []);
        });
    }
    setShowAddStudent(false);
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(value);
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
    let courseId = selectedCourseId;
    try {
      // If creating a new course, create it first
      if (selectedCourseId === "new") {
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
                : selectedStudentId
                ? [selectedStudentId]
                : [],
          }),
        });
        if (!res.ok) throw new Error("Erreur lors de la création du cours");
        const createdCourse = await res.json();
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
          studentId: selectedStudentId,
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
      setSelectedCourseId("");
      setSelectedStudentId("");
      if (onLessonCreated) onLessonCreated();
    } catch (err) {
      toast.error("Erreur", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ajouter une leçon</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={selectedCourseId} onValueChange={handleCourseChange}>
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
          {selectedCourseId === "new" && (
            <div className="space-y-2">
              <Input
                placeholder="Titre du cours"
                name="title"
                value={newCourse.title}
                onChange={handleNewCourseChange}
                required
              />
              <Textarea
                placeholder="Description du cours (optionnel)"
                name="description"
                value={newCourse.description}
                onChange={handleNewCourseChange}
              />
            </div>
          )}
          {/* Student selection */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
              disabled={students.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un élève" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddStudent(true)}
            >
              + Nouvel élève
            </Button>
          </div>
          <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un élève</DialogTitle>
              </DialogHeader>
              <AddStudentForm
                tutorId={tutorId}
                onStudentAdded={handleStudentAdded}
              />
            </DialogContent>
          </Dialog>
          <Input
            placeholder="Titre de la leçon"
            name="title"
            value={lesson.title}
            onChange={handleLessonChange}
            required
          />
          <Textarea
            placeholder="Description de la leçon (optionnel)"
            name="description"
            value={lesson.description}
            onChange={handleLessonChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              name="date"
              value={lesson.date}
              onChange={handleLessonChange}
              required
            />
            <Input
              type="time"
              name="startTime"
              value={lesson.startTime}
              onChange={handleLessonChange}
              required
            />
          </div>
          <Input
            placeholder="Durée (ex: 1h)"
            name="duration"
            value={lesson.duration}
            onChange={handleLessonChange}
            required
          />
          <Input
            placeholder="Lien Zoom (optionnel)"
            name="zoomLink"
            value={lesson.zoomLink}
            onChange={handleLessonChange}
          />
          <Input
            placeholder="Sujet de la leçon (optionnel)"
            name="subject"
            value={lesson.subject}
            onChange={handleLessonChange}
          />
          <div className="flex items-center">
            <Button
              type="submit"
              disabled={
                loading ||
                (!selectedCourseId && selectedCourseId !== "new") ||
                !lesson.title ||
                !lesson.date ||
                !lesson.startTime ||
                !lesson.duration ||
                !selectedStudentId
              }
              className="w-50"
            >
              {loading ? "Création en cours..." : "Créer la leçon"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
