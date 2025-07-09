import { Card, CardContent } from "@/components/ui/card";
import { Lesson } from "../types";

interface UpcomingLessonsProps {
  lessons: Lesson[];
}

export function UpcomingLessons({ lessons }: UpcomingLessonsProps) {
  return (
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
                href={lesson.zoomLink || undefined}
                className="text-blue-600 text-sm underline"
              >
                Join on Zoom
              </a>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
