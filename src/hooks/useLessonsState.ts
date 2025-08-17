import { useState, useCallback } from "react";
import { Lesson } from "@/modules/dashboard/types";

export function useLessonsState(initialLessons: Lesson[] = []) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

  const addLesson = useCallback((lesson: Lesson) => {
    setLessons((prev) => [...prev, lesson]);
  }, []);

  const updateLesson = useCallback((updatedLesson: Lesson) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      )
    );
  }, []);

  const deleteLesson = useCallback((lessonId: string) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
  }, []);

  const setLessonsData = useCallback((newLessons: Lesson[]) => {
    setLessons(newLessons);
  }, []);

  return {
    lessons,
    addLesson,
    updateLesson,
    deleteLesson,
    setLessonsData,
  };
}
