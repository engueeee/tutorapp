"use client";

import { RegisterForm } from "@/components/forms/RegisterForm";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, UserRegisterPayload } from "@/types/types";
import { LoadingUI } from "@/components/ui/LoadingUI";

export default function RegisterPageClient() {
  const { user, loading: authLoading, setUser, setToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, authLoading, router]);

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

      // Set authentication data
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      router.push(`/dashboard/${result.user.role}`);
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingUI variant="page" message="Initialisation..." />
      </div>
    );
  }

  // If user is already authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

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
