"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear auth data
      logout();

      // Show success message
      toast.success("Déconnexion réussie");

      // Force a hard redirect to the home page to ensure complete cleanup
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Se déconnecter
    </Button>
  );
}
