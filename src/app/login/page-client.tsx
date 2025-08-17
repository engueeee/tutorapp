"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/forms/LoginForm";
import { toast } from "sonner";
import { LoadingUI } from "@/components/ui/LoadingUI";

export default function LoginPageClient() {
  const { setUser, setToken, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, authLoading, router]);

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Login failed");

      setToken(result.token);
      setUser(result.user);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      router.replace(`/dashboard/${result.user.role}`);
    } catch (err: any) {
      setError(err.message);
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
    <div className="max-w-md mx-auto mt-20">
      <img
        src="/logo.png"
        alt="TutorApp Logo"
        className="mx-auto mb-6 max-w-[180px]"
      />
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>
      <LoginForm onLogin={handleLogin} loading={loading} error={error} />
    </div>
  );
}
