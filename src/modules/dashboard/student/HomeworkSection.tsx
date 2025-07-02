import { Card, CardContent } from "@/components/ui/card";
import { Homework } from "../types";

interface HomeworkSectionProps {
  homework: Homework[];
}

export function HomeworkSection({ homework }: HomeworkSectionProps) {
  return (
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
  );
}
