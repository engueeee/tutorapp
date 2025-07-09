// Fichier : /src/app/register/page.tsx

"use client";

import { RegisterForm } from "@/components/forms/RegisterForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { log } from "console";
import { User, UserRegisterPayload } from "@/types/types";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (data: UserRegisterPayload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: { token: string; user: User; error: string } =
        await res.json();

      if (!res.ok) {
        setError(result.error || "Erreur inconnue");
        return;
      }
      router.push(`/dashboard/${result.user.role}`);
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border rounded shadow-sm">
      <h1 className="text-xl font-bold mb-4">Inscription</h1>
      <RegisterForm
        onRegister={handleRegister}
        loading={loading}
        error={error}
      />
    </main>
  );
}
