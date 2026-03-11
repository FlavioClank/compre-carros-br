/**
 * Utility functions for ads
 */
import { SITE_URL } from "@/lib/seo";

interface AdWithSlug {
  id: string;
  slug?: string | null;
}

/**
 * Returns the public URL for an ad, always preferring slug over UUID.
 * Uses the official SITE_URL for consistent SEO and social sharing.
 *
 * @param ad - The ad object containing id and optional slug
 * @returns The full public URL for the ad
 */
export function getAdPublicUrl(ad: AdWithSlug): string {
  // Always prefer slug - it MUST be used if available
  if (ad.slug && ad.slug.trim() !== "") {
    return `${SITE_URL}/anuncio/${ad.slug}`;
  }

  // Fallback to UUID only if slug is truly missing (should be rare/temporary)
  console.warn(`[getAdPublicUrl] Ad "${ad.id}" is missing slug - using UUID as fallback. Please add a slug in admin.`);
  return `${SITE_URL}/anuncio/${ad.id}`;
}
