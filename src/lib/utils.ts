import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate SEO-friendly slug from car data
 * Example: "Fiat Palio 2020" -> "fiat-palio-2020"
 */
export function generateCarSlug(brandName: string, model: string, version?: string | null): string {
  const parts = [brandName, model];
  if (version) {
    parts.push(version);
  }
  
  return parts
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Trim hyphens from start/end
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
