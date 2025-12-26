import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
      <section className="py-8 bg-muted/50">
        <div className="container">
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-16 bg-muted animate-pulse rounded-xl" />
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
    <section className="py-8 bg-muted/50 overflow-hidden">
      <div className="container mb-4">
        <h2 className="text-center font-display text-lg font-semibold text-foreground">
          Navegue por Marca
        </h2>
      </div>
      
      <div
        ref={containerRef}
        className={`flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing ${
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
        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
      >
        {duplicatedBrands.map((brand, index) => (
          <Link
            key={`${brand.id}-${index}`}
            to={`/carros?marca=${brand.id}`}
            className="flex-shrink-0 w-28 h-20 bg-background rounded-xl border border-border shadow-sm flex items-center justify-center p-3 hover:border-accent hover:shadow-md transition-all duration-300 group"
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
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const span = document.createElement("span");
                    span.className = "text-xs font-semibold text-foreground text-center";
                    span.textContent = brand.name;
                    parent.appendChild(span);
                  }
                }}
              />
            ) : (
              <span className="text-xs font-semibold text-foreground text-center">
                {brand.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}