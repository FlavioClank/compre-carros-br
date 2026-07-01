import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, CheckCircle, TrendingUp, MessageCircle, Save } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVehicleWhatsappEnabled } from "@/hooks/useVehicleWhatsappEnabled";
import { useVehicleWhatsappNumber, formatBrPhone } from "@/hooks/useVehicleWhatsappNumber";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { enabled: waEnabled, loading: waLoading, updateSetting: updateWa } = useVehicleWhatsappEnabled();
  const { number: waNumber, loading: numLoading, updateNumber } = useVehicleWhatsappNumber();
  const [numberInput, setNumberInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!numLoading) setNumberInput(waNumber);
  }, [waNumber, numLoading]);

  const handleToggleWhatsapp = async (checked: boolean) => {
    const ok = await updateWa(checked);
    if (ok) {
      toast.success(checked ? "Botão de WhatsApp ativado em todos os veículos" : "Botão de WhatsApp desativado em todos os veículos");
    } else {
      toast.error("Erro ao atualizar configuração");
    }
  };

  const handleSaveNumber = async () => {
    const digits = numberInput.replace(/\D/g, "");
    if (digits.length < 12 || !digits.startsWith("55")) {
      toast.error("Informe o número com DDI 55 + DDD + número (ex: 5565992230000)");
      return;
    }
    setSaving(true);
    const ok = await updateNumber(digits);
    setSaving(false);
    if (ok) {
      toast.success(`Número atualizado: ${formatBrPhone(digits)}`);
    } else {
      toast.error("Erro ao salvar número");
    }
  };

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

        {/* Configurações Globais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent" />
              Configurações Globais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex-1">
                <Label htmlFor="wa-toggle" className="text-base font-medium cursor-pointer">
                  Botão de WhatsApp nos veículos
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Quando desativado, o botão "Falar pelo WhatsApp" será ocultado em todas as páginas e cards de veículos do site público.
                </p>
              </div>
              <Switch
                id="wa-toggle"
                checked={waEnabled}
                disabled={waLoading}
                onCheckedChange={handleToggleWhatsapp}
              />
            </div>

            <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
              <div>
                <Label htmlFor="wa-number" className="text-base font-medium">
                  Número do WhatsApp dos veículos
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Este número recebe todos os cliques do botão "Falar pelo WhatsApp" nos cards e páginas de veículos. Formato: DDI + DDD + número (ex: <span className="font-mono">5565992230000</span>).
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  id="wa-number"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  placeholder="5565992230000"
                  disabled={numLoading || saving}
                  className="font-mono flex-1"
                  inputMode="numeric"
                />
                <Button
                  type="button"
                  onClick={handleSaveNumber}
                  disabled={numLoading || saving || numberInput.replace(/\D/g, "") === waNumber}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
              {!numLoading && waNumber && (
                <p className="text-xs text-muted-foreground">
                  Número ativo agora: <span className="font-mono">{formatBrPhone(waNumber)}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
              <p className="text-muted-foreground text-center py-4">Nenhum veículo cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
