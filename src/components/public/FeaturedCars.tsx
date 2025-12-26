import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CarCardSingle } from "@/components/public/CarCardSingle";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Fetch featured cars first, then regular cars
        const { data, error } = await supabase
          .from("cars")
          .select(`
            id, code, model, year, version, mileage, transmission, fuel, color, price, photos, status, is_featured,
            brands(name, logo_url)
          `)
          .eq("status", "available")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        setCars(data || []);

        // Get total count
        const { count } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true })
          .eq("status", "available");

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
    <section className="py-16 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Veículos em Destaque</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Encontre seu próximo carro
            </h2>
            <p className="text-muted-foreground mt-2">
              Seleção de veículos verificados com os melhores preços do mercado
            </p>
          </div>
          <Link to="/carros">
            <Button variant="outline" className="gap-2">
              Ver todos ({totalCars})
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Cars List - Single Column */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))
          ) : cars.length > 0 ? (
            cars.map((car) => (
              <CarCardSingle key={car.id} car={car} />
            ))
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground text-lg">
                Nenhum veículo disponível no momento
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Volte em breve para ver novas ofertas
              </p>
            </div>
          )}
        </div>

        {/* View All Button */}
        {cars.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/carros">
              <Button size="lg" className="btn-hero gap-2">
                Ver todos os {totalCars} veículos
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}