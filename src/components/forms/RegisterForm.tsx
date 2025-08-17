// Fichier : /src/components/forms/RegisterForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRegisterPayload } from "@/types/types";

const registerSchema = z.object({
  firstName: z.string().min(1, "Champ requis"),
  lastName: z.string().min(1, "Champ requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
  role: z.enum(["tutor", "student"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onRegister?: (data: UserRegisterPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function RegisterForm({
  onRegister,
  loading = false,
  error,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    if (onRegister) {
      await onRegister(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-xs w-full mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md"
    >
      <Input
        placeholder="Prénom"
        {...register("firstName")}
        aria-invalid={!!errors.firstName}
        className="w-full"
      />
      {errors.firstName && (
        <p className="text-sm text-red-500">{errors.firstName.message}</p>
      )}
      <Input placeholder="Nom" {...register("lastName")} className="w-full" />
      {errors.lastName && (
        <p className="text-sm text-red-500">{errors.lastName.message}</p>
      )}
      <Input
        placeholder="Email"
        type="email"
        {...register("email")}
        className="w-full"
      />
      {errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}
      <Input
        placeholder="Mot de passe"
        type="password"
        {...register("password")}
        className="w-full"
      />
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Rôle</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="tutor"
              {...register("role")}
              className="mr-2"
            />
            Tuteur
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="student"
              {...register("role")}
              className="mr-2"
            />
            Étudiant
          </label>
        </div>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-white"
      >
        {loading ? "Inscription en cours..." : "S'inscrire"}
      </Button>
    </form>
  );
}
