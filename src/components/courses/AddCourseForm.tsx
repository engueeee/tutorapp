// Fichier : /src/components/forms/AddCourseForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface AddCourseFormProps {
  tutorId: string;
}

export function AddCourseForm({ tutorId }: AddCourseFormProps) {
  const { register, handleSubmit, reset } = useForm();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      const res = await fetch(`/api/students?tutorId=${tutorId}`);
      const data = await res.json();
      setStudents(data);
    }
    fetchStudents();
  }, [tutorId]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Ensure studentIds is always an array
      const studentIds = Array.isArray(data.studentIds)
        ? data.studentIds
        : data.studentIds
        ? [data.studentIds]
        : [];

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tutorId,
          studentIds,
          zoomLink: data.zoomLink || "",
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du cours");

      toast.success("Cours créé", {
        description: `Le cours ${data.title} a été créé avec ${
          data.studentIds?.length || 0
        } élèves.`,
      });
      reset();
    } catch (err) {
      toast.error("Erreur", { description: "Impossible de créer le cours" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 max-w-md w-full mx-auto p-2 sm:p-4">
      <CardHeader>
        <CardTitle>Ajouter un cours</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            placeholder="Titre du cours"
            {...register("title")}
            className="w-full"
          />
          <Textarea
            placeholder="Description (optionnel)"
            {...register("description")}
            className="w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" {...register("date")} className="w-full" />
            <Input type="time" {...register("startTime")} className="w-full" />
          </div>
          <Input
            placeholder="Durée (ex: 1h)"
            {...register("duration")}
            className="w-full"
          />
          <Input
            placeholder="Lien Zoom (optionnel)"
            {...register("zoomLink")}
            className="w-full"
          />
          <Input
            placeholder="Sujet du cours (optionnel)"
            {...register("subject")}
            className="w-full"
          />
          <div className="space-y-2">
            <label className="font-medium">Sélectionnez les élèves :</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {students.map((student) => (
                <label key={student.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={student.id}
                    {...register("studentIds")}
                  />
                  <span>
                    {student.firstName} {student.lastName}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] text-base"
            >
              {loading ? "Création en cours..." : "Créer le cours"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
