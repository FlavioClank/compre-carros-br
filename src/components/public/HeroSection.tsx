import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Car, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function HeroSection() {
  const navigate = useNavigate();
  const [totalCars, setTotalCars] = useState(0);

  useEffect(() => {
    const fetchTotalCars = async () => {
      const { count, error } = await supabase
        .from("cars")
        .select("*", { count: "exact", head: true });
      
      if (!error && count !== null) {
        setTotalCars(count);
      }
    };

    fetchTotalCars();

    const channel = supabase
      .channel("cars-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cars" },
        () => {
          fetchTotalCars();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container">
        <div className="flex flex-col gap-3">
          {/* Main action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/carros")}
              size="lg"
              className="h-11 px-6 gap-2 w-full sm:w-auto"
            >
              <Search className="h-5 w-5" />
              Ver {totalCars} veículos
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/marcas")}
              variant="secondary"
              size="lg"
              className="h-11 px-6 gap-2 w-full sm:w-auto"
            >
              Explorar marcas
            </Button>
          </div>

          {/* Category buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/carros?categoria=car")}
              size="lg"
              className="h-10 px-5 gap-2"
            >
              <Car className="h-4 w-4" />
              Carros
            </Button>
            <Button
              onClick={() => navigate("/carros?categoria=motorcycle")}
              size="lg"
              className="h-10 px-5 gap-2"
            >
              <Bike className="h-4 w-4" />
              Motos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}