// Core Entity Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "tutor" | "student";
  phoneNumber?: string;
  profilePhoto?: string;
  onboardingCompleted: boolean;
  bio?: string;
  subjects?: string[];
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  email?: string;
  grade?: string;
  contact?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  lastActivity?: string;
  onboardingCompleted: boolean;
  hourlyRate?: number;
  tutorId?: string;
  userId?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  tutorId: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  tutorId: string;
  courseId: string;
  studentId: string;
  createdAt: string;
  // Relationships
  tutor?: User;
  course?: Course;
  student?: Student;
  lessonStudents?: LessonStudent[];
}

export interface LessonStudent {
  lessonId: string;
  studentId: string;
  lesson?: Lesson;
  student?: Student;
}

export interface CourseStudent {
  courseId: string;
  studentId: string;
  course?: Course;
  student?: Student;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  role: "tutor" | "student";
}

export interface StudentForm {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  grade: string;
  contact?: string;
  phoneNumber?: string;
}

export interface CourseForm {
  title: string;
  description?: string;
  zoomLink?: string;
}

export interface LessonForm {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: string;
  zoomLink?: string;
  subject?: string;
  courseId: string;
  studentIds: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// UI Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
}

// Dashboard Types
export interface DashboardStats {
  totalLessons: number;
  todayLessons: number;
  upcomingLessons: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue?: number;
}

export interface RevenueData {
  period: string;
  amount: number;
  lessons: number;
  students: number;
}

// Filter and Sort Types
export type SortOption = "date" | "time" | "student" | "course" | "title";
export type FilterOption = "all" | "today" | "upcoming" | "past";

export interface FilterState {
  searchTerm: string;
  sortBy: SortOption;
  filterBy: FilterOption;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  description?: string;
  type: "lesson" | "event";
  color?: string;
}

// Onboarding Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isCompleted: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Utility Types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: AppError | null;
}
