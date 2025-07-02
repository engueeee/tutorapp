// Fichier : /src/app/login/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/forms/LoginForm";
import { toast } from "sonner";

export default function LoginPage() {
  const { setUser, setToken, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, router]);

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
      console.log("Result : ", result);

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      router.replace(`/dashboard/${result.user.role}`);
      toast.success("Bienvenue !", {
        description: `${result.user?.firstName} ${result.user?.lastName} !.`,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>
      <LoginForm onLogin={handleLogin} loading={loading} error={error} />
    </div>
  );
}
