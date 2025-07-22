import { useCallback } from "react";

export function useUpdateStudentActivity() {
  const updateActivity = useCallback(async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}/activity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to update student activity");
      }
    } catch (error) {
      console.error("Error updating student activity:", error);
    }
  }, []);

  return { updateActivity };
}
