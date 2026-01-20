import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Logs error only in development mode
 * @param message - Error message
 * @param error - Error object
 */
export function logError(message: string, error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(message, error);
  }
}
