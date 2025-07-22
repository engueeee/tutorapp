"use client";

import {
  calculateStudentStatus,
  getStudentInitials,
  getDefaultAvatarColor,
} from "@/lib/student-utils";
import { User } from "lucide-react";

interface StudentAvatarProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string | null;
    lastActivity?: Date | null;
  };
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

export function StudentAvatar({
  student,
  size = "md",
  showStatus = true,
  className = "",
}: StudentAvatarProps) {
  const status = calculateStudentStatus(student.lastActivity || null);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const badgeSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const badgePositionClasses = {
    sm: "top-0 right-0",
    md: "top-0 right-0",
    lg: "top-1 right-1",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Profile Picture */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}
      >
        {student.profilePhoto ? (
          <img
            src={student.profilePhoto}
            alt={`${student.firstName} ${student.lastName} profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector(
                  ".fallback-avatar"
                ) as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}

        {/* Fallback Avatar with Initials */}
        <div
          className={`fallback-avatar ${
            student.profilePhoto ? "hidden" : "flex"
          } items-center justify-center w-full h-full bg-gradient-to-br ${getDefaultAvatarColor(
            student.id
          )} text-white font-semibold ${
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg"
          }`}
        >
          {getStudentInitials(student.firstName, student.lastName)}
        </div>

        {/* Default Avatar Icon (if no photo and no initials) */}
        {!student.profilePhoto && (
          <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600">
            <User
              className={
                size === "sm"
                  ? "w-4 h-4"
                  : size === "md"
                  ? "w-6 h-6"
                  : "w-8 h-8"
              }
            />
          </div>
        )}
      </div>

      {/* Status Badge */}
      {showStatus && (
        <div
          className={`absolute ${badgePositionClasses[size]} ${badgeSizeClasses[size]} ${status.color} rounded-full border-2 border-white shadow-sm`}
          title={status.description}
        />
      )}
    </div>
  );
}
