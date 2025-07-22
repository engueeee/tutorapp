"use client";

import { StudentAvatar } from "@/components/student/StudentAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAvatarsClient() {
  // Sample students with different statuses
  const sampleStudents = [
    {
      id: "1",
      firstName: "Alice",
      lastName: "Johnson",
      profilePhoto: null,
      lastActivity: new Date(), // Active (today)
    },
    {
      id: "2",
      firstName: "Bob",
      lastName: "Smith",
      profilePhoto:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Recent (2 days ago)
    },
    {
      id: "3",
      firstName: "Charlie",
      lastName: "Brown",
      profilePhoto: null,
      lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Absent (10 days ago)
    },
    {
      id: "4",
      firstName: "Diana",
      lastName: "Prince",
      profilePhoto:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      lastActivity: null, // No activity
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test des Avatars d'Étudiants
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sampleStudents.map((student) => (
            <Card key={student.id} className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {student.firstName} {student.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <StudentAvatar
                    student={student}
                    size="lg"
                    showStatus={true}
                  />
                </div>
                <div className="text-center text-sm text-gray-600">
                  <p>Dernière activité:</p>
                  <p className="font-medium">
                    {student.lastActivity
                      ? student.lastActivity.toLocaleDateString("fr-FR")
                      : "Jamais"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tailles d'Avatars
          </h2>
          <div className="flex items-center gap-8">
            {sampleStudents.slice(0, 3).map((student) => (
              <div key={student.id} className="text-center">
                <StudentAvatar
                  student={student}
                  size="sm"
                  showStatus={true}
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">Petit</p>
              </div>
            ))}
            {sampleStudents.slice(0, 3).map((student) => (
              <div key={student.id} className="text-center">
                <StudentAvatar
                  student={student}
                  size="md"
                  showStatus={true}
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">Moyen</p>
              </div>
            ))}
            {sampleStudents.slice(0, 3).map((student) => (
              <div key={student.id} className="text-center">
                <StudentAvatar
                  student={student}
                  size="lg"
                  showStatus={true}
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">Grand</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Légende des Statuts
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold">Actif</h3>
                    <p className="text-sm text-gray-600">Actif aujourd'hui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold">Récent</h3>
                    <p className="text-sm text-gray-600">Connecté récemment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold">Absent</h3>
                    <p className="text-sm text-gray-600">
                      Aucune activité récente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
