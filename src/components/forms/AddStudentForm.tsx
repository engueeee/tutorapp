// Fichier : /src/components/forms/AddStudentForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createStudent } from "@/hooks/useCreateStudent";
import { toast } from "sonner";
import { User, Mail, Phone, GraduationCap, Euro, Calendar } from "lucide-react";

const studentSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  age: z.coerce.number().min(3, "Âge invalide").max(120, "Âge invalide"),
  email: z.string().email("Email invalide"),
  grade: z.string().min(1, "Le niveau scolaire est requis"),
  phoneNumber: z.string().optional(),
  hourlyRate: z.coerce
    .number()
    .min(0, "Le tarif horaire doit être positif")
    .optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export function AddStudentForm({
  tutorId,
  onStudentAdded,
  suppressToast = false,
}: {
  tutorId: string;
  onStudentAdded?: (student: any) => void;
  suppressToast?: boolean;
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
      const created = await createStudent({ ...data, tutorId });
      reset();
      if (onStudentAdded) onStudentAdded(created);
      if (!suppressToast) {
        toast.success("Ajout effectué avec succès", {
          description: `${data?.firstName} ${data?.lastName} est votre nouvel élève !`,
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'étudiant", err);
      toast.error("Une erreur est survenue lors de l'ajout de l'étudiant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              Prénom *
            </Label>
            <Input
              id="firstName"
              placeholder="Prénom de l'étudiant"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              Nom *
            </Label>
            <Input
              id="lastName"
              placeholder="Nom de l'étudiant"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="age"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Âge *
            </Label>
            <Input
              id="age"
              placeholder="Âge de l'étudiant"
              type="number"
              min="3"
              max="120"
              {...register("age")}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="grade"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Niveau scolaire *
            </Label>
            <Input
              id="grade"
              placeholder="Ex: 6ème, 3ème, Terminale..."
              {...register("grade")}
            />
            {errors.grade && (
              <p className="text-sm text-red-500">{errors.grade.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Informations de contact
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email *
            </Label>
            <Input
              id="email"
              placeholder="email@exemple.com"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Numéro de téléphone
            </Label>
            <Input
              id="phoneNumber"
              placeholder="06 12 34 56 78"
              type="tel"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Euro className="h-5 w-5 text-primary" />
          Informations tarifaires
        </h3>

        <div className="space-y-2">
          <Label
            htmlFor="hourlyRate"
            className="text-sm font-medium text-gray-700"
          >
            Tarif horaire (€/h)
          </Label>
          <Input
            id="hourlyRate"
            placeholder="25"
            type="number"
            min="0"
            step="0.01"
            {...register("hourlyRate")}
          />
          {errors.hourlyRate && (
            <p className="text-sm text-red-500">{errors.hourlyRate.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Laissez vide pour utiliser le tarif par défaut
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          className="w-full sm:w-auto"
        >
          Réinitialiser
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#050f8b] hover:bg-[#050f8b]/90 text-white font-semibold"
        >
          {loading ? "Enregistrement..." : "Ajouter l'étudiant"}
        </Button>
      </div>
    </form>
  );
}
