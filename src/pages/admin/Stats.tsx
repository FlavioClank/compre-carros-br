import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow, subDays, startOfDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Eye,
  MousePointer,
  TrendingUp,
  Globe,
  BarChart3,
  Car,
  Megaphone,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────

const now = new Date();
const todayStart = startOfDay(now).toISOString();
const weekStart = subDays(startOfDay(now), 7).toISOString();
const monthStart = startOfMonth(now).toISOString();

function useSummaryCount(entityType: string, action: string, since: string) {
  return useQuery({
    queryKey: ["stats-count", entityType, action, since],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("action_logs")
        .select("*", { count: "exact", head: true })
        .eq("entity_type", entityType)
        .eq("action", action)
        .gte("created_at", since);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ─── Overview Cards ────────────────────────────────────────

function OverviewCards() {
  const { data: siteToday } = useSummaryCount("site", "visit", todayStart);
  const { data: siteWeek } = useSummaryCount("site", "visit", weekStart);
  const { data: siteMonth } = useSummaryCount("site", "visit", monthStart);

  const { data: vehicleViewsMonth } = useSummaryCount("vehicle", "visit", monthStart);
  const { data: vehicleClicksMonth } = useSummaryCount("vehicle", "click", monthStart);
  const { data: adClicksMonth } = useSummaryCount("ad", "click", monthStart);

  const cards = [
    {
      label: "Visitas Hoje",
      value: siteToday ?? "–",
      icon: Globe,
      color: "text-primary",
    },
    {
      label: "Visitas 7 dias",
      value: siteWeek ?? "–",
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Visitas no Mês",
      value: siteMonth ?? "–",
      icon: BarChart3,
      color: "text-primary",
    },
    {
      label: "Views Veículos (Mês)",
      value: vehicleViewsMonth ?? "–",
      icon: Eye,
      color: "text-muted-foreground",
    },
    {
      label: "Leads Veículos (Mês)",
      value: vehicleClicksMonth ?? "–",
      icon: MousePointer,
      color: "text-accent",
    },
    {
      label: "Cliques Anúncios (Mês)",
      value: adClicksMonth ?? "–",
      icon: Megaphone,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <c.icon className={`h-4 w-4 ${c.color}`} />
            <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{c.value}</p>
        </Card>
      ))}
    </div>
  );
}

// ─── Site Tab ──────────────────────────────────────────────

function SiteTab() {
  const { data: dailyData, isLoading } = useQuery({
    queryKey: ["stats-site-daily-30"],
    queryFn: async () => {
      const from = subDays(startOfDay(now), 30).toISOString();
      const { data, error } = await supabase
        .from("action_logs")
        .select("created_at")
        .eq("action", "visit")
        .eq("entity_type", "site")
        .gte("created_at", from);
      if (error) throw error;

      const buckets = new Map<string, number>();
      (data || []).forEach((log) => {
        const key = format(new Date(log.created_at), "dd/MM");
        buckets.set(key, (buckets.get(key) || 0) + 1);
      });

      return Array.from(buckets.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dia, visitas]) => ({ dia, visitas }));
    },
    staleTime: 60_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Visitas ao Site — Últimos 30 dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        ) : dailyData && dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="visitas" name="Visitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center py-10 text-muted-foreground">Nenhuma visita registrada</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Ads Tab ──────────────────────────────────────────────

function AdsTab() {
  const { data: adStats, isLoading } = useQuery({
    queryKey: ["stats-ads-summary-v2"],
    queryFn: async () => {
      const { data: ads, error: adsError } = await supabase
        .from("ads")
        .select("id, title, is_active")
        .order("created_at", { ascending: false });
      if (adsError) throw adsError;
      if (!ads?.length) return [];

      const adIds = ads.map((a) => a.id);

      // Fetch all clicks and views for these ads in parallel
      const [clicksRes, viewsRes] = await Promise.all([
        supabase
          .from("action_logs")
          .select("entity_id, created_at")
          .eq("action", "click")
          .eq("entity_type", "ad")
          .in("entity_id", adIds),
        supabase
          .from("action_logs")
          .select("entity_id, created_at")
          .eq("action", "visit")
          .eq("entity_type", "ad")
          .in("entity_id", adIds),
      ]);

      if (clicksRes.error) throw clicksRes.error;
      if (viewsRes.error) throw viewsRes.error;

      // Aggregate
      const clickMap = new Map<string, { total: number; today: number; week: number; month: number }>();
      const viewMap = new Map<string, number>();

      adIds.forEach((id) => {
        clickMap.set(id, { total: 0, today: 0, week: 0, month: 0 });
        viewMap.set(id, 0);
      });

      (clicksRes.data || []).forEach((log) => {
        if (!log.entity_id) return;
        const entry = clickMap.get(log.entity_id);
        if (!entry) return;
        entry.total++;
        if (log.created_at >= todayStart) entry.today++;
        if (log.created_at >= weekStart) entry.week++;
        if (log.created_at >= monthStart) entry.month++;
      });

      (viewsRes.data || []).forEach((log) => {
        if (!log.entity_id) return;
        viewMap.set(log.entity_id, (viewMap.get(log.entity_id) || 0) + 1);
      });

      return ads.map((ad) => ({
        ...ad,
        ...clickMap.get(ad.id)!,
        views: viewMap.get(ad.id) || 0,
      }));
    },
    staleTime: 60_000,
  });

  // Recent clicks
  const { data: recentClicks } = useQuery({
    queryKey: ["stats-recent-ad-clicks"],
    queryFn: async () => {
      const { data: clicks, error } = await supabase
        .from("action_logs")
        .select("id, created_at, entity_id, details")
        .eq("action", "click")
        .eq("entity_type", "ad")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      // Get ad titles
      const adIds = [...new Set((clicks || []).map((c) => c.entity_id).filter(Boolean))];
      const { data: ads } = await supabase
        .from("ads")
        .select("id, title")
        .in("id", adIds as string[]);
      const titleMap = new Map((ads || []).map((a) => [a.id, a.title]));

      return (clicks || []).map((c) => ({
        ...c,
        adTitle: c.entity_id ? titleMap.get(c.entity_id) || "—" : "—",
        placement: (c.details as any)?.placement || "—",
      }));
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      {/* Ad Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5 text-primary" />
            Desempenho dos Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : adStats && adStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anúncio</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Hoje</TableHead>
                    <TableHead className="text-right">7 dias</TableHead>
                    <TableHead className="text-right">Mês</TableHead>
                    <TableHead className="text-right">Total Cliques</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adStats.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {ad.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{ad.today}</TableCell>
                      <TableCell className="text-right font-semibold">{ad.week}</TableCell>
                      <TableCell className="text-right font-semibold">{ad.month}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{ad.total}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <span className="flex items-center justify-end gap-1">
                          <Eye className="h-3 w-3" />
                          {ad.views}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Nenhum anúncio encontrado</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MousePointer className="h-5 w-5 text-primary" />
            Últimos Cliques em Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[350px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Anúncio</TableHead>
                  <TableHead>Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClicks && recentClicks.length > 0 ? (
                  recentClicks.map((click) => (
                    <TableRow key={click.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(click.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{click.adTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {click.placement}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum clique registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Garages Tab ──────────────────────────────────────────

function GaragesTab() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");

  const { data: garages } = useQuery({
    queryKey: ["stats-garages-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("garages")
        .select("id, name, is_active")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: vehicleStats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["stats-garage-vehicles", selectedGarageId],
    queryFn: async () => {
      // Get cars
      let carsQuery = supabase
        .from("cars")
        .select("id, code, model, status, sold_at, garage_id, brands:brand_id(name), garages:garage_id(name)");

      if (selectedGarageId !== "all") {
        carsQuery = carsQuery.eq("garage_id", selectedGarageId);
      }

      const { data: cars, error } = await carsQuery;
      if (error) throw error;
      if (!cars?.length) return { vehicles: [], totalViews: 0, totalLeads: 0 };

      const carIds = cars.map((c: any) => c.id);

      // Get views and clicks in parallel (this month)
      const [viewsRes, clicksRes] = await Promise.all([
        supabase
          .from("action_logs")
          .select("entity_id")
          .eq("action", "visit")
          .eq("entity_type", "vehicle")
          .in("entity_id", carIds)
          .gte("created_at", monthStart),
        supabase
          .from("action_logs")
          .select("entity_id")
          .eq("action", "click")
          .eq("entity_type", "vehicle")
          .in("entity_id", carIds)
          .gte("created_at", monthStart),
      ]);

      const viewsMap = new Map<string, number>();
      const clicksMap = new Map<string, number>();

      (viewsRes.data || []).forEach((l: any) => {
        if (l.entity_id) viewsMap.set(l.entity_id, (viewsMap.get(l.entity_id) || 0) + 1);
      });
      (clicksRes.data || []).forEach((l: any) => {
        if (l.entity_id) clicksMap.set(l.entity_id, (clicksMap.get(l.entity_id) || 0) + 1);
      });

      const vehicles = cars.map((car: any) => ({
        id: car.id,
        code: car.code,
        model: car.model,
        brand: car.brands?.name || "—",
        garage: car.garages?.name || "—",
        status: car.status,
        sold_at: car.sold_at,
        views: viewsMap.get(car.id) || 0,
        leads: clicksMap.get(car.id) || 0,
      }));

      // Sort by leads desc, then views desc
      vehicles.sort((a: any, b: any) => b.leads !== a.leads ? b.leads - a.leads : b.views - a.views);

      const totalViews = vehicles.reduce((s: number, v: any) => s + v.views, 0);
      const totalLeads = vehicles.reduce((s: number, v: any) => s + v.leads, 0);

      return { vehicles, totalViews, totalLeads };
    },
    staleTime: 60_000,
  });

  const conversionRate =
    vehicleStats?.totalViews
      ? ((vehicleStats.totalLeads / vehicleStats.totalViews) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="w-full sm:w-64 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Garagem</p>
          <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as garagens</SelectItem>
              {garages?.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name} {!g.is_active && "(Inativa)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Views (Mês)</span>
          </div>
          <p className="text-2xl font-bold">{vehicleStats?.totalViews ?? 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <MousePointer className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Leads (Mês)</span>
          </div>
          <p className="text-2xl font-bold text-primary">{vehicleStats?.totalLeads ?? 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Conversão</span>
          </div>
          <p className="text-2xl font-bold text-accent">{conversionRate}%</p>
        </Card>
      </div>

      {/* Vehicle Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-primary" />
            Ranking de Veículos — Mês Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : vehicleStats?.vehicles && vehicleStats.vehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Veículo</TableHead>
                    {selectedGarageId === "all" && <TableHead>Garagem</TableHead>}
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleStats.vehicles.map((v: any, i: number) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <span>
                            {v.brand} {v.model}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">({v.code})</span>
                        </div>
                      </TableCell>
                      {selectedGarageId === "all" && (
                        <TableCell className="text-muted-foreground">{v.garage}</TableCell>
                      )}
                      <TableCell className="text-center">
                        <Badge variant={v.status === "available" ? "default" : "secondary"}>
                          {v.status === "available" ? "Ativo" : "Vendido"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{v.views}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {v.leads}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum veículo encontrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function AdminStats() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Estatísticas</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do desempenho do site, anúncios e veículos.
          </p>
        </div>

        {/* Overview Cards */}
        <OverviewCards />

        {/* Tabs */}
        <Tabs defaultValue="site" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="site" className="gap-1.5">
              <Globe className="h-4 w-4" />
              Site
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-1.5">
              <Megaphone className="h-4 w-4" />
              Anúncios
            </TabsTrigger>
            <TabsTrigger value="garages" className="gap-1.5">
              <Car className="h-4 w-4" />
              Garagens
            </TabsTrigger>
          </TabsList>
          <TabsContent value="site">
            <SiteTab />
          </TabsContent>
          <TabsContent value="ads">
            <AdsTab />
          </TabsContent>
          <TabsContent value="garages">
            <GaragesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
