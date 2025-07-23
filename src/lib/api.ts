import { ApiResponse, Student, Course, Lesson, User } from "@/types";

const API_BASE = "/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || "API request failed"
    );
  }

  const data = await response.json();
  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, role: "tutor" | "student") =>
    apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),
};

// Students API
export const studentsApi = {
  getAll: (tutorId: string) =>
    apiRequest<Student[]>(`/students?tutorId=${tutorId}`),

  getById: (id: string) => apiRequest<Student>(`/students/${id}`),

  create: (data: Partial<Student>) =>
    apiRequest<Student>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Student>) =>
    apiRequest<Student>(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/students/${id}`, { method: "DELETE" }),

  updateActivity: (id: string) =>
    apiRequest<void>(`/students/${id}/activity`, {
      method: "PUT",
    }),
};

// Courses API
export const coursesApi = {
  getAll: (tutorId: string) =>
    apiRequest<Course[]>(`/courses?tutorId=${tutorId}`),

  getById: (id: string) => apiRequest<Course>(`/courses/${id}`),

  create: (data: Partial<Course>) =>
    apiRequest<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Course>) =>
    apiRequest<Course>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/courses/${id}`, { method: "DELETE" }),
};

// Lessons API
export const lessonsApi = {
  getAll: (params?: {
    tutorId?: string;
    courseId?: string;
    studentId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.tutorId) searchParams.append("tutorId", params.tutorId);
    if (params?.courseId) searchParams.append("courseId", params.courseId);
    if (params?.studentId) searchParams.append("studentId", params.studentId);

    return apiRequest<Lesson[]>(`/lessons?${searchParams.toString()}`);
  },

  getById: (id: string) => apiRequest<Lesson>(`/lessons/${id}`),

  create: (data: Partial<Lesson>) =>
    apiRequest<Lesson>("/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Lesson>) =>
    apiRequest<Lesson>(`/lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/lessons/${id}`, { method: "DELETE" }),
};

// Users API
export const usersApi = {
  getById: (id: string) => apiRequest<User>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    apiRequest<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Revenue API
export const revenueApi = {
  getOverview: (tutorId: string, period?: string) =>
    apiRequest<{ total: number; data: any[] }>(
      `/revenue?tutorId=${tutorId}${period ? `&period=${period}` : ""}`
    ),
};
