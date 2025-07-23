"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear auth data
    logout();

    // Use window.location to bypass router and RoleGuard
    window.location.href = "/";
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Se déconnecter
    </Button>
  );
}
