import { useState, useMemo } from "react";
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
import {
  format,
  formatDistanceToNow,
  subDays,
  subMonths,
  startOfDay,
  startOfMonth,
  endOfMonth,
  differenceInDays,
} from "date-fns";
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
  Calendar,
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

// ─── Period selector ───────────────────────────────────────

type PeriodKey =
  | "today"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "3m"
  | "6m"
  | "12m"
  | "all";

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "this_month", label: "Mês atual" },
  { value: "last_month", label: "Mês passado" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "12m", label: "Últimos 12 meses" },
  { value: "all", label: "Tudo (desde o início)" },
];

function resolvePeriod(p: PeriodKey): { from: string; to: string | null; label: string } {
  const now = new Date();
  switch (p) {
    case "today":
      return { from: startOfDay(now).toISOString(), to: null, label: "Hoje" };
    case "7d":
      return { from: subDays(startOfDay(now), 7).toISOString(), to: null, label: "Últimos 7 dias" };
    case "30d":
      return { from: subDays(startOfDay(now), 30).toISOString(), to: null, label: "Últimos 30 dias" };
    case "this_month":
      return { from: startOfMonth(now).toISOString(), to: null, label: "Mês atual" };
    case "last_month": {
      const lm = subMonths(now, 1);
      return {
        from: startOfMonth(lm).toISOString(),
        to: endOfMonth(lm).toISOString(),
        label: `Mês passado (${format(lm, "MMM/yyyy", { locale: ptBR })})`,
      };
    }
    case "3m":
      return { from: subMonths(startOfDay(now), 3).toISOString(), to: null, label: "Últimos 3 meses" };
    case "6m":
      return { from: subMonths(startOfDay(now), 6).toISOString(), to: null, label: "Últimos 6 meses" };
    case "12m":
      return { from: subMonths(startOfDay(now), 12).toISOString(), to: null, label: "Últimos 12 meses" };
    case "all":
      return { from: "1970-01-01T00:00:00.000Z", to: null, label: "Tudo (desde o início)" };
  }
}

// ─── Action aliases (compat with old/new logs) ─────────────

const ACTION_ALIASES = {
  site: {
    visit: ["visit", "site_view"],
    click: ["click", "site_click"],
  },
  ad: {
    visit: ["visit", "ad_view"],
    click: ["click", "ad_click"],
  },
  vehicle: {
    visit: ["visit", "vehicle_view"],
    click: ["click", "vehicle_click"],
  },
  car: {
    visit: ["visit", "car_view"],
    click: ["click", "car_click"],
  },
} as const;

function getActionAliases(entityType: string, action: string) {
  const aliases = ACTION_ALIASES[entityType as keyof typeof ACTION_ALIASES];
  if (!aliases) return [action];
  return [...new Set(aliases[action as keyof typeof aliases] ?? [action])];
}

// ─── Helpers ───────────────────────────────────────────────

function useSummaryCount(
  entityType: string,
  action: string,
  from: string,
  to: string | null,
) {
  return useQuery({
    queryKey: ["stats-count", entityType, action, from, to],
    queryFn: async () => {
      const actions = getActionAliases(entityType, action);
      let q = supabase
        .from("action_logs")
        .select("*", { count: "exact", head: true })
        .eq("entity_type", entityType)
        .in("action", actions)
        .gte("created_at", from);
      if (to) q = q.lte("created_at", to);
      const { count, error } = await q;
      if (error) throw error;
      return count || 0;
    },
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

// ─── Overview Cards ────────────────────────────────────────

function OverviewCards({ from, to, label }: { from: string; to: string | null; label: string }) {
  const { data: siteVisits } = useSummaryCount("site", "visit", from, to);
  const { data: vehicleViews } = useSummaryCount("vehicle", "visit", from, to);
  const { data: vehicleClicks } = useSummaryCount("vehicle", "click", from, to);
  const { data: adClicks } = useSummaryCount("ad", "click", from, to);
  const { data: adViews } = useSummaryCount("ad", "visit", from, to);

  const cards = [
    { label: `Visitas Site (${label})`, value: siteVisits ?? "–", icon: Globe, color: "text-primary" },
    { label: `Views Veículos`, value: vehicleViews ?? "–", icon: Eye, color: "text-muted-foreground" },
    { label: `Leads Veículos`, value: vehicleClicks ?? "–", icon: MousePointer, color: "text-accent" },
    { label: `Views Anúncios`, value: adViews ?? "–", icon: BarChart3, color: "text-muted-foreground" },
    { label: `Cliques Anúncios`, value: adClicks ?? "–", icon: Megaphone, color: "text-accent" },
    {
      label: `Conversão Veículos`,
      value:
        vehicleViews && vehicleViews > 0
          ? `${(((vehicleClicks || 0) / vehicleViews) * 100).toFixed(1)}%`
          : "–",
      icon: TrendingUp,
      color: "text-primary",
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

function SiteTab({ from, to, label }: { from: string; to: string | null; label: string }) {
  const { data: dailyData, isLoading } = useQuery({
    queryKey: ["stats-site-series", from, to],
    queryFn: async () => {
      const siteVisitActions = getActionAliases("site", "visit");
      let q = supabase
        .from("action_logs")
        .select("created_at")
        .eq("entity_type", "site")
        .in("action", siteVisitActions)
        .gte("created_at", from);
      if (to) q = q.lte("created_at", to);
      const { data, error } = await q;
      if (error) throw error;

      // Decide bucket granularity: <= 90 days = daily; otherwise monthly
      const fromDate = new Date(from);
      const toDate = to ? new Date(to) : new Date();
      const days = Math.max(1, differenceInDays(toDate, fromDate));
      const useMonthly = days > 90;

      const buckets = new Map<string, number>();
      (data || []).forEach((log) => {
        const d = new Date(log.created_at);
        const key = useMonthly ? format(d, "MM/yyyy") : format(d, "dd/MM");
        buckets.set(key, (buckets.get(key) || 0) + 1);
      });

      return Array.from(buckets.entries())
        .sort((a, b) => {
          // Sort chronologically
          const parse = (k: string) => {
            const parts = k.split("/").map(Number);
            return useMonthly
              ? new Date(parts[1], parts[0] - 1, 1).getTime()
              : new Date(new Date().getFullYear(), parts[1] - 1, parts[0]).getTime();
          };
          return parse(a[0]) - parse(b[0]);
        })
        .map(([dia, visitas]) => ({ dia, visitas }));
    },
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Visitas ao Site — {label}
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
          <p className="text-center py-10 text-muted-foreground">
            Nenhuma visita registrada nesse período
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Ads Tab ──────────────────────────────────────────────

function AdsTab({ from, to, label }: { from: string; to: string | null; label: string }) {
  const { data: adStats, isLoading } = useQuery({
    queryKey: ["stats-ads-summary", from, to],
    queryFn: async () => {
      const { data: ads, error: adsError } = await supabase
        .from("ads")
        .select("id, title, is_active")
        .order("created_at", { ascending: false });
      if (adsError) throw adsError;
      if (!ads?.length) return [];

      const adIds = ads.map((a) => a.id);
      const adClickActions = getActionAliases("ad", "click");
      const adViewActions = getActionAliases("ad", "visit");

      const buildLogQuery = (actions: string[]) => {
        let q = supabase
          .from("action_logs")
          .select("entity_id, created_at")
          .in("action", actions)
          .eq("entity_type", "ad")
          .in("entity_id", adIds)
          .gte("created_at", from);
        if (to) q = q.lte("created_at", to);
        return q;
      };

      const [clicksRes, viewsRes] = await Promise.all([
        buildLogQuery(adClickActions),
        buildLogQuery(adViewActions),
      ]);

      if (clicksRes.error) throw clicksRes.error;
      if (viewsRes.error) throw viewsRes.error;

      const clickMap = new Map<string, number>();
      const viewMap = new Map<string, number>();

      adIds.forEach((id) => {
        clickMap.set(id, 0);
        viewMap.set(id, 0);
      });

      (clicksRes.data || []).forEach((log) => {
        if (!log.entity_id) return;
        clickMap.set(log.entity_id, (clickMap.get(log.entity_id) || 0) + 1);
      });

      (viewsRes.data || []).forEach((log) => {
        if (!log.entity_id) return;
        viewMap.set(log.entity_id, (viewMap.get(log.entity_id) || 0) + 1);
      });

      return ads
        .map((ad) => ({
          ...ad,
          clicks: clickMap.get(ad.id) || 0,
          views: viewMap.get(ad.id) || 0,
        }))
        .sort((a, b) => b.clicks - a.clicks);
    },
    staleTime: 60_000,
  });

  // Recent clicks (always last 20, regardless of period)
  const { data: recentClicks } = useQuery({
    queryKey: ["stats-recent-ad-clicks"],
    queryFn: async () => {
      const adClickActions = getActionAliases("ad", "click");
      const { data: clicks, error } = await supabase
        .from("action_logs")
        .select("id, created_at, entity_id, details")
        .in("action", adClickActions)
        .eq("entity_type", "ad")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

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
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5 text-primary" />
            Desempenho dos Anúncios — {label}
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
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adStats.map((ad) => {
                    const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : "0";
                    return (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {ad.title}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={ad.is_active ? "default" : "secondary"}>
                            {ad.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          <span className="flex items-center justify-end gap-1">
                            <Eye className="h-3 w-3" />
                            {ad.views}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {ad.clicks}
                        </TableCell>
                        <TableCell className="text-right text-accent font-semibold">
                          {ctr}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum anúncio com dados nesse período
            </p>
          )}
        </CardContent>
      </Card>

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

function GaragesTab({ from, to, label }: { from: string; to: string | null; label: string }) {
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
    queryKey: ["stats-garage-vehicles", selectedGarageId, from, to],
    queryFn: async () => {
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
      const vehicleViewActions = getActionAliases("vehicle", "visit");
      const vehicleClickActions = getActionAliases("vehicle", "click");

      const buildLogQuery = (actions: string[]) => {
        let q = supabase
          .from("action_logs")
          .select("entity_id")
          .in("action", actions)
          .eq("entity_type", "vehicle")
          .in("entity_id", carIds)
          .gte("created_at", from);
        if (to) q = q.lte("created_at", to);
        return q;
      };

      const [viewsRes, clicksRes] = await Promise.all([
        buildLogQuery(vehicleViewActions),
        buildLogQuery(vehicleClickActions),
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

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Views ({label})</span>
          </div>
          <p className="text-2xl font-bold">{vehicleStats?.totalViews ?? 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <MousePointer className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Leads ({label})</span>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-primary" />
            Ranking de Veículos — {label}
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
              Nenhum veículo com dados nesse período
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function AdminStats() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const { from, to, label } = useMemo(() => resolvePeriod(period), [period]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Estatísticas</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do desempenho do site, anúncios e veículos.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-1">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Período
            </label>
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <OverviewCards from={from} to={to} label={label} />

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
            <SiteTab from={from} to={to} label={label} />
          </TabsContent>
          <TabsContent value="ads">
            <AdsTab from={from} to={to} label={label} />
          </TabsContent>
          <TabsContent value="garages">
            <GaragesTab from={from} to={to} label={label} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
