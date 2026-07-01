/**
 * Scroll restoration helper for the Cars/Search list.
 *
 * Why this exists:
 * - The PartnerCard (anúncios) rotates every 5 minutes — when the user clicks
 *   an ad, opens the detail page and presses BACK, the same ad may now be in
 *   a different slot (or replaced by another). The browser's default scroll
 *   restoration would land them next to the wrong card.
 * - We solve this by snapshotting the *absolute Y position* of the clicked
 *   ad card at click time. When the user comes back, we restore exactly that
 *   pixel offset, so they end up next to the same group of vehicles they were
 *   browsing — regardless of which ad now occupies that slot.
 *
 * Storage is keyed by the listing URL (pathname + search) so different
 * filter combinations / pages don't overwrite each other.
 */

const STORAGE_KEY = "ccb_list_scroll_v1";

interface ScrollSnapshot {
  url: string;
  y: number;
  savedAt: number;
}

function readAll(): Record<string, ScrollSnapshot> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ScrollSnapshot>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, ScrollSnapshot>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // sessionStorage may be unavailable (private mode quirks) — ignore
  }
}

export function getCurrentListUrl(): string {
  return window.location.pathname + window.location.search;
}

/**
 * Save the absolute Y position of `element` for the current listing URL.
 * Call this on click, BEFORE navigation happens.
 */
export function saveListScrollFromElement(element: HTMLElement | null) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const y = rect.top + window.scrollY;
  const map = readAll();
  map[getCurrentListUrl()] = {
    url: getCurrentListUrl(),
    y: Math.max(0, y - 80), // leave a small offset above the card so it's clearly visible
    savedAt: Date.now(),
  };
  writeAll(map);
}

/**
 * Read (and consume) the saved scroll position for `url`.
 * Returns null when there is nothing to restore or the snapshot is too old.
 */
export function consumeListScroll(url: string, maxAgeMs = 30 * 60 * 1000): number | null {
  const map = readAll();
  const snap = map[url];
  if (!snap) return null;
  if (Date.now() - snap.savedAt > maxAgeMs) {
    delete map[url];
    writeAll(map);
    return null;
  }
  delete map[url];
  writeAll(map);
  return snap.y;
}

/**
 * Scroll to `y` and keep re-asserting it for ~1.2s.
 *
 * Why: on POP navigation back to a listing, images and lazy content still
 * load AFTER our first `scrollTo` call — each image that decodes pushes the
 * layout down (or up) and moves us away from the target. Retrying for a
 * short window locks the user at the exact pixel we wanted, and we stop
 * as soon as the user themselves scrolls (any wheel/touch input).
 */
export function restoreScrollTo(y: number, durationMs = 1200) {
  if (typeof window === "undefined") return;
  const target = Math.max(0, y);
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  window.addEventListener("wheel", cancel, { passive: true, once: true });
  window.addEventListener("touchstart", cancel, { passive: true, once: true });
  window.addEventListener("keydown", cancel, { once: true });

  const start = performance.now();
  const tick = () => {
    if (cancelled) return;
    window.scrollTo({ top: target, behavior: "auto" });
    if (performance.now() - start < durationMs) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(tick));
}
