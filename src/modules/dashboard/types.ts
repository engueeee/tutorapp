// Student, Course, Lesson, Homework types for dashboard

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  grade: string;
  profilePhoto?: string | null;
  lastActivity?: string | Date | null;
  phoneNumber?: string | null;
  courses: Course[];
  hourlyRate?: number;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  zoomLink?: string | null;
  tutorId: string;
  students: Student[];
  lessons: Lesson[];
  createdAt: string;
  isActive?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string | null;
  subject?: string | null;
  tutorComment?: string | null;
  createdAt: string;
  tutorId: string;
  courseId: string;
  course: Course;
  student: Student;
  lessonStudents?: {
    student: Student;
  }[];
}

export interface Homework {
  title: string;
  dueDate: string;
  status: "completed" | "pending" | "overdue";
}
