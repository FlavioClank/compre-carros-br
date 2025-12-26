import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function HeroSection() {
  const navigate = useNavigate();
  const [totalCars, setTotalCars] = useState(0);

  useEffect(() => {
    const fetchTotalCars = async () => {
      const { count, error } = await supabase
        .from("cars")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");
      
      if (!error && count !== null) {
        setTotalCars(count);
      }
    };

    fetchTotalCars();

    // Subscribe to real-time updates
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
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container relative z-10 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm text-white/80">Plataforma líder em veículos seminovos</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight">
            Seu próximo carro
            <span className="block text-gradient bg-gradient-to-r from-accent to-orange-400">está aqui</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto animate-slide-up stagger-1">
            Encontre os melhores veículos seminovos com total segurança e transparência. Atendimento personalizado via WhatsApp.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up stagger-2">
            <Button
              onClick={() => navigate("/carros")}
              size="lg"
              className="btn-hero text-lg h-14 px-8 gap-2"
            >
              <Search className="h-5 w-5" />
              Ver {totalCars} veículos disponíveis
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto animate-fade-in stagger-3">
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-white">{totalCars}+</p>
              <p className="text-sm text-white/60">Veículos</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="font-display text-3xl md:text-4xl font-bold text-white">100%</p>
              <p className="text-sm text-white/60">Verificados</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-white">24h</p>
              <p className="text-sm text-white/60">Resposta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
}