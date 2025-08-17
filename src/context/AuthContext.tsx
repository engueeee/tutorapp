"use client";

import { User } from "@/types/types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getUserData, invalidateCache } from "@/lib/dataManager";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getUserData: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("AuthContext: Initializing authentication...");
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        console.log("AuthContext: Found stored token");
        setToken(storedToken);
      }
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("AuthContext: Found stored user:", parsedUser.email);
          setUser(parsedUser);
        } catch (error) {
          console.error("AuthContext: Error parsing stored user data:", error);
          // Clear invalid data
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }

      // Set loading to false after initialization
      console.log("AuthContext: Authentication initialization complete");
      setLoading(false);
    } else {
      console.log(
        "AuthContext: Server-side rendering, skipping initialization"
      );
      setLoading(false);
    }
  }, []);

  const getUserDataFromManager = useCallback(async (): Promise<User | null> => {
    if (!user?.id) return null;

    try {
      console.log("AuthContext: Fetching user data via DataManager");
      const userData = await getUserData(user.id, true); // Get full user data
      return userData;
    } catch (error) {
      console.error("AuthContext: Error fetching user data:", error);
      return null;
    }
  }, [user?.id]);

  const logout = () => {
    if (typeof window !== "undefined") {
      // Clear all auth-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Also clear any session storage if used
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }

    // Clear all cache when logging out
    invalidateCache();

    // Clear state immediately
    setUser(null);
    setToken(null);

    // Force a re-render by triggering a state update
    setTimeout(() => {
      setUser(null);
      setToken(null);
    }, 0);
  };

  const refreshUser = async () => {
    if (!user?.id) return;

    try {
      const userData = await getUserDataFromManager();
      if (userData) {
        const newUserData = { ...user, ...userData };
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
      value={{
        user,
        token,
        loading,
        setUser,
        setToken,
        logout,
        refreshUser,
        getUserData: getUserDataFromManager,
      }}
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
