import React, { useState, useCallback, memo, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

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
const SUPABASE_STORAGE_REGEX = /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

/**
 * Generates optimized image URL using Supabase Image Transformation
 * Converts to WebP and applies quality/resize
 */
function getOptimizedUrl(
  src: string,
  options: { width?: number; height?: number; quality?: number }
): string {
  if (!src || src === "/placeholder.svg") return src;

  // Only transform Supabase storage URLs
  if (!SUPABASE_STORAGE_REGEX.test(src)) return src;

  const { width, height, quality = 75 } = options;

  // Build transformation params
  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`quality=${quality}`);
  params.push("format=webp");

  // Insert /render/image/ after /storage/v1/object/
  // From: .../storage/v1/object/public/bucket/file.jpg
  // To: .../storage/v1/render/image/public/bucket/file.jpg?...
  const transformed = src.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  return `${transformed}?${params.join("&")}`;
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
export const OptimizedImage = memo(function OptimizedImage({
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
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Use lazy loading unless eager is true
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: "200px",
    triggerOnce: true,
  });

  const shouldLoad = eager || isIntersecting;

  // Memoize the optimized URL
  const optimizedSrc = useMemo(() => {
    if (hasError) return fallback;
    return getOptimizedUrl(src, { width, height, quality });
  }, [src, width, height, quality, hasError, fallback]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true);
      setIsLoaded(true);
      onError?.(e);
    },
    [onError]
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

  return (
    <div
      ref={ref as React.RefCallback<HTMLDivElement>}
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
