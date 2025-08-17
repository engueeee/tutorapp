"use client";

import { TutorSettings } from "@/modules/settings/TutorSettings";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function TutorSettingsPage() {
  return (
    <RoleGuard allowedRoles={["tutor"]}>
      <TutorSettings />
    </RoleGuard>
  );
}
