"use client";

import { StudentSettings } from "@/modules/settings/StudentSettings";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function StudentSettingsPage() {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <StudentSettings />
    </RoleGuard>
  );
}
