import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_FALLBACK_IMAGE = "/images/placeholder.png";

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_FALLBACK_IMAGE
) {
  const target = e.currentTarget;
  if (!target.src.includes(fallback)) {
    target.onerror = null;
    target.src = fallback;
  }
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

/**
 * Known present category images stored statically inside the app (client/public/images/categories).
 * If re-uploaded or newly added later, they will fall back to their Cloudinary URL.
 */
const STATIC_CATEGORY_IMAGES = new Set([
  'd0jpg1hxt0j0w7ztp9yg.webp',
  'cmjsngro5dt0aacjbosv.webp',
  'nnizlfa2mkuxrbtaeirh.webp',
  'n9sxmnv7lwpgbgqgrk14.webp',
  'kr6s8t1dgak7bf7mjr2f.webp',
  'bviwcngbairjft6bctsx.webp',
  'opvgocxg17usmsg9b5ui.webp',
  'clty2rklj5lz3zs5ev67.webp',
  'gzbm8wpsu6mzdtmll4tx.webp'
]);

export function getCategoryImageUrl(url: string | undefined): string {
  if (!url) return '/images/placeholder.png';
  const filename = url.split('/').pop()?.split('?')[0];
  if (filename && STATIC_CATEGORY_IMAGES.has(filename)) {
    return `/images/categories/${filename}`;
  }
  return url;
}

/**
 * Known present product images stored statically inside the app (client/public/images/products).
 * Any newly uploaded or re-uploaded products will fall back to their Cloudinary URL.
 */
const STATIC_PRODUCT_IMAGES = new Set([
  "ljb7xiytpe86eidk1fno.webp",
  "picp2eck0s75nx5sxp6s.jpg",
  "ug3qviopg8dmgbmumocl.jpg",
  "xhv2j758jfa0vucise9q.webp",
  "gewltbwmjeclsqh29wve.jpg",
  "zjzfd98diy1qbcybnala.jpg",
  "bcssd8rr1umxvgrfvxr5.jpg",
  "yhodzm1ms29sdkuc1oms.jpg",
  "l6tdqoooabgoqqw45tom.jpg",
  "h6ibk47xmwfqvqlhawpd.jpg",
  "ki6devepfx2bqz1eqwtw.jpg",
  "ip4aklx4zbm5qzjvla81.jpg",
  "mijyfgqjmsmj8dmwpfaz.webp",
  "fa4rcb9vx5pfdrxtskwe.webp",
  "ievvbzqf8n8xayyoptzb.webp",
  "eqhs61wpakopfnqd2bpu.webp",
  "m7tpnogsmpbhdjv2gexs.webp",
  "q6egewdrctvqz9iznnwx.webp",
  "cbsx2pyczejvmlsoj0q9.webp",
  "e13crg2g9lmdkktbpvzs.webp",
  "gzwreonzotig0i4cjton.webp",
  "ygreqnufmnrkgkexhxnd.webp",
  "uxrk04r4it2d6dbbz2wb.webp",
  "trw3nxvdcjfu1keaxxpr.webp",
  "bkwke4dato2wqdavq4sx.webp",
  "r9egkkokeelf1c8cl2m4.webp",
  "vambp4e41uosnnk3lnxr.webp",
  "empgd8an1dcozdluqzhe.webp",
  "egqtymecwoqiucisemos.webp",
  "jjw80wzs4fz7xesz2deu.webp",
  "yzveoppo99ijqbajrkej.webp",
  "ztcckomycreuxqsidcmc.webp",
  "zaoiumlvlfjuxpfm3qou.webp",
  "n2tse8nyl2efejznawdp.webp",
  "butmo3wz8b3onzrcy5nf.webp",
  "bmrybnluiayrtnzsf5ke.webp",
  "e2xipzegdpk5vfejfupp.webp",
  "oy2bkye6gk0s04iy694b.webp",
  "gc3tzdyitr0jszvwzak6.webp",
  "b1ckeo431ddgzcpxlnjm.webp",
  "jfcadaij4hbgzqoutqoq.webp",
  "u3x39kkqc1yks0zymgtv.webp",
  "y2uqb4jho6imwpz7vccu.webp",
  "fkvmyw1jry5s3cmuuzpf.webp",
  "qfizhu92lzn6vvzpcy3z.webp",
  "ysxatdqohgbtb2lwjp1s.webp",
  "ikj1a7q2j9niazngbj0q.webp",
  "cnwk309yz9qwch8jcdab.webp",
  "wailfptcwdpdtd8tj8fw.webp",
  "ew7oszycvy4uvjffyeyh.webp",
  "qvof3fpi846ytsp9xqpz.webp",
  "pgg0pycuowqqwawp9ikt.webp",
  "ry92sg7myatqwvjlueos.webp",
  "ozab6qisiak8bz08eott.webp",
  "xmfigd5e4utkjmyl2ws6.webp",
  "wuwcsgqxtgioxf92fzsc.webp",
  "c88mlz1coccljygqyjd1.webp",
  "h61tzqp7ynxrx04ngja6.webp",
  "wgjcha07x9hbltgnmrjd.webp",
  "ifrtck1ezzt0f9y4syjv.webp",
  "sbilykahetvk7c9wos36.webp",
  "hmyngoq2uzb4llogvcbn.webp",
  "kjjhpzbkiakyb6svydly.webp",
  "duedwkbur9wmbilgfkkd.webp",
  "sbec0s0yfxbjun7xfr2u.webp",
  "l2dctxexynd9shzyj1an.webp",
  "tdqp8xokwslgjimdjgew.webp"
]);

export function getProductImageUrl(url: string | undefined): string {
  if (!url) return '/images/placeholder.png';
  const filename = url.split('/').pop()?.split('?')[0];
  if (filename && STATIC_PRODUCT_IMAGES.has(filename)) {
    return `/images/products/${filename}`;
  }
  return url;
}
