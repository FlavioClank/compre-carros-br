import React, { useEffect, useState, useCallback, memo, useMemo, forwardRef } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

/**
 * IMAGE TRANSFORMATION CONFIGURATION
 * 
 * Set to `true` when you have Supabase Pro plan with Image Transformation enabled.
 * This enables automatic WebP conversion, resizing, and quality optimization.
 * 
 * To enable:
 * 1. Upgrade to Supabase Pro ($25/month)
 * 2. Enable Image Transformation in Supabase Dashboard
 * 3. Set IMAGE_TRANSFORMATION_ENABLED = true below
 */
const IMAGE_TRANSFORMATION_ENABLED = false;

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  eager?: boolean;
  fallback?: string;
  aspectRatio?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
}

// Supabase Storage URL pattern
const SUPABASE_STORAGE_REGEX =
  /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

// Global in-memory cache: prevents re-showing skeleton/fade for images already loaded in this session
// This persists across component remounts and scroll events
const imageLoadCache = new Map<string, boolean>();

// Track failed transformations to auto-fallback
const transformationFailedCache = new Set<string>();

/**
 * Checks if a URL is valid for image loading
 */
function isValidSrc(src: string | null | undefined): src is string {
  if (!src || typeof src !== "string") return false;
  if (src.trim() === "") return false;
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/");
}

/**
 * Generates optimized image URL using Supabase Image Transformation
 * Automatically falls back to original URL if transformation is disabled or fails
 */
function getOptimizedUrl(
  src: string,
  options: { width?: number; height?: number; quality?: number }
): string {
  // Return as-is if not a valid URL or placeholder
  if (!isValidSrc(src) || src === "/placeholder.svg") return src;

  // Skip transformation if disabled or not a Supabase storage URL
  if (!IMAGE_TRANSFORMATION_ENABLED) return src;
  if (!SUPABASE_STORAGE_REGEX.test(src)) return src;

  // Skip if this URL previously failed transformation
  if (transformationFailedCache.has(src)) return src;

  // Check if this is already a render/image URL (avoid double transformation)
  if (src.includes("/storage/v1/render/image/")) return src;

  const { width, height, quality = 75 } = options;

  // Build transformation params
  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`quality=${quality}`);
  params.push("format=webp");

  const transformed = src.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  return `${transformed}?${params.join("&")}`;
}

/**
 * Mark a URL as having failed transformation (for auto-fallback)
 */
function markTransformationFailed(originalSrc: string): void {
  if (IMAGE_TRANSFORMATION_ENABLED && SUPABASE_STORAGE_REGEX.test(originalSrc)) {
    transformationFailedCache.add(originalSrc);
  }
}

/**
 * OptimizedImage - Performance-optimized image component
 *
 * Features:
 * - Lazy loading with IntersectionObserver (200px rootMargin)
 * - WebP conversion via Supabase Image Transformation
 * - Quality reduction (default 75%)
 * - Skeleton placeholder during load
 * - Fallback for broken images
 * - No re-renders on scroll
 */
const OptimizedImageInner = forwardRef<HTMLDivElement, OptimizedImageProps>(function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  eager = false,
  fallback = "/placeholder.svg",
  aspectRatio,
  className,
  containerClassName,
  showSkeleton = true,
  onError,
  ...props
}, forwardedRef) {
  // Validate src early - use fallback if invalid
  const safeSrc = isValidSrc(src) ? src : fallback;
  const cacheKey = `${safeSrc}|w:${width ?? ""}|h:${height ?? ""}|q:${quality}`;

  // Check cache on initial render - if cached, skip skeleton entirely
  const [isLoaded, setIsLoaded] = useState(() => imageLoadCache.get(cacheKey) === true);
  const [hasError, setHasError] = useState(false);

  // Use lazy loading unless eager is true
  // When eager, skip intersection observer entirely
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
    triggerOnce: true,
  });

  // Always load if eager, otherwise wait for intersection
  const shouldLoad = eager ? true : isIntersecting;

  // Memoize the optimized URL
  const optimizedSrc = useMemo(() => {
    if (hasError) return fallback;
    return getOptimizedUrl(safeSrc, { width, height, quality });
  }, [safeSrc, width, height, quality, hasError, fallback]);

  // If the same image is re-mounted later in the session, keep it as loaded
  useEffect(() => {
    if (imageLoadCache.get(cacheKey) === true) setIsLoaded(true);
  }, [cacheKey]);

  const handleLoad = useCallback(() => {
    imageLoadCache.set(cacheKey, true);
    setIsLoaded(true);
  }, [cacheKey]);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      // If transformation failed, mark it and retry with original URL
      if (IMAGE_TRANSFORMATION_ENABLED && !hasError) {
        markTransformationFailed(safeSrc);
        setHasError(true);
        // Don't mark as loaded yet - let it retry with original URL
        return;
      }
      setHasError(true);
      setIsLoaded(true);
      onError?.(e);
    },
    [onError, safeSrc, hasError]
  );

  // Container styles for aspect ratio
  const containerStyle = useMemo(() => {
    if (aspectRatio) {
      return { aspectRatio };
    }
    if (width && height) {
      return { aspectRatio: `${width}/${height}` };
    }
    return undefined;
  }, [aspectRatio, width, height]);

  // Combine forwarded ref with intersection observer ref
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    // Set the intersection observer ref if not eager
    if (!eager) {
      (ref as React.RefCallback<HTMLDivElement>)(node);
    }
    // Forward ref
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  }, [eager, ref, forwardedRef]);

  return (
    <div
      ref={combinedRef}
      className={cn("relative overflow-hidden", containerClassName)}
      style={containerStyle}
    >
      {/* Skeleton placeholder */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Image - only render src when in viewport */}
      {shouldLoad && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
});

export const OptimizedImage = memo(OptimizedImageInner);

/**
 * Get srcset for responsive images
 */
export function getResponsiveSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280],
  quality: number = 75
): string {
  if (!SUPABASE_STORAGE_REGEX.test(src)) return "";

  return widths
    .map((w) => `${getOptimizedUrl(src, { width: w, quality })} ${w}w`)
    .join(", ");
}

