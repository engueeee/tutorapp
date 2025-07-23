import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { Student } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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

  const getStudentInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Large Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-gray-200">
              <AvatarImage
                src={student.profilePhoto}
                alt={`${student.firstName} ${student.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="text-sm sm:text-base font-semibold">
                {getStudentInitials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Student Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                  {student.email}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge
                    variant={
                      student.onboardingCompleted ? "primary" : "secondary"
                    }
                    className="text-xs"
                  >
                    {student.onboardingCompleted ? "Complété" : "En cours"}
                  </Badge>
                  {student.grade && (
                    <Badge variant="outline" className="text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {student.grade}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleExpanded(student.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(student)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                {!isCurrentUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isDeleting}
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

      {/* Expanded Details */}
      {isExpanded && (
        <CardContent className="pt-0 border-t animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">Contact</h4>
              <div className="space-y-1">
                {student.phoneNumber && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">{student.phoneNumber}</span>
                  </div>
                )}
                {student.contact && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">{student.contact}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700 truncate">
                    {student.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity & Details */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">Activité</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">
                    Inscrit le {formatDate(student.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">
                    Dernière activité: {getLastActivityText()}
                  </span>
                </div>
                {student.hourlyRate && (
                  <div className="flex items-center gap-2 text-xs">
                    <GraduationCap className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">
                      {student.hourlyRate}€/h
                    </span>
                  </div>
                )}
                {student.age && (
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">{student.age} ans</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
