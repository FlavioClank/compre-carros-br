import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CarCard } from "./CarCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
  photos: string[];
  status: string;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

export function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
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
          status,
          brands (
            name,
            logo_url
          )
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching cars:", error);
      } else {
        setCars(data || []);
      }
      setIsLoading(false);
    };

    fetchCars();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Veículos em Destaque
            </h2>
            <p className="text-muted-foreground mt-2">
              Confira os últimos veículos adicionados à nossa vitrine
            </p>
          </div>
          <Link to="/carros">
            <Button variant="outline" className="gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl overflow-hidden border border-border"
              >
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cars Grid */}
        {!isLoading && cars.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && cars.length === 0 && (
          <div className="text-center py-16 bg-muted/50 rounded-2xl">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Nenhum veículo disponível
            </h3>
            <p className="text-muted-foreground">
              Novos veículos serão adicionados em breve!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
