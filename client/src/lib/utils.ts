import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImage(url: string, options: { width?: number; quality?: string } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const widthStr = options.width ? `w_${options.width},` : '';
  const qualityStr = options.quality ? `q_${options.quality},` : 'q_auto,';
  const formatStr = 'f_auto/';

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  return `${parts[0]}/upload/c_limit,${widthStr}${qualityStr}${formatStr}${parts[1]}`;
}
