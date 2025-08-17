// Fichier : /src/components/StudentManager.tsx

"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/context/AuthContext";
import { StudentList } from "@/components/student/StudentList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function StudentManager() {
  // Use centralized data management
  const { user } = useAuth();
  const { data, loading, error, refresh, invalidateCache } = useDashboardData({
    includeStudents: true,
  });

  const handleRefresh = () => {
    refresh();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">
            Chargement des étudiants...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <StudentList
          tutorId={user?.id || ""}
          refreshFlag={0}
          onStudentAdded={handleRefresh}
        />
      </CardContent>
    </Card>
  );
}
