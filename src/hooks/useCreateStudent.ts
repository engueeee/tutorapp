import { StudentPayload } from "@/types/types";

// /src/hooks/useCreateStudent.ts
export async function createStudent(data: StudentPayload) {
  const res = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");

  return res.json();
}
