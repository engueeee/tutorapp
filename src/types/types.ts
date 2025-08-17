// types.ts

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
  grade?: string;
  hourlyRate?: number;
}

// Pour le formulaire (frontend)
export type StudentForm = {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  grade: string;
};

// Pour l'envoi à l'API (backend)
export type StudentPayload = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  grade: string;
  tutorId: string;
  hourlyRate?: number;
};

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: "tutor" | "student";
  phoneNumber?: string;
  profilePhoto?: string;
  onboardingCompleted?: boolean;
  bio?: string;
  subjects?: string[];
  experience?: string;
  education?: string;
}

export type UserRegisterPayload = {
  email: string;
  password: string;
  role: "tutor" | "student";
};

export interface Tutor {
  id: string;
  email: string;
  role: "tutor";
}

export interface Lesson {
  id: string;
  tutor: Tutor;
  student: Student;
  date: string;
  startTime: string;
  endTime?: string; // optionnel si tu veux aussi le calculer
  duration?: string; // 👈 ajoute ceci !
  subject?: string;
  zoomLink?: string;
}

export interface Homework {
  id: string;
  student: Student;
  title: string;
  dueDate: string;
  status: "pending" | "completed" | "late";
  relatedLessonId?: string;
}
