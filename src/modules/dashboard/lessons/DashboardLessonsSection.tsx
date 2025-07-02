"use client";

import { useEffect, useState } from "react";
import { LessonsList } from "./LessonsList";

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
  course: {
    id: string;
    title: string;
  };
}

export function DashboardLessonsSection({ tutorId }: { tutorId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      try {
        const res = await fetch(`/api/lessons?tutorId=${tutorId}`);
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    }

    if (tutorId) {
      fetchLessons();
    }
  }, [tutorId]);

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

  return <LessonsList lessons={lessons} />;
}
