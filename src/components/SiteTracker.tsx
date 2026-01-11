import { useSiteTracking } from "@/hooks/useSiteTracking";

/**
 * Component that tracks site visits on route changes.
 * Must be rendered inside BrowserRouter.
 */
export function SiteTracker() {
  useSiteTracking();
  return null;
}
