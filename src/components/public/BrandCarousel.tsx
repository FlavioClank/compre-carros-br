import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

export function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      containScroll: false,
      watchDrag: true,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false,
      }),
    ]
  );

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from("brands")
          .select("id, name, logo_url")
          .eq("is_active", true)
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

  // Track drag state to prevent click on drag
  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => {
      dragStartTime.current = Date.now();
      setIsDragging(false);
    };

    const onPointerUp = () => {
      // If dragged for more than 150ms, consider it a drag
      if (Date.now() - dragStartTime.current > 150) {
        setIsDragging(true);
        // Reset after a short delay
        setTimeout(() => setIsDragging(false), 100);
      }
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  const handleClick = useCallback(
    (e: React.MouseEvent, brandId: string) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isDragging]
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
              <div key={i} className="flex-shrink-0 w-32 h-24 bg-card border border-border animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  // Duplicate brands multiple times for seamless infinite loop
  const displayBrands = [...brands, ...brands, ...brands];

  return (
    <section className="py-4 md:py-8 bg-background overflow-hidden">
      <div className="container">
        {/* Header - Compact */}
        <div className="text-center mb-3 md:mb-5">
          <h2 className="font-display text-lg md:text-2xl font-bold text-foreground mb-1">
            Navegue por <span className="text-gradient">Marca</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">Encontre veículos das melhores marcas</p>
        </div>

        {/* Carousel Container - Clean, no overlays */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-2 md:gap-4">
            {displayBrands.map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                to={`/carros?marca=${brand.id}`}
                onClick={(e) => handleClick(e, brand.id)}
                className="flex-shrink-0 w-20 h-20 md:w-36 md:h-28 rounded-xl border border-border bg-card flex flex-col items-center justify-center p-2 md:p-3 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200 select-none"
                draggable={false}
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-w-full max-h-8 md:max-h-12 object-contain flex-shrink-0"
                    draggable={false}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector("span.brand-fallback")) {
                        const span = document.createElement("span");
                        span.className = "brand-fallback text-xs md:text-sm font-bold text-foreground text-center";
                        span.textContent = brand.name;
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs md:text-sm font-bold text-foreground text-center">
                    {brand.name}
                  </span>
                )}
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground mt-1.5 text-center leading-tight px-1 w-full overflow-visible whitespace-nowrap">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
