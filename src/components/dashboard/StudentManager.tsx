// Fichier : /src/components/StudentManager.tsx

"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/context/AuthContext";
import { StudentList } from "@/components/student/StudentList";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function StudentManager() {
  const [showAddForm, setShowAddForm] = useState(false);

  // Use centralized data management
  const { user } = useAuth();
  const { data, loading, error, refresh, invalidateCache } = useDashboardData({
    includeStudents: true,
  });

  const handleStudentAdded = () => {
    // Invalidate students cache to force refresh
    invalidateCache("students");
    setShowAddForm(false);
  };

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Gestion des étudiants
            <span className="text-sm text-gray-500">
              ({data.students.length} étudiants)
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un étudiant
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showAddForm ? (
          <div className="mb-6">
            <AddStudentForm
              tutorId={user?.id || ""}
              onStudentAdded={handleStudentAdded}
            />
          </div>
        ) : null}

        <StudentList
          tutorId={user?.id || ""}
          refreshFlag={0}
          onStudentAdded={handleRefresh}
        />
      </CardContent>
    </Card>
  );
}
