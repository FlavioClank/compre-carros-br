import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PublicLayout } from "@/components/layout/PublicLayout";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

const INVERT_LOGO_BRANDS = ["toyota", "nissan", "audi", "volkswagen"];

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .eq("category", "car")
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

  return (
    <PublicLayout>
      <section className="py-8 md:py-12 bg-muted/30 min-h-[60vh]">
        <div className="container">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Marcas Oficiais
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Trabalhamos com as principais marcas do mercado automotivo.
              Clique em uma marca para ver os veículos disponíveis.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-card rounded-2xl border border-border animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Brands Grid */}
          {!isLoading && brands.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map((brand, index) => (
                <Link
                  key={brand.id}
                  to={`/carros?type=car&brandId=${brand.id}`}
                  className="group bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center aspect-square hover:shadow-xl hover:border-accent/30 transition-all duration-300 animate-fade-in opacity-0"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="h-20 w-20 flex items-center justify-center mb-4">
                    {brand.logo_url ? (
                      <>
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className={`max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300 ${
                            INVERT_LOGO_BRANDS.includes(brand.name.toLowerCase()) ? "brand-logo-premium-invert" : ""
                          }`}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <span 
                          className="font-display font-bold text-muted-foreground text-2xl"
                          style={{ display: "none" }}
                        >
                          {brand.name.substring(0, 2).toUpperCase()}
                        </span>
                      </>
                    ) : (
                      <span className="font-display font-bold text-muted-foreground text-2xl">
                        {brand.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-center group-hover:text-accent transition-colors">
                    {brand.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && brands.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Nenhuma marca disponível
              </h3>
              <p className="text-muted-foreground">
                As marcas serão adicionadas em breve.
              </p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
