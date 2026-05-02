import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to top on PUSH/REPLACE navigations (clicking links forward).
 *
 * On POP navigations (browser back/forward) we DO NOT scroll to top, so:
 *  - browsers can restore the previous scroll position naturally
 *  - the Cars/Search page can run its own scroll restoration logic
 *    (see src/lib/scroll-restoration.ts) to land back on the exact ad slot
 *    the user clicked, even though ads rotate every 5 minutes.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, navType]);

  return null;
}
