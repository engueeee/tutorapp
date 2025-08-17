"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Star,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

interface TutorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  subjects?: string[];
  experience?: string;
  education?: string;
  profilePhoto?: string;
  location?: string;
  rating?: number;
}

interface TutorInfoCardProps {
  tutor: TutorInfo;
  className?: string;
}

export function TutorInfoCard({ tutor, className = "" }: TutorInfoCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Mon Tuteur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div>
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={tutor.profilePhoto || undefined}
                alt={`${tutor.firstName} ${tutor.lastName}`}
              />
            </Avatar>
          </div>

          {/* Tutor Info */}
          <div className="flex-1 space-y-3">
            {/* Name and Rating */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {tutor.firstName} {tutor.lastName}
                </h3>
                <p className="text-sm text-gray-600">Tuteur</p>
              </div>
              {formatRating(tutor.rating)}
            </div>

            {/* Bio */}
            {tutor.bio && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {tutor.bio}
              </p>
            )}

            {/* Subjects */}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${tutor.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {tutor.email}
                </a>
              </div>

              {tutor.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${tutor.phoneNumber}`}
                    className="hover:text-primary transition-colors"
                  >
                    {tutor.phoneNumber}
                  </a>
                </div>
              )}

              {tutor.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{tutor.location}</span>
                </div>
              )}
            </div>

            {/* Experience and Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {tutor.experience && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Expérience
                  </h4>
                  <p className="text-xs text-gray-600">{tutor.experience}</p>
                </div>
              )}

              {tutor.education && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Formation
                  </h4>
                  <p className="text-xs text-gray-600">{tutor.education}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => window.open(`mailto:${tutor.email}`, "_blank")}
              >
                <Mail className="h-4 w-4" />
                Contacter
              </Button>

              {tutor.phoneNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() =>
                    window.open(`tel:${tutor.phoneNumber}`, "_blank")
                  }
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
