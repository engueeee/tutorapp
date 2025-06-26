// Fichier : /src/app/dashboard/tutor/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AddStudentForm } from "@/components/forms/AddStudentForm";
import { StudentManager } from "@/components/dashboard/StudentManager";

export default function TutorDashboard() {
  const { user } = useAuth();

  const courses = [
    { title: "Introduction to Calculus", students: 25, status: "Active" },
    { title: "Advanced Linear Algebra", students: 18, status: "Active" },
    { title: "Probability and Statistics", students: 22, status: "Upcoming" },
  ];

  const studentsList = [
    {
      name: "Liam Harper",
      course: "Introduction to Calculus",
      progress: 75,
      grade: "A",
    },
    {
      name: "Olivia Bennett",
      course: "Advanced Linear Algebra",
      progress: 88,
      grade: "B",
    },
    {
      name: "Noah Carter",
      course: "Probability and Statistics",
      progress: 60,
      grade: "C",
    },
    {
      name: "Ava Mitchell",
      course: "Introduction to Calculus",
      progress: 92,
      grade: "A",
    },
    {
      name: "Ethan Parker",
      course: "Advanced Linear Algebra",
      progress: 78,
      grade: "B",
    },
  ];

  const [students, setStudents] = useState<
    { id: string; firstName: string; lastName: string; grade?: string }[]
  >([]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      const res = await fetch(`/api/students?tutorId=${user.id}`);
      const data = await res.json();
      setStudents(data);
    };
    fetchStudents();
  }, [user]);

  if (!user) return null;

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user.firstName} {user.lastName}
      </p>

      <section>
        <h2 className="text-lg font-semibold mb-4">Current Courses</h2>
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Course</th>
                  <th className="text-left py-2">Students</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.title} className="border-b">
                    <td className="py-2 font-medium">{course.title}</td>
                    <td>{course.students}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          course.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <StudentManager tutorId={user.id} />
    </main>
  );
}
