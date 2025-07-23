"use client";

import { useEffect, useState } from "react";
import { GroupedLessonsList } from "./GroupedLessonsList";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
  };
  lessonStudents?: {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      grade: string;
    };
  }[];
  course: {
    id: string;
    title: string;
  };
}

interface DashboardLessonsSectionProps {
  tutorId: string;
  onLessonsChanged?: () => void;
}

export function DashboardLessonsSection({
  tutorId,
  onLessonsChanged,
}: DashboardLessonsSectionProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons?tutorId=${tutorId}`);

      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
      }
    } catch (error) {
      // Handle error silently or show a toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tutorId) {
      fetchLessons();
    }
  }, [tutorId]);

  // Handler to refresh lessons and notify parent
  const handleLessonsChanged = () => {
    fetchLessons();
    if (onLessonsChanged) onLessonsChanged();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <GroupedLessonsList
      lessons={lessons}
      tutorId={tutorId}
      loading={loading}
      onLessonsChanged={handleLessonsChanged}
    />
  );
}
