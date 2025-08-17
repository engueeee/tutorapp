// Fichier : /src/components/forms/AddCourseForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface AddCourseFormProps {
  tutorId: string;
  onCourseAdded?: () => void;
}

export function AddCourseForm({ tutorId, onCourseAdded }: AddCourseFormProps) {
  const { register, handleSubmit, reset, watch } = useForm();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      const res = await fetch(`/api/students?tutorId=${tutorId}`);
      const data = await res.json();
      setStudents(data);
    }
    fetchStudents();
  }, [tutorId]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const onSubmit = async (data: any) => {
    if (selectedStudentIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un étudiant");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || undefined,
          zoomLink: data.zoomLink || undefined,
          tutorId,
          studentIds: selectedStudentIds,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du cours");

      toast.success("Cours créé", {
        description: `Le cours ${data.title} a été créé avec ${selectedStudentIds.length} élève(s).`,
      });
      reset();
      setSelectedStudentIds([]);
      if (onCourseAdded) {
        onCourseAdded();
      }
    } catch (err) {
      toast.error("Erreur", { description: "Impossible de créer le cours" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Course Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Titre du cours *
        </Label>
        <Input
          id="title"
          placeholder="Ex: Mathématiques niveau 1"
          {...register("title", { required: true })}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description (optionnel)
        </Label>
        <Textarea
          id="description"
          placeholder="Description du cours..."
          {...register("description")}
          className="w-full"
          rows={3}
        />
      </div>

      {/* Zoom Link */}
      <div className="space-y-2">
        <Label htmlFor="zoomLink" className="text-sm font-medium">
          Lien Zoom (optionnel)
        </Label>
        <Input
          id="zoomLink"
          placeholder="https://zoom.us/j/..."
          {...register("zoomLink")}
          className="w-full"
        />
      </div>

      {/* Students Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Étudiants * ({selectedStudentIds.length} sélectionné(s))
        </Label>
        {students.length === 0 ? (
          <div className="text-sm text-gray-500 p-4 border rounded-md">
            Aucun étudiant disponible. Veuillez d'abord créer des étudiants.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
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

      {/* Submit Button */}
      <div className="flex items-center">
        <Button
          type="submit"
          disabled={loading || selectedStudentIds.length === 0}
          className="w-full min-h-[44px] text-base bg-[#050f8b] hover:bg-[#050f8b]/90"
        >
          {loading ? "Création en cours..." : "Créer le cours"}
        </Button>
      </div>
    </form>
  );
}
