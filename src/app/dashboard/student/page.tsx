// Fichier : /src/app/dashboard/student/page.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StudentDashboard() {
  const { user } = useAuth();

  const lessons = [
    {
      subject: "Introduction to Calculus",
      date: "2024-07-08",
      startTime: "14:00",
      zoomLink: "#",
    },
    {
      subject: "Advanced Linear Algebra",
      date: "2024-07-11",
      startTime: "09:00",
      zoomLink: "#",
    },
  ];

  const homework = [
    { title: "Derivatives Exercise", dueDate: "2024-07-10", status: "pending" },
    {
      title: "Matrix Multiplication",
      dueDate: "2024-07-15",
      status: "completed",
    },
  ];

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user?.email?.split("@")[0]}
      </p>

      <section>
        <h2 className="text-lg font-semibold mb-4">Upcoming Lessons</h2>
        <Card>
          <CardContent className="space-y-4 py-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.subject + lesson.date}
                className="border p-4 rounded"
              >
                <p className="font-medium">{lesson.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {lesson.date} at {lesson.startTime}
                </p>
                <a
                  href={lesson.zoomLink}
                  className="text-blue-600 text-sm underline"
                >
                  Join on Zoom
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Homework</h2>
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {homework.map((hw) => (
                  <tr key={hw.title} className="border-b">
                    <td className="py-2 font-medium">{hw.title}</td>
                    <td>{hw.dueDate}</td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          hw.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : hw.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {hw.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
