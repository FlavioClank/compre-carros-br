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
 * @param ad - The ad object containing id and optional slug
 * @returns The full public URL for the ad
 */
export function getAdPublicUrl(ad: AdWithSlug): string {
  // Always prefer slug if it exists and is not empty
  const identifier = ad.slug && ad.slug.trim() !== "" ? ad.slug : ad.id;
  return `${window.location.origin}/anuncio/${identifier}`;
}
