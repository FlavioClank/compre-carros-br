import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

// Dark logos that need forced inversion + premium metallic shadow for contrast
const DARK_LOGO_BRANDS = ["toyota", "nissan", "audi", "volkswagen"];

// Memoized brand card to prevent unnecessary re-renders during animation
const BrandCard = memo(function BrandCard({
  brand,
  index,
  onClickHandler,
}: {
  brand: Brand;
  index: number;
  onClickHandler: (e: React.MouseEvent) => void;
}) {
  const isDark = DARK_LOGO_BRANDS.includes(brand.name.toLowerCase());

  return (
    <Link
      to={`/carros?type=car&brandId=${brand.id}`}
      onClick={onClickHandler}
      className="flex-shrink-0 w-[6.5rem] h-[6.5rem] md:w-44 md:h-[8.5rem] rounded-xl border border-border bg-card flex flex-col items-center justify-center p-2.5 md:p-4 shadow-sm select-none carousel-slide-optimized"
      draggable={false}
    >
      {brand.logo_url ? (
        <div className="flex items-center justify-center max-w-[85%] max-h-11 md:max-h-14">
          <img
            src={brand.logo_url}
            alt={brand.name}
            width={96}
            height={58}
            loading="lazy"
            decoding="async"
            className={`max-w-full max-h-11 md:max-h-14 object-contain flex-shrink-0 ${
              isDark ? "brand-logo-premium-invert" : ""
            }`}
            draggable={false}
            onError={(e) => {
              // Hide broken image and show initials fallback
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <span 
            className="text-lg md:text-xl font-bold text-foreground"
            style={{ display: "none" }}
          >
            {brand.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      ) : (
        <span className="text-lg md:text-xl font-bold text-foreground text-center px-1">
          {brand.name.substring(0, 2).toUpperCase()}
        </span>
      )}
      <span className="text-[10px] md:text-sm font-medium text-muted-foreground mt-2 text-center leading-tight px-1 w-full truncate">
        {brand.name}
      </span>
    </Link>
  );
});

export function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isDraggingRef = useRef(false);
  const dragStartTime = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  // Memoize AutoScroll plugin instance to prevent recreation
  const autoScrollPlugin = useMemo(
    () =>
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false,
        playOnInit: true,
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: false,
      watchDrag: true,
      skipSnaps: true, // Reduces jitter during fast scrolling
    },
    [autoScrollPlugin]
  );

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from("brands")
          .select("id, name, logo_url")
          .eq("is_active", true)
          .eq("category", "car")
          .order("name");

        if (error) throw error;
        setBrands(data || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Track drag state using ref (no re-renders)
  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => {
      dragStartTime.current = Date.now();
      isDraggingRef.current = false;
    };

    const onPointerUp = () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If dragged for more than 150ms, consider it a drag
      if (Date.now() - dragStartTime.current > 150) {
        isDraggingRef.current = true;
        // Reset after a short delay
        timeoutRef.current = window.setTimeout(() => {
          isDraggingRef.current = false;
          timeoutRef.current = null;
        }, 100);
      }
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [emblaApi]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Memoize the display brands array
  const displayBrands = useMemo(
    () => [...brands, ...brands, ...brands],
    [brands]
  );

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container">
          <div className="text-center mb-8">
            <div className="h-6 w-48 bg-muted animate-pulse rounded-lg mx-auto" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-32 h-24 bg-card border border-border animate-pulse rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  return (
    <section className="py-3 md:py-6 bg-background overflow-hidden relative z-10">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-3 md:mb-4">
          <h2 className="font-display text-lg md:text-xl font-bold text-foreground">
            Navegue por <span className="text-gradient">Marca</span>
          </h2>
        </div>

        {/* Carousel Container - GPU-optimized */}
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing carousel-container-optimized"
          ref={emblaRef}
        >
          <div className="flex gap-3 md:gap-4 carousel-track-optimized">
            {displayBrands.map((brand, index) => (
              <BrandCard
                key={`${brand.id}-${index}`}
                brand={brand}
                index={index}
                onClickHandler={handleClick}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}