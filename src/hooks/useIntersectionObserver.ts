import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Efficient IntersectionObserver hook that avoids re-renders on scroll
 * Uses a single observer instance per threshold/rootMargin combination
 */
export function useIntersectionObserver({
  threshold = 0,
  rootMargin = "200px",
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const setRef = useCallback((element: HTMLElement | null) => {
    // Disconnect previous observer
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = element;

    if (!element) return;

    // Don't observe if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggeredRef.current) {
      setIsIntersecting(true);
      return;
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          hasTriggeredRef.current = true;

          if (triggerOnce && observerRef.current && element) {
            observerRef.current.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);
  }, [threshold, rootMargin, triggerOnce]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { ref: setRef, isIntersecting };
}
