import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImage(url: string, _options: { width?: number; quality?: string } = {}) {
  // Return the original Cloudinary URL directly without modifying /upload/
  // because the Cloudinary account has Strict Transformations enabled, which
  // blocks unsigned URL parameters (c_limit, w_*, q_auto, f_auto) with HTTP 401.
  return url || '';
}
