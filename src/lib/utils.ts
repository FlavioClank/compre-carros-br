import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maximum allowed slug length (SEO + URL readability constraint).
 */
export const MAX_SLUG_LENGTH = 15;

/**
 * Portuguese stopwords / preposições to drop from slugs.
 */
const SLUG_STOPWORDS = new Set([
  "de", "da", "do", "das", "dos",
  "e", "em", "na", "no", "nas", "nos",
  "a", "o", "as", "os",
  "para", "pra", "por", "com", "sem",
  "the", "of", "and",
]);

/** Normalize raw text into a URL-safe base (lowercase, no accents, hyphenated). */
function baseNormalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Smart slug builder enforcing MAX_SLUG_LENGTH (≤15 chars).
 *
 * Estratégia:
 *   1. Normaliza → minúsculas, sem acentos, com hifens.
 *   2. Remove preposições e stopwords.
 *   3. Se ainda > 15, abrevia palavras (esq. → dir.) para a inicial.
 *      Ex.: "borracharia-radial" (18) → "b-radial" (8).
 *   4. Como último recurso, trunca em 15 chars sem terminar em "-".
 */
export function smartSlug(input: string, maxLength = MAX_SLUG_LENGTH): string {
  const base = baseNormalize(input);
  if (!base) return "";
  if (base.length <= maxLength) return base;

  let words = base.split("-").filter(Boolean);
  const meaningful = words.filter((w) => !SLUG_STOPWORDS.has(w));
  if (meaningful.length > 0) words = meaningful;

  if (words.join("-").length <= maxLength) return words.join("-");

  for (let i = 0; i < words.length - 1; i++) {
    words[i] = words[i].charAt(0);
    if (words.join("-").length <= maxLength) return words.join("-");
  }

  return words.join("-").slice(0, maxLength).replace(/-+$/, "");
}

/**
 * Generate SEO-friendly slug from car data (≤15 chars).
 * Example: "Fiat Palio 2020" -> "fiat-palio-2020".
 */
export function generateCarSlug(brandName: string, model: string, version?: string | null): string {
  const parts = [brandName, model];
  if (version) parts.push(version);
  return smartSlug(parts.join(" "));
}

/**
 * Generate car URL using slug for SEO-friendly URLs
 */
export function generateCarUrl(car: { id: string; slug?: string | null; model?: string; version?: string | null; brand_name?: string; brands?: { name: string } | null }): string {
  // Prefer slug if available, fallback to ID
  if (car.slug) {
    return `/carro/${car.slug}`;
  }
  return `/carro/${car.id}`;
}
