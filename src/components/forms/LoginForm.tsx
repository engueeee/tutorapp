// Fichier : /src/components/forms/LoginForm.tsx

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  onLogin: (data: { email: string; password: string }) => void;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, loading, error }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xs w-full mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md"
    >
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />
      <Input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        className="w-full min-h-[44px] text-base"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
