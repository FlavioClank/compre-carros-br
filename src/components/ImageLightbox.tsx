import { useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  alt?: string;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
  alt = "Imagem ampliada",
}: ImageLightboxProps) {
  // ── Refs for touch tracking (no React state to avoid stale closures) ──
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const tracking = useRef(false);   // true once we decide it's a horizontal swipe
  const decided = useRef(false);    // true once we've committed to swipe OR scroll
  const imageRef = useRef<HTMLDivElement>(null);
  const didSwipe = useRef(false);   // prevents backdrop click after swipe

  // ── Stable callback refs (avoids useCallback dep issues) ──
  const onCloseRef = useRef(onClose);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onPrevRef.current = onPrev; }, [onPrev]);
  useEffect(() => { onNextRef.current = onNext; }, [onNext]);

  // ── Keyboard navigation ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": onCloseRef.current(); break;
        case "ArrowLeft": onPrevRef.current(); break;
        case "ArrowRight": onNextRef.current(); break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // ── Lock body scroll ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── History API: back button closes lightbox ──
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ lightbox: true }, "");
    const handler = () => onCloseRef.current();
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      if (window.history.state?.lightbox) {
        window.history.back();
      }
    };
  }, [isOpen]);

  // ── Touch handlers (attached via native addEventListener for {passive: false}) ──
  useEffect(() => {
    if (!isOpen) return;
    const el = imageRef.current;
    if (!el) return;

    const SWIPE_THRESHOLD = 40;

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      currentX.current = 0;
      tracking.current = false;
      decided.current = false;
      didSwipe.current = false;
      el.style.transition = "none";
      el.style.transform = "translateX(0px)";
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      // First significant movement decides: horizontal swipe or vertical scroll
      if (!decided.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        decided.current = true;
        tracking.current = Math.abs(dx) > Math.abs(dy);
      }

      if (tracking.current) {
        e.preventDefault(); // prevent scroll while swiping
        currentX.current = dx;
        el.style.transform = `translateX(${dx}px)`;
      }
    };

    const onTouchEnd = () => {
      if (tracking.current) {
        didSwipe.current = true;
        const dx = currentX.current;

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          // Animate out then navigate
          const direction = dx < 0 ? -1 : 1;
          el.style.transition = "transform 0.15s ease-out";
          el.style.transform = `translateX(${direction * -300}px)`;

          setTimeout(() => {
            if (dx < 0) {
              onNextRef.current();
            } else {
              onPrevRef.current();
            }
            // Reset position instantly (new image will render)
            el.style.transition = "none";
            el.style.transform = "translateX(0px)";
          }, 150);
        } else {
          // Snap back
          el.style.transition = "transform 0.2s ease-out";
          el.style.transform = "translateX(0px)";
        }
      }

      tracking.current = false;
      decided.current = false;
      currentX.current = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isOpen]);

  // ── Backdrop click (only if no swipe occurred) ──
  const handleBackdropClick = useCallback(() => {
    // Small delay to let didSwipe settle from touchEnd
    requestAnimationFrame(() => {
      if (!didSwipe.current) {
        onCloseRef.current();
      }
      didSwipe.current = false;
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 text-white hover:bg-white/20 z-10 h-12 w-12 md:h-10 md:w-10"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Fechar"
      >
        <X className="h-8 w-8 md:h-6 md:w-6" />
      </Button>

      {/* Navigation - Previous */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Foto anterior"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* Image container — touch target */}
      <div
        ref={imageRef}
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain select-none"
          draggable={false}
          style={{ pointerEvents: "none" }}
        />
      </div>

      {/* Navigation - Next */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Próxima foto"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
