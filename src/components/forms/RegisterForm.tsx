// Fichier : /src/components/forms/RegisterForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  firstName: z.string().min(1, "Champ requis"),
  lastName: z.string().min(1, "Champ requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
  role: z.enum(["tutor", "student"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Erreur inconnue");
        return;
      }

      const { token, user } = result;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setToken(token);

      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
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
      <div>
        <select
          {...register("role")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Sélectionner un rôle --</option>
          <option value="tutor">Tuteur</option>
          <option value="student">Élève</option>
        </select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        className="w-full min-h-[44px] text-base"
      >
        {loading ? "Inscription..." : "S'inscrire"}
      </Button>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </form>
  );
}
