import { toast } from "sonner";
import { AppError } from "@/types";

export function handleError(error: unknown, context?: string): AppError {
  let appError: AppError;

  if (error instanceof Error) {
    appError = {
      code: "API_ERROR",
      message: error.message,
      details: error,
    };
  } else if (typeof error === "string") {
    appError = {
      code: "GENERIC_ERROR",
      message: error,
      details: error,
    };
  } else {
    appError = {
      code: "UNKNOWN_ERROR",
      message: "Une erreur inattendue s'est produite",
      details: error,
    };
  }

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context || "App"}] Error:`, appError);
  }

  return appError;
}

export function showErrorToast(error: unknown, context?: string) {
  const appError = handleError(error, context);
  toast.error("Erreur", {
    description: appError.message,
  });
}

export function showSuccessToast(message: string) {
  toast.success("Succès", {
    description: message,
  });
}
