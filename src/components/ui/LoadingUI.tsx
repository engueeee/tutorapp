"use client";

import { Loader2, BookOpen, Users, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface LoadingUIProps {
  variant?:
    | "page"
    | "dashboard"
    | "student-dashboard"
    | "skeleton"
    | "revenue"
    | "course-module"
    | "lesson-list"
    | "student-manager";
  message?: string;
}

export function LoadingUI({
  variant = "page",
  message = "Chargement en cours...",
}: LoadingUIProps) {
  if (variant === "skeleton") {
    return <SkeletonLoader />;
  }

  if (variant === "dashboard") {
    return <DashboardSkeleton />;
  }

  if (variant === "student-dashboard") {
    return <StudentDashboardSkeleton />;
  }

  if (variant === "revenue") {
    return <RevenueSkeleton />;
  }

  if (variant === "course-module") {
    return <CourseModuleSkeleton />;
  }

  if (variant === "lesson-list") {
    return <LessonListSkeleton />;
  }

  if (variant === "student-manager") {
    return <StudentManagerSkeleton />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-400 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-400 rounded w-2/3"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-blue-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-blue-300 rounded w-2/3"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-400" />
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tutors Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-secondary-300 to-secondary-100 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-secondary-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
      </div>

      {/* Revenue Chart Skeleton */}
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseModuleSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-purple-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-purple-300 rounded w-2/3"></div>
      </div>

      {/* Module Content Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LessonListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-blue-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-blue-300 rounded w-2/3"></div>
      </div>

      {/* Lesson List Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudentManagerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-green-200 to-teal-200 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-green-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-green-300 rounded w-2/3"></div>
      </div>

      {/* Student List Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
