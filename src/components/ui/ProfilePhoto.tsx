import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfilePhotoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ProfilePhoto({
  size = "md",
  className = "",
}: ProfilePhotoProps) {
  const { user } = useAuth();

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  if (!user) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center ${className}`}
      >
        <User className={`${textSizes[size]} text-gray-400`} />
      </div>
    );
  }

  if (user.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={`${user.firstName || user.email} profile`}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`}
      />
    );
  }

  // Default avatar with initials
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${textSizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
