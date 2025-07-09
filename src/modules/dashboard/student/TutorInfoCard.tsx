"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface TutorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TutorInfoCardProps {
  studentId: string;
}

export function TutorInfoCard({ studentId }: TutorInfoCardProps) {
  const [tutor, setTutor] = useState<TutorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        setLoading(true);

        if (!studentId || studentId.trim() === "") {
          setLoading(false);
          return;
        }

        // Fetch student with tutor information
        const response = await fetch(`/api/students/${studentId}/tutor`);

        if (!response.ok) {
          if (response.status === 404) {
            // No tutor assigned - this is normal for some students
            setTutor(null);
            setLoading(false);
            return;
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to fetch tutor info: ${
              errorData.error || response.statusText
            }`
          );
        }

        const data = await response.json();

        if (data.tutor) {
          setTutor(data.tutor);
        } else {
          setTutor(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tutor info"
        );
      } finally {
        setLoading(false);
      }
    };

    if (studentId && studentId.trim() !== "") {
      fetchTutorInfo();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mon Tuteur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              Chargement des informations du tuteur...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mon Tuteur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tutor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mon Tuteur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun tuteur assigné
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas encore de tuteur assigné. Contactez
              l'administration pour plus d'informations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mon Tuteur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          {/* Tutor Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {tutor.firstName.charAt(0)}
              {tutor.lastName.charAt(0)}
            </div>
          </div>

          {/* Tutor Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {tutor.firstName} {tutor.lastName}
              </h3>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Tuteur
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{tutor.email}</span>
              </div>

              {/* You can add more tutor information here if available */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Disponible pour les cours</span>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="mt-4 flex gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                <Mail className="h-4 w-4" />
                Contacter
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <Phone className="h-4 w-4" />
                Appeler
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
