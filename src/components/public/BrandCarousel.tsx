import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

export function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching brands:", error);
      } else {
        setBrands(data || []);
      }
      setIsLoading(false);
    };

    fetchBrands();
  }, []);

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="flex gap-8 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-24 h-16 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brands.length === 0) return null;

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="py-12 bg-card border-y border-border overflow-hidden">
      <div className="container mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground">
          Marcas Oficiais
        </h2>
        <p className="text-muted-foreground text-center mt-2">
          Encontre veículos das melhores marcas do mercado
        </p>
      </div>

      <div
        ref={scrollRef}
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex gap-8 items-center ${
            isPaused ? "" : "brand-carousel"
          }`}
          style={{
            width: `${duplicatedBrands.length * 160}px`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <Link
              key={`${brand.id}-${index}`}
              to={`/carros?marca=${brand.name}`}
              className="flex-shrink-0 w-36 h-20 bg-background rounded-xl border border-border p-4 flex items-center justify-center hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
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
                      parent.innerHTML = `<span class="font-display font-bold text-muted-foreground text-sm">${brand.name}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="font-display font-bold text-muted-foreground text-sm text-center">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
