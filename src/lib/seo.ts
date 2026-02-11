/**
 * SEO constants and helpers for CompreCarrosBr
 * All public-facing URLs must use the official .com.br domain.
 */

export const SITE_URL = "https://comprecarrosbr.com.br";

/**
 * Build an absolute canonical URL using the official domain.
 * @param path - Route path starting with "/" (e.g. "/carro/fiat-palio-2020")
 */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Build an absolute OG image URL.
 * If the image is already an absolute URL (e.g. Supabase storage), return as-is.
 * Otherwise, prefix with SITE_URL.
 */
export function absoluteImageUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}
