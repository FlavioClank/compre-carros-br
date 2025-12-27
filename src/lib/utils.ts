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
 * Generate car URL with SEO-friendly slug
 */
export function generateCarUrl(car: { id: string; model: string; version?: string | null; brand_name?: string; brands?: { name: string } | null }): string {
  const brandName = car.brand_name || car.brands?.name || "";
  const slug = generateCarSlug(brandName, car.model, car.version);
  return `/veiculo/${slug}-${car.id.slice(0, 8)}`;
}
