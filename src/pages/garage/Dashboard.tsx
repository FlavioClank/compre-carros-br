import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GarageLayout } from "@/components/layout/GarageLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Clock } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function GarageDashboard() {
  // Fetch garage stats
  const { data: stats } = useQuery({
    queryKey: ["garage-stats"],
    queryFn: async () => {
      const [carsRes, salesRes] = await Promise.all([
        supabase.from("cars").select("id, status"),
        supabase.from("sales_history").select("id, confirmed_at"),
      ]);

      const availableCars = carsRes.data?.filter(c => c.status === "available") || [];
      const soldCars = carsRes.data?.filter(c => c.status === "sold") || [];
      const pendingSales = salesRes.data?.filter(s => !s.confirmed_at) || [];

      return {
        activeCars: availableCars.length,
        soldCars: soldCars.length,
        pendingSales: pendingSales.length,
      };
    },
  });

  // Fetch recent cars
  const { data: recentCars } = useQuery({
    queryKey: ["garage-recent-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, brands(name)")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <GarageLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral dos seus veículos</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Veículos Ativos</CardTitle>
              <Package className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats?.activeCars || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vendidos</CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats?.soldCars || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Confirmação</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats?.pendingSales || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Meus Veículos Ativos</CardTitle>
            <Link to="/garage/cars">
              <Button variant="outline" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCars && recentCars.length > 0 ? (
              <div className="space-y-4">
                {recentCars.map((car: any) => (
                  <div key={car.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {car.photos?.[0] && (
                        <OptimizedImage
                          src={car.photos[0]}
                          alt={car.model}
                          width={64}
                          height={48}
                          quality={60}
                          className="h-12 w-16 object-cover rounded"
                          containerClassName="h-12 w-16 rounded"
                          showSkeleton={false}
                        />
                      )}
                      <div>
                        <p className="font-medium">{car.brands?.name} {car.model}</p>
                        <p className="text-sm text-muted-foreground">{car.code} • {car.year}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-accent">{formatPrice(car.price)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Você ainda não tem veículos cadastrados.</p>
                <Link to="/garage/cars">
                  <Button>Cadastrar Primeiro Veículo</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GarageLayout>
  );
}