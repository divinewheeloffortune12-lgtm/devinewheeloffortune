import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Optimizes a Cloudinary image URL by injecting transformation parameters.
 *
 * This adds:
 * - f_auto: automatic format selection (WebP/AVIF for supported browsers)
 * - q_auto: automatic quality optimization
 * - c_limit: crop mode that only downsizes, never upscales
 * - w_<width>: optional width constraint
 *
 * This approach generates derived assets on-demand via Cloudinary's URL-based
 * transformation system — no extra storage cost for the original, and Cloudinary
 * caches transformed results at its CDN edge.
 *
 * NOTE: Cloudinary already converts originals to webp on upload (see adminProduct.controller.js),
 * but f_auto on delivery still allows format negotiation per-browser.
 *
 * @param url      - The original Cloudinary secure_url from the database.
 * @param options  - Optional transformation parameters.
 * @returns        - The optimized URL, or the original if not a Cloudinary URL.
 */
export function optimizeImage(
  url: string,
  options: { width?: number; quality?: string; height?: number } = {}
): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  const widthStr = options.width ? `w_${options.width},` : "";
  const heightStr = options.height ? `h_${options.height},` : "";
  const qualityStr = options.quality ? `q_${options.quality},` : "q_auto,";
  const formatStr = "f_auto/";

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  // Build transformation string: remove any existing transformations to avoid conflicts
  // by inserting ours just after /upload/
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
