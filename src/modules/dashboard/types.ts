// Student Dashboard Types
export interface Lesson {
  subject: string;
  date: string;
  startTime: string;
  zoomLink: string;
}

export interface Homework {
  title: string;
  dueDate: string;
  status: "completed" | "pending" | "overdue";
}

// Tutor Dashboard Types
export interface Course {
  title: string;
  students: number;
  status: "Active" | "Upcoming" | "Completed";
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
}
