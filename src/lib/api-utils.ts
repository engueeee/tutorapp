import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiResponse = {
  success: <T>(data: T, status = 200) =>
    NextResponse.json({ data } as ApiResponse<T>, { status }),

  error: (message: string, status = 500, details?: any) =>
    NextResponse.json({ error: message, details } as ApiResponse, { status }),

  validationError: (details: any) =>
    NextResponse.json({ error: "Validation failed", details } as ApiResponse, {
      status: 400,
    }),

  notFound: (message = "Resource not found") =>
    NextResponse.json({ error: message } as ApiResponse, { status: 404 }),

  unauthorized: (message = "Unauthorized") =>
    NextResponse.json({ error: message } as ApiResponse, { status: 401 }),

  forbidden: (message = "Forbidden") =>
    NextResponse.json({ error: message } as ApiResponse, { status: 403 }),

  conflict: (message = "Conflict") =>
    NextResponse.json({ error: message } as ApiResponse, { status: 409 }),
};

export const handleApiError = (error: unknown): NextResponse => {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return apiResponse.error(error.message, error.statusCode, error.details);
  }

  if (error instanceof Error) {
    // Handle specific Prisma errors
    if (error.message.includes("Unique constraint")) {
      return apiResponse.conflict("Resource already exists");
    }

    if (error.message.includes("Foreign key constraint")) {
      return apiResponse.error("Related resource not found", 400);
    }
  }

  return apiResponse.error("Internal server error");
};

export const validateRequest = <T>(
  schema: any,
  data: any
): { success: true; data: T } | { success: false; errors: any } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error.errors };
};
