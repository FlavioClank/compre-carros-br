import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, CheckCircle, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function AdminDashboard() {
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [garagesRes, carsRes, salesRes] = await Promise.all([
        supabase.from("garages").select("id", { count: "exact" }).eq("is_active", true),
        supabase.from("cars").select("id, price, status"),
        supabase.from("sales_history").select("car_snapshot"),
      ]);

      const availableCars = carsRes.data?.filter(c => c.status === "available") || [];
      const totalSales = salesRes.data?.reduce((acc, sale) => {
        const snapshot = sale.car_snapshot as any;
        return acc + (snapshot?.price || 0);
      }, 0) || 0;

      return {
        activeGarages: garagesRes.count || 0,
        availableCars: availableCars.length,
        monthlySales: salesRes.data?.length || 0,
        totalSalesValue: totalSales,
      };
    },
  });

  // Fetch recent cars
  const { data: recentCars } = useQuery({
    queryKey: ["admin-recent-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, brands(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Garagens Ativas</CardTitle>
              <Building2 className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats?.activeGarages || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Veículos Disponíveis</CardTitle>
              <Package className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats?.availableCars || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vendas Registradas</CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats?.monthlySales || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total em Vendas</CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{formatPrice(stats?.totalSalesValue || 0)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Veículos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCars && recentCars.length > 0 ? (
              <div className="space-y-4">
                {recentCars.map((car: any) => (
                  <div key={car.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {car.photos?.[0] && (
                        <img src={car.photos[0]} alt={car.model} className="h-12 w-16 object-cover rounded" />
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
              <p className="text-muted-foreground text-center py-4">Nenhum veículo cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
