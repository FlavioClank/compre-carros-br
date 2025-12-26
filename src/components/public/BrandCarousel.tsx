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
    <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="container relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Navegue por <span className="text-gradient">Marca</span>
          </h2>
          <p className="text-muted-foreground">Encontre veículos das melhores marcas do mercado</p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Embla Carousel */}
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-4">
              {displayBrands.map((brand, index) => (
                <Link
                  key={`${brand.id}-${index}`}
                  to={`/carros?marca=${brand.id}`}
                  onClick={(e) => handleClick(e, brand.id)}
                  className="flex-shrink-0 w-28 md:w-32 h-20 md:h-24 bg-card/80 rounded-2xl border border-border/50 flex flex-col items-center justify-center p-3 md:p-4 hover:border-primary/50 hover:bg-card transition-all duration-300 group/brand hover:shadow-lg hover:shadow-primary/5 select-none"
                  draggable={false}
                >
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="max-w-full max-h-10 md:max-h-12 object-contain group-hover/brand:scale-110 transition-transform duration-300 brightness-0 invert opacity-70 group-hover/brand:opacity-100"
                      draggable={false}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector("span")) {
                          const span = document.createElement("span");
                          span.className = "text-sm font-semibold text-foreground text-center";
                          span.textContent = brand.name;
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-foreground text-center">
                      {brand.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground mt-1.5 opacity-0 group-hover/brand:opacity-100 transition-opacity truncate max-w-full">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
