import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Shield, Zap, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function HeroSection() {
  const navigate = useNavigate();
  const [totalCars, setTotalCars] = useState(0);

  useEffect(() => {
    const fetchTotalCars = async () => {
      // Use the secure public VIEW for counting
      const { count, error } = await supabase
        .from("public_active_cars")
        .select("*", { count: "exact", head: true });
      
      if (!error && count !== null) {
        setTotalCars(count);
      }
    };

    fetchTotalCars();

    // Subscribe to real-time updates on cars table
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
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center hero-gradient overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/15 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="container relative z-10 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Top Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-card/50 backdrop-blur-xl border border-border/50 rounded-full px-5 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="text-sm font-medium text-accent">ONLINE</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <span className="text-sm text-muted-foreground">Plataforma líder em veículos seminovos</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up leading-[1.1] tracking-tight">
              Sua vitrine de veículos
              <span className="block text-gradient mt-2">seminovos verificados</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up stagger-1 leading-relaxed">
              Anuncie e encontre veículos de garagens verificadas em um só lugar. Atendimento personalizado via WhatsApp em até 24 horas.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up stagger-2">
            <Button
              onClick={() => navigate("/carros")}
              size="lg"
              className="btn-hero text-lg h-14 px-8 gap-3 w-full sm:w-auto"
            >
              <Search className="h-5 w-5" />
              Ver {totalCars} veículos disponíveis
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/marcas")}
              variant="outline"
              size="lg"
              className="btn-hero-outline h-14 px-8 gap-2 w-full sm:w-auto"
            >
              <Car className="h-5 w-5" />
              Explorar marcas
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-fade-in stagger-3">
            <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm border border-border/30 rounded-full px-4 py-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm text-foreground/80">100% Verificados</span>
            </div>
            <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm border border-border/30 rounded-full px-4 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground/80">Resposta em 24h</span>
            </div>
            <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm border border-border/30 rounded-full px-4 py-2">
              <Car className="h-4 w-4 text-warning" />
              <span className="text-sm text-foreground/80">{totalCars}+ Veículos</span>
            </div>
          </div>

          {/* Stats Cards - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-in stagger-4">
            <div className="feature-card text-center group">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient mb-2">{totalCars}+</p>
              <p className="text-muted-foreground">Veículos Disponíveis</p>
            </div>
            <div className="feature-card text-center group">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient-accent mb-2">100%</p>
              <p className="text-muted-foreground">Veículos Verificados</p>
            </div>
            <div className="feature-card text-center group">
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient-gold mb-2">24h</p>
              <p className="text-muted-foreground">Tempo de Resposta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
