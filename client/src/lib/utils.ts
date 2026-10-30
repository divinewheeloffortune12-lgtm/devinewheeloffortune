import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_FALLBACK_IMAGE = "/images/placeholder.png";

/**
 * Optimizes a Cloudinary image URL by injecting transformation parameters.
 *
 * NOTE: Cloudinary account has strict transformation security enabled for
 * certain formats (.png, .jpg), which causes 401 Transformation not allowed.
 * We only apply transformations to .webp Cloudinary URLs where transformations
 * are authorized, and return the clean untouched URL for .png/.jpg or others.
 *
 * @param url      - The original Cloudinary secure_url from the database.
 * @param options  - Optional transformation parameters.
 * @returns        - The optimized URL, or the original if not safe to transform.
 */
export function optimizeImage(
  url: string,
  options: { width?: number; quality?: string; height?: number } = {}
): string {
  if (!url || typeof url !== "string") return DEFAULT_FALLBACK_IMAGE;
  if (!url.includes("cloudinary.com")) return url;

  // If the Cloudinary asset is not a .webp, return the original URL directly
  // to avoid Cloudinary Strict Transformation 401 errors.
  const lowerUrl = url.toLowerCase();
  const isWebp = lowerUrl.endsWith(".webp") || lowerUrl.includes(".webp?");
  if (!isWebp) {
    return url;
  }

  const widthStr = options.width ? `w_${options.width},` : "";
  const heightStr = options.height ? `h_${options.height},` : "";
  const qualityStr = options.quality ? `q_${options.quality},` : "q_auto,";
  const formatStr = "f_auto/";

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  // Insert transformations safely
  const transformations = `c_limit,${widthStr}${heightStr}${qualityStr}${formatStr}`;
  return `${parts[0]}/upload/${transformations}${parts[1]}`;
}

/**
 * Returns the appropriate thumbnail transformation for common contexts.
 * This avoids downloading a 1200px-wide image for a 96px thumbnail.
 */
export function thumbnailImage(url: string): string {
  return optimizeImage(url, { width: 200, quality: "auto" });
}

/**
 * Returns an optimized URL for product cards (shop/listing pages).
 */
export function productCardImage(url: string): string {
  return optimizeImage(url, { width: 500 });
}

/**
 * Returns an optimized URL for product detail hero image.
 */
export function productDetailImage(url: string): string {
  return optimizeImage(url, { width: 900 });
}

/**
 * Returns an optimized URL for category and collection tiles.
 */
export function categoryImage(url: string): string {
  return optimizeImage(url, { width: 700 });
}
