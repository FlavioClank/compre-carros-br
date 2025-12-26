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
          {/* Embla Carousel */}
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-4 px-4">
              {displayBrands.map((brand, index) => (
                <Link
                  key={`${brand.id}-${index}`}
                  to={`/carros?marca=${brand.id}`}
                  onClick={(e) => handleClick(e, brand.id)}
                  className="flex-shrink-0 w-28 md:w-36 h-24 md:h-28 rounded-2xl border border-gray-200/80 flex flex-col items-center justify-center p-4 shadow-sm hover:shadow-md hover:border-primary/60 hover:-translate-y-0.5 transition-all duration-300 group/brand select-none"
                  style={{ backgroundColor: '#F5F7FA' }}
                  draggable={false}
                >
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="max-w-full max-h-12 md:max-h-14 object-contain group-hover/brand:scale-105 transition-transform duration-300"
                      draggable={false}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector("span.brand-fallback")) {
                          const span = document.createElement("span");
                          span.className = "brand-fallback text-sm font-bold text-gray-800 text-center";
                          span.textContent = brand.name;
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-800 text-center">
                      {brand.name}
                    </span>
                  )}
                  <span className="text-xs font-medium text-gray-500 mt-2 truncate max-w-full group-hover/brand:text-gray-700 transition-colors">
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
