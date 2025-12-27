import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CarCardSingle } from "@/components/public/CarCardSingle";
import { AdCard } from "@/components/public/AdCard";
import { useAdsRotation } from "@/hooks/useAdsRotation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Car interface for component
interface Car {
  id: string;
  code: string;
  model: string;
  year: number;
  version: string | null;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  price: number;
  photos: string[] | null;
  status: string;
  is_featured: boolean;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

export function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCars, setTotalCars] = useState(0);
  const { ads, hasAds, getAdAtPosition } = useAdsRotation();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Fetch directly from cars table with brand join
        // RLS policy filters to only available cars from active garages
        const { data, error } = await supabase
          .from("cars")
          .select(`
            id,
            code,
            model,
            year,
            version,
            mileage,
            transmission,
            fuel,
            color,
            price,
            photos,
            is_featured,
            created_at,
            description,
            brands:brand_id (
              name,
              logo_url
            )
          `)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        
        // Transform data to match component expected format
        const transformedCars: Car[] = (data || []).map((car) => ({
          id: car.id,
          code: car.code,
          model: car.model,
          year: car.year,
          version: car.version,
          mileage: car.mileage,
          transmission: car.transmission,
          fuel: car.fuel,
          color: car.color,
          price: car.price,
          photos: car.photos,
          status: "available", // RLS only returns available cars
          is_featured: car.is_featured,
          brands: car.brands,
        }));
        
        setCars(transformedCars);

        // Count total available cars
        const { count } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true });

        setTotalCars(count || 0);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <section className="py-4 md:py-12 bg-background">
      <div className="container">
        {/* Header - Larger on mobile */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Destaques</span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Veículos <span className="text-gradient">disponíveis</span>
            </h2>
          </div>
          <Link to="/carros">
            <Button variant="outline" size="sm" className="gap-1 text-xs md:text-sm">
              Ver todos ({totalCars})
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </Link>
        </div>

        {/* Cards - Proper spacing */}
        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 md:h-40 w-full rounded-xl bg-card" />
            ))
          ) : cars.length > 0 ? (
            (() => {
              const items: React.ReactNode[] = [];
              let adIndex = 0;
              
              cars.forEach((car, index) => {
                items.push(<CarCardSingle key={car.id} car={car} />);
                
                // Insert ad after every 10 cars
                if (hasAds && (index + 1) % 10 === 0) {
                  const ad = getAdAtPosition(adIndex);
                  if (ad) {
                    items.push(<AdCard key={`ad-${ad.id}-${adIndex}`} ad={ad} />);
                    adIndex++;
                  }
                }
              });
              
              return items;
            })()
          ) : (
            <div className="text-center py-10 bg-card/50 rounded-xl border border-border/50">
              <p className="text-muted-foreground text-sm">Nenhum veículo disponível</p>
              <p className="text-xs text-muted-foreground mt-1">Volte em breve</p>
            </div>
          )}
        </div>

        {cars.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/carros">
              <Button size="sm" className="btn-hero gap-1.5">
                Ver todos os {totalCars} veículos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}