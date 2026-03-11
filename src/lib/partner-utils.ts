/**
 * Utility functions for partner content
 */
import { SITE_URL } from "@/lib/seo";

interface ItemWithSlug {
  id: string;
  slug?: string | null;
}

export function getPartnerPublicUrl(item: ItemWithSlug): string {
  if (item.slug && item.slug.trim() !== "") {
    return `${SITE_URL}/anuncio/${item.slug}`;
  }
  console.warn(`[getPartnerPublicUrl] Item "${item.id}" is missing slug - using UUID as fallback.`);
  return `${SITE_URL}/anuncio/${item.id}`;
}
