"use client";

import { User } from "@/types/types";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        const newUserData = { ...user, ...updatedUser };
        setUser(newUserData);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(newUserData));
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
