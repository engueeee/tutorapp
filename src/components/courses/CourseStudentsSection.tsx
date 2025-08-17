"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, Mail, Phone, GraduationCap } from "lucide-react";
import { Student } from "@/modules/dashboard/types";
import { StudentAvatar } from "@/components/student/StudentAvatar";

interface CourseStudentsSectionProps {
  students: Student[];
}

export function CourseStudentsSection({
  students,
}: CourseStudentsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStudentStatus = (student: Student) => {
    if (!student.lastActivity) {
      return {
        status: "inactive",
        label: "Inactif",
        color: "bg-gray-100 text-gray-800",
      };
    }

    // Ensure lastActivity is a Date object
    const lastActivity =
      student.lastActivity instanceof Date
        ? student.lastActivity
        : new Date(student.lastActivity);

    const now = new Date();
    const daysSinceActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity <= 1) {
      return {
        status: "active",
        label: "Actif",
        color: "bg-green-100 text-green-800",
      };
    } else if (daysSinceActivity <= 7) {
      return {
        status: "recent",
        label: "Récent",
        color: "bg-blue-100 text-blue-800",
      };
    } else {
      return {
        status: "inactive",
        label: "Inactif",
        color: "bg-gray-100 text-gray-800",
      };
    }
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Étudiants inscrits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Aucun étudiant"
            description="Aucun étudiant n'est encore inscrit à ce cours."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {students.length > 1 ? "Étudiants inscrits" : "Étudiant inscrit"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => {
            const status = getStudentStatus(student);

            return (
              <div
                key={student.id}
                className="p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Student Avatar */}
                  <StudentAvatar
                    student={student}
                    size="md"
                    showStatus={true}
                  />

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </h3>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-1 text-sm text-gray-600">
                      {student.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}

                      {student.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{student.phoneNumber}</span>
                        </div>
                      )}

                      {student.grade && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>{student.grade}</span>
                        </div>
                      )}

                      {student.age && (
                        <span className="text-gray-500">{student.age} ans</span>
                      )}
                    </div>

                    {/* Last Activity */}
                    {student.lastActivity && (
                      <div className="mt-2 text-xs text-gray-500">
                        Dernière activité:{" "}
                        {formatDate(
                          student.lastActivity instanceof Date
                            ? student.lastActivity.toISOString()
                            : student.lastActivity
                        )}
                      </div>
                    )}

                    {/* Hourly Rate */}
                    {student.hourlyRate && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {student.hourlyRate}€/h
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {students.length}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {
                  students.filter(
                    (s) => getStudentStatus(s).status === "active"
                  ).length
                }
              </div>
              <div className="text-xs text-gray-500">Actifs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
