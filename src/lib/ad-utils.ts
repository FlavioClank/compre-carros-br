/**
 * Utility functions for ads
 */

interface AdWithSlug {
  id: string;
  slug?: string | null;
}

/**
 * Returns the public URL for an ad, always preferring slug over UUID.
 * Uses the current window.location.origin for dynamic domain support.
 * 
 * IMPORTANT: This function should ALWAYS return a slug-based URL.
 * The UUID fallback is only for extreme edge cases (ads without slug).
 * 
 * @param ad - The ad object containing id and optional slug
 * @returns The full public URL for the ad
 */
export function getAdPublicUrl(ad: AdWithSlug): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  
  // Always prefer slug - it MUST be used if available
  if (ad.slug && ad.slug.trim() !== "") {
    return `${origin}/anuncio/${ad.slug}`;
  }
  
  // Fallback to UUID only if slug is truly missing (should be rare/temporary)
  console.warn(`[getAdPublicUrl] Ad "${ad.id}" is missing slug - using UUID as fallback. Please add a slug in admin.`);
  return `${origin}/anuncio/${ad.id}`;
}
