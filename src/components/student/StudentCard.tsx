import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StudentAvatar } from "@/components/student/StudentAvatar";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Trash2,
  Mail,
  Phone,
  Calendar,
  User,
  Clock,
  GraduationCap,
  MapPin,
  MoreVertical,
  Edit3,
} from "lucide-react";
import { Student } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import StudentLayout from "@/app/dashboard/student/layout";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  isExpanded: boolean;
  isLoading: boolean;
  isCurrentUser: boolean;
}

export function StudentCard({
  student,
  onEdit,
  onDelete,
  onToggleExpanded,
  isExpanded,
  isLoading,
  isCurrentUser,
}: StudentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(student.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLastActivityText = () => {
    if (!student.lastActivity) return "Jamais";
    const lastActivity = new Date(student.lastActivity);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return formatDate(student.lastActivity);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary/20 overflow-hidden">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-start gap-4">
          {/* Enhanced Avatar Section */}
          <div className="flex-shrink-0 relative">
            <StudentAvatar
              student={{
                ...student,
                lastActivity: student.lastActivity
                  ? new Date(student.lastActivity)
                  : null,
              }}
              size="lg"
              showStatus={true}
            />
            {isCurrentUser && (
              <div className="absolute -top-1 -right-1">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-primary text-white"
                >
                  Vous
                </Badge>
              </div>
            )}
          </div>

          {/* Enhanced Student Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="flex-1 min-w-0 overflow-hidden">
                {/* Name with better typography */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">
                  {student.firstName} {student.lastName}
                </h3>

                {/* Email with icon */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 min-w-0">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${student.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    Contacter
                  </a>
                </div>

                {/* Enhanced Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    variant={
                      student.onboardingCompleted ? "primary" : "secondary"
                    }
                    className={`text-xs font-medium ${
                      student.onboardingCompleted
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {student.onboardingCompleted ? "✓ Complété" : "⏳ En cours"}
                  </Badge>
                  {student.grade && (
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/30 text-primary"
                    >
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {student.grade}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Expand/Collapse */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleExpanded(student.id)}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {/* Edit button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(student)}
                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>

                {/* Delete button - Only show if not current user */}
                {!isCurrentUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                  >
                    {isDeleting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Always Visible Student Details */}
      <CardContent className="pt-0 px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Contact
            </h4>
            <div className="space-y-2">
              {student.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-gray-700 break-all">
                    {student.phoneNumber}
                  </span>
                </div>
              )}
              {student.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 break-all">
                    {student.contact}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm min-w-0">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-3 w-3 text-purple-600" />
                </div>
                <span className="text-gray-700 truncate text-ellipsis">
                  {student.email}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Activité & Détails
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-3 w-3 text-orange-600" />
                </div>
                <span className="text-gray-700">
                  Inscrit le {formatDate(student.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-3 w-3 text-indigo-600" />
                </div>
                <span className="text-gray-700">
                  Dernière activité: {getLastActivityText()}
                </span>
              </div>
              {student.hourlyRate && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-3 w-3 text-yellow-600" />
                  </div>
                  <span className="text-gray-700">{student.hourlyRate}€/h</span>
                </div>
              )}
              {student.age && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-pink-600" />
                  </div>
                  <span className="text-gray-700">{student.age} ans</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details Section (Expandable) */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
              <MoreVertical className="h-4 w-4 text-primary" />
              Informations Supplémentaires
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Additional student information can go here */}
              <div className="text-sm text-gray-600">
                <p>
                  <strong>ID:</strong> {student.id}
                </p>
                <p>
                  <strong>Statut:</strong>{" "}
                  {student.onboardingCompleted ? "Actif" : "En attente"}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Créé le:</strong> {formatDate(student.createdAt)}
                </p>
                <p>
                  <strong>Dernière activité:</strong> {getLastActivityText()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
