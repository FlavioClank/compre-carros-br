import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackSiteVisit } from "@/lib/analytics";

/**
 * Hook to track site visits on route changes.
 * Only tracks public routes (not /admin/* or /garage/*).
 * Deduplicates by storing last tracked path.
 */
export function useSiteTracking() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const pathname = location.pathname;
    
    // Skip admin and garage routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/garage") || pathname === "/login") {
      return;
    }
    
    // Deduplicate - don't track same path twice in a row
    if (lastTrackedPath.current === pathname) {
      return;
    }
    
    lastTrackedPath.current = pathname;
    
    trackSiteVisit({
      page: pathname,
      search: location.search || undefined,
    });
  }, [location.pathname, location.search]);
}
