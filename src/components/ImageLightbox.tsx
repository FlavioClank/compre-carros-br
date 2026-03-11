import { useEffect, useCallback, useRef, useState } from "react";
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
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const swipeOffsetRef = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // History API for back button
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ lightbox: true }, "");
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.lightbox) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  // Touch handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    swipeOffsetRef.current = 0;
    setSwipeOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
      e.preventDefault();
      swipeOffsetRef.current = deltaX;
      setSwipeOffset(deltaX);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const SWIPE_THRESHOLD = 50;
    
    if (isSwiping.current && Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset < 0) {
        onNext();
      } else {
        onPrev();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
    setSwipeOffset(0);
  }, [swipeOffset, onNext, onPrev]);

  // Only close on backdrop click if not swiping
  const handleBackdropClick = useCallback(() => {
    if (!isSwiping.current) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

      {/* Main Image with swipe offset */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center transition-transform"
        style={{
          transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
          transition: swipeOffset ? 'none' : 'transform 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain select-none pointer-events-none"
          draggable={false}
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
