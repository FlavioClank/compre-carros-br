/**
 * Image utilities for safe image handling across the app
 */

const PLACEHOLDER_IMAGE = "/placeholder.svg";

/**
 * Validates if a URL is a valid image URL
 */
export function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  if (!url || url.trim() === "") return false;
  
  // Must start with http, https, or be a relative path
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  );
}

/**
 * Gets the cover image from a car's photos array
 * Returns the first valid image URL or placeholder
 */
export function getCarCoverImage(photos: string[] | null | undefined): string {
  // Handle null, undefined, or non-array
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return PLACEHOLDER_IMAGE;
  }

  // Find the first valid image URL
  for (const photo of photos) {
    if (isValidImageUrl(photo)) {
      return photo;
    }
  }

  return PLACEHOLDER_IMAGE;
}

/**
 * Gets all valid images from a photos array
 */
export function getValidCarPhotos(photos: string[] | null | undefined): string[] {
  if (!photos || !Array.isArray(photos)) {
    return [];
  }

  return photos.filter(isValidImageUrl);
}

/**
 * Safely gets the placeholder image path
 */
export function getPlaceholderImage(): string {
  return PLACEHOLDER_IMAGE;
}
