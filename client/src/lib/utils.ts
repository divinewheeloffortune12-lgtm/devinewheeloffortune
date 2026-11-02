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

/**
 * Known present services images stored statically inside the app (client/public/images/services).
 * Serving these locally avoids hitting Cloudinary bandwidth or credits.
 * Any new services uploaded later will seamlessly fall back to their Cloudinary URL.
 */
const STATIC_SERVICE_IMAGES = new Set([
  'ceprmt30uaafkrsxhjbd.webp',
  'f40jcnri8meamekeio5u.png',
  'fakmrtizrzrsjrudreax.webp',
  'ffmajw894cczhlfv112j.png',
  'g6gt2sjuq2cg3kkqpry5.webp',
  'gre1uklw51wd64gubvuq.png',
  'h5zyukmk3zz8vcgi4b2m.png',
  'hifzkrjm9ah4ba2ne5sn.png',
  'hla8eq52b9wq8hu54mjx.webp',
  'j8l4nmzavenoxvgonmtf.png',
  'k95zyeorn7p69alpeoze.webp',
  'ke2sck6rxewffwedheyj.webp',
  'khdpe223ihzyaj9gmu9c.png',
  'm1q2z4d98tq2nkq5dx2q.webp',
  'mamqjqkbmbr4rsol7lns.webp',
  'pfl1d8xvi0n264devcuw.png',
  'phxtspjimfpu7js27ow5.webp',
  'pnvnvbv45ylkldg0jnfz.webp',
  'qg0va3n2ifiwlvgj2tyl.png',
  'qsmmrxvzwsjjcbnjy9hp.png',
  'ruxq39nfphcdisbsejcw.png',
  'ttez3ivmryjhw5bvtpic.webp',
  'uwntlxujmqgtg0if29im.webp',
  'vobwlmekalv5oe58mxy9.png',
  'w4y57gw8hbkmzvonmnyu.png',
  'wlnyjzg37pjsno0lggqr.webp',
  'xuqg2wuabqdj8asyvyna.webp',
  'y1rrfeqsifl8gbfmsrwf.png',
  'ywmjcf0ynqztwjjt0ql2.png'
]);

export function getServiceImageUrl(url: string | undefined): string {
  if (!url) return '/images/placeholder.png';
  
  // Extract filename from URL (e.g. "hla8eq52b9wq8hu54mjx.webp")
  const filename = url.split('/').pop()?.split('?')[0];
  if (filename && STATIC_SERVICE_IMAGES.has(filename)) {
    return `/images/services/${filename}`;
  }
  
  // For any new services added later, serve their Cloudinary URL directly
  return url;
}
