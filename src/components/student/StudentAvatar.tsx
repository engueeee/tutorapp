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
    lastActivity?: Date | string | null;
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
  // Ensure lastActivity is a Date object or null
  const lastActivity = student.lastActivity
    ? student.lastActivity instanceof Date
      ? student.lastActivity
      : new Date(student.lastActivity)
    : null;

  const status = calculateStudentStatus(lastActivity);

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

  // Helper function to ensure the image URL is properly formatted
  const getImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // If it's already an absolute URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // If it's a relative URL, make it absolute
    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }

    // If it's a data URL, return as is
    if (url.startsWith("data:")) {
      return url;
    }

    // Default case: assume it's a relative URL
    return `${window.location.origin}/${url}`;
  };

  const imageUrl = getImageUrl(student.profilePhoto);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Profile Picture */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${student.firstName} ${student.lastName} profile`}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center" }}
            onError={(e) => {
              console.error("StudentAvatar - image failed to load:", e);
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
            onLoad={() => {
              console.log("StudentAvatar - image loaded successfully");
            }}
          />
        ) : null}

        {/* Fallback Avatar with Initials */}
        <div
          className={`fallback-avatar ${
            imageUrl ? "hidden" : "flex"
          } items-center justify-center w-full h-full bg-gradient-to-br ${getDefaultAvatarColor(
            student.id
          )} text-white font-semibold ${
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg"
          }`}
        >
          {getStudentInitials(student.firstName, student.lastName)}
        </div>
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
