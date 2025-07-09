"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useState } from "react";

export default function HomePage() {
  const { user, setUser, setToken } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === "tutor") {
        router.replace("/dashboard/tutor");
      } else if (user.role === "student") {
        router.replace("/dashboard/student");
      }
    }
  }, [user, router]);

  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setLoginError(result.error || "Erreur inconnue");
        return;
      }
      const { token, user } = result;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setToken(token);
      if (user.role === "tutor") {
        router.replace("/dashboard/tutor");
      } else if (user.role === "student") {
        router.replace("/dashboard/student");
      }
    } catch (err) {
      setLoginError("Erreur lors de la connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold mb-2">
            Bienvenue sur TutorApp
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant={showLogin ? "default" : "outline"}
              onClick={() => setShowLogin(true)}
              className="w-1/2"
            >
              Connexion
            </Button>
            <Button
              variant={!showLogin ? "default" : "outline"}
              onClick={() => setShowLogin(false)}
              className="w-1/2"
            >
              Inscription
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          {showLogin ? (
            <LoginForm
              onLogin={handleLogin}
              loading={loginLoading}
              error={loginError}
            />
          ) : (
            <RegisterForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
