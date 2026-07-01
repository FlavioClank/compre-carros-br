import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to top on PUSH/REPLACE navigations (clicking links forward).
 *
 * On POP navigations (browser back/forward) we DO NOT scroll to top, so
 * the Home/Cars pages can run their own scroll restoration logic
 * (see src/lib/scroll-restoration.ts) to land back on the exact slot.
 *
 * We also force `history.scrollRestoration = 'manual'` so the browser's
 * native restoration does not fight our custom one (which was causing
 * the back button to land the user at the wrong Y on desktop).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (navType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, navType]);

  return null;
}
