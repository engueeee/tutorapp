// Fichier : /src/components/forms/AddStudentForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createStudent } from "@/hooks/useCreateStudent";
import { toast } from "sonner";

const studentSchema = z.object({
  firstName: z.string().min(1, "Champ requis"),
  lastName: z.string().min(1, "Champ requis"),
  age: z.coerce.number().min(3, "Âge invalide").max(120, "Âge invalide"),
  contact: z.string().email("Email invalide"),
  grade: z.string().min(1, "Champ requis"),
});

type StudentFormData = z.infer<typeof studentSchema>;

export function AddStudentForm({
  tutorId,
  onStudentAdded,
}: {
  tutorId: string;
  onStudentAdded?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({ resolver: zodResolver(studentSchema) });

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    try {
      await createStudent({ ...data, tutorId });
      reset();
      if (onStudentAdded) onStudentAdded();
      toast.success("Ajout effectué avec succès", {
        description: `${data?.firstName} ${data?.lastName} est votre nouvel élève !`,
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'étudiant", err);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Prénom" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <Input placeholder="Nom" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <Input placeholder="Âge" type="number" {...register("age")} />
        {errors.age && (
          <p className="text-sm text-red-500">{errors.age.message}</p>
        )}
      </div>

      <div>
        <Input
          placeholder="Email de contact"
          type="email"
          {...register("contact")}
        />
        {errors.contact && (
          <p className="text-sm text-red-500">{errors.contact.message}</p>
        )}
      </div>

      <div>
        <Input placeholder="Niveau scolaire" {...register("grade")} />
        {errors.grade && (
          <p className="text-sm text-red-500">{errors.grade.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enregistrement..." : "Ajouter l'étudiant"}
      </Button>
    </form>
  );
}
