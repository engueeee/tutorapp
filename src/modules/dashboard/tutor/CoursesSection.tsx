import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddCourseForm } from "@/components/courses/AddCourseForm";
import { Course } from "../types";

interface CoursesSectionProps {
  courses: Course[];
  tutorId: string;
}

export function CoursesSection({ courses, tutorId }: CoursesSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Current Courses</h2>
      <AddCourseForm tutorId={tutorId} />
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
                          : course.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
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
  );
}
