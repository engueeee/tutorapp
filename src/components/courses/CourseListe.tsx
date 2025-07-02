// Fichier : /src/components/courses/CourseList.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  students: { id: string; firstName: string; lastName: string }[];
  createdAt: string;
  status: "Active" | "Pending";
}

export function CourseList({ tutorId }: { tutorId: string }) {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch(`/api/courses?tutorId=${tutorId}`);
      const data = await res.json();
      setCourses(data);
    }
    fetchCourses();
  }, [tutorId]);

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-4">Cours actuels</h2>
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Cours</th>
                <th className="text-left py-2">Elèves</th>
                <th className="text-left py-2">Statut</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b">
                  <td className="py-2 font-medium">{course.title}</td>
                  <td className="py-2">
                    {course.students
                      .map((s) => `${s.firstName} ${s.lastName}`)
                      .join(", ")}
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        course.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="py-2">
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>{" "}
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
