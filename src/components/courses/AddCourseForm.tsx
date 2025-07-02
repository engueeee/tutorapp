// Fichier : /src/components/forms/AddCourseForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tutorId,
          studentIds: data.studentIds || [],
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Titre du cours" {...register("title")} />
      <Textarea
        placeholder="Description (optionnel)"
        {...register("description")}
      />
      <Input type="date" {...register("date")} />
      <Input type="time" {...register("startTime")} />
      <Input placeholder="Durée (ex: 1h)" {...register("duration")} />
      <Input placeholder="Lien Zoom (optionnel)" {...register("zoomLink")} />
      <Input
        placeholder="Sujet du cours (optionnel)"
        {...register("subject")}
      />

      <div className="space-y-2">
        <label className="font-medium">Sélectionnez les élèves :</label>
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

      <Button type="submit" disabled={loading}>
        {loading ? "Création en cours..." : "Créer le cours"}
      </Button>
    </form>
  );
}
