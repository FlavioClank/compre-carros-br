import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

export function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = 300;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

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

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

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
        <div className="relative group">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
          
          <div
            ref={containerRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-4 ${
              isPaused || isDragging ? "" : "brand-carousel"
            }`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsPaused(false);
              setIsDragging(false);
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            {duplicatedBrands.map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                to={`/carros?marca=${brand.id}`}
                className="flex-shrink-0 w-32 h-24 bg-card/80 rounded-2xl border border-border/50 flex flex-col items-center justify-center p-4 hover:border-primary/50 hover:bg-card transition-all duration-300 group/brand hover:shadow-lg hover:shadow-primary/5"
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                  }
                }}
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-w-full max-h-12 object-contain group-hover/brand:scale-110 transition-transform duration-300 brightness-0 invert opacity-70 group-hover/brand:opacity-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
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
                <span className="text-xs text-muted-foreground mt-2 opacity-0 group-hover/brand:opacity-100 transition-opacity">
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
