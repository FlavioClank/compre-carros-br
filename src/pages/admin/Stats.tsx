import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw, Clock, MousePointer, TrendingUp, Eye } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

interface ActionLog {
  id: string;
  created_at: string;
  entity_id: string | null;
  entity_type: string;
  action: string;
  details: Record<string, any> | null;
}

interface AggregatedPoint {
  label: string;
  count: number;
}

interface AdInfo {
  id: string;
  slug: string | null;
  title: string;
  category: string;
  is_active: boolean;
}

const currentYear = new Date().getFullYear();
const AVAILABLE_YEARS = [currentYear, currentYear - 1, currentYear - 2];

function aggregateByPeriod(logs: ActionLog[], period: Period): AggregatedPoint[] {
  const buckets = new Map<string, number>();

  logs.forEach((log) => {
    const date = new Date(log.created_at);
    let key: string;

    if (period === "daily") {
      key = format(date, "dd/MM/yyyy");
    } else if (period === "monthly") {
      key = format(date, "MM/yyyy");
    } else {
      // weekly
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear =
        (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
          Date.UTC(firstDayOfYear.getFullYear(), firstDayOfYear.getMonth(), firstDayOfYear.getDate())) /
        24 /
        60 /
        60 /
        1000;
      const week = Math.floor((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7) + 1;
      key = `Semana ${week.toString().padStart(2, "0")}/${date.getFullYear()}`;
    }

    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

// Real-time ad clicks component
function RecentAdClicks() {
  const [recentClicks, setRecentClicks] = useState<ActionLog[]>([]);
  const [adsMap, setAdsMap] = useState<Map<string, AdInfo>>(new Map());

  // Fetch ads info
  const { data: ads } = useQuery({
    queryKey: ["stats-ads-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, slug, title, category, is_active");
      if (error) throw error;
      return data || [];
    },
  });

  // Build ads map when data changes
  useEffect(() => {
    if (ads) {
      const map = new Map<string, AdInfo>();
      ads.forEach((ad: AdInfo) => map.set(ad.id, ad));
      setAdsMap(map);
    }
  }, [ads]);

  // Fetch recent clicks
  const { refetch, isFetching } = useQuery({
    queryKey: ["recent-ad-clicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_logs")
        .select("id, created_at, entity_id, entity_type, action, details")
        .eq("action", "click")
        .eq("entity_type", "ad")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecentClicks((data || []) as ActionLog[]);
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("ad-clicks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "action_logs",
          filter: "entity_type=eq.ad",
        },
        (payload) => {
          const newClick = payload.new as ActionLog;
          if (newClick.action === "click") {
            setRecentClicks((prev) => [newClick, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getAdTitle = (entityId: string | null) => {
    if (!entityId) return "Desconhecido";
    const ad = adsMap.get(entityId);
    return ad?.title || entityId.slice(0, 8);
  };

  const getPlacement = (details: Record<string, any> | null) => {
    if (!details) return "-";
    return details.placement || "-";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Últimos Cliques em Anúncios
          </CardTitle>
          <CardDescription>
            Atualização em tempo real (últimos 50 cliques)
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Anúncio</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentClicks.length > 0 ? (
                recentClicks.map((click) => (
                  <TableRow key={click.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      <span title={format(new Date(click.created_at), "dd/MM/yyyy HH:mm:ss")}>
                        {formatDistanceToNow(new Date(click.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getAdTitle(click.entity_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getPlacement(click.details as Record<string, any> | null)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhum clique registrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Summary of clicks per ad
function AdClicksSummary() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["ad-clicks-summary"],
    queryFn: async () => {
      // Get all ads
      const { data: ads, error: adsError } = await supabase
        .from("ads")
        .select("id, slug, title, category, is_active")
        .order("created_at", { ascending: false });

      if (adsError) throw adsError;

      // Get click counts for each ad
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const results = await Promise.all(
        (ads || []).map(async (ad: AdInfo) => {
          // Total clicks
          const { count: totalClicks } = await supabase
            .from("action_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "click")
            .eq("entity_type", "ad")
            .eq("entity_id", ad.id);

          // Today clicks
          const { count: todayClicks } = await supabase
            .from("action_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "click")
            .eq("entity_type", "ad")
            .eq("entity_id", ad.id)
            .gte("created_at", startOfToday.toISOString());

          // Week clicks
          const { count: weekClicks } = await supabase
            .from("action_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "click")
            .eq("entity_type", "ad")
            .eq("entity_id", ad.id)
            .gte("created_at", startOfWeek.toISOString());

          // Month clicks
          const { count: monthClicks } = await supabase
            .from("action_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "click")
            .eq("entity_type", "ad")
            .eq("entity_id", ad.id)
            .gte("created_at", startOfMonth.toISOString());

          // Total views
          const { count: totalViews } = await supabase
            .from("action_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "visit")
            .eq("entity_type", "ad")
            .eq("entity_id", ad.id);

          return {
            ...ad,
            totalClicks: totalClicks || 0,
            todayClicks: todayClicks || 0,
            weekClicks: weekClicks || 0,
            monthClicks: monthClicks || 0,
            totalViews: totalViews || 0,
          };
        })
      );

      return results;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo por Anúncio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Resumo por Anúncio
        </CardTitle>
        <CardDescription>
          Cliques e visualizações de todos os anúncios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anúncio</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Hoje</TableHead>
              <TableHead className="text-right">7 dias</TableHead>
              <TableHead className="text-right">Mês</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary && summary.length > 0 ? (
              summary.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {ad.title}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ad.is_active ? "default" : "secondary"}>
                      {ad.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {ad.todayClicks}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {ad.weekClicks}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {ad.monthClicks}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {ad.totalClicks}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">
                      <Eye className="h-3 w-3" />
                      {ad.totalViews}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum anúncio encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatsAdsTab() {
  const [year, setYear] = useState<number>(currentYear);
  const [period, setPeriod] = useState<Period>("monthly");
  const [selectedAdId, setSelectedAdId] = useState<string>("");

  const { data: ads } = useQuery({
    queryKey: ["stats-ads-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, slug, title, category, is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const {
    data: aggregated,
    isFetching,
    refetch,
  } = useQuery<{ points: AggregatedPoint[]; total: number }>({
    queryKey: ["stats-ads", selectedAdId, year, period],
    enabled: !!selectedAdId,
    queryFn: async () => {
      const from = `${year}-01-01`;
      const to = `${year + 1}-01-01`;

      const { data, error } = await supabase
        .from("action_logs")
        .select("id, created_at, entity_id, entity_type, action")
        .eq("action", "click")
        .eq("entity_type", "ad")
        .eq("entity_id", selectedAdId)
        .gte("created_at", from)
        .lt("created_at", to);

      if (error) throw error;
      const logs = (data || []) as ActionLog[];
      const points = aggregateByPeriod(logs, period);
      const total = logs.length;
      return { points, total };
    },
  });

  return (
    <div className="space-y-6">
      {/* Summary and Recent clicks cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AdClicksSummary />
        <RecentAdClicks />
      </div>

      {/* Detailed report card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-primary" />
            Relatório Detalhado por Anúncio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ano</p>
              <Select
                value={String(year)}
                onValueChange={(value) => setYear(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Período</p>
              <Select
                value={period}
                onValueChange={(value: Period) => setPeriod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Anúncio</p>
              <Select
                value={selectedAdId}
                onValueChange={(value) => setSelectedAdId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o anúncio" />
                </SelectTrigger>
                <SelectContent>
                  {ads?.map((ad: any) => (
                    <SelectItem key={ad.id} value={ad.id}>
                      {ad.title}
                      {ad.is_active ? "" : " (inativo)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => refetch()}
              disabled={!selectedAdId || isFetching}
            >
              Gerar relatório
            </Button>
          </div>

          {selectedAdId && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Total de cliques no período selecionado: {aggregated?.total ?? 0}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregated?.points.length ? (
                    aggregated.points.map((point) => (
                      <TableRow key={point.label}>
                        <TableCell>{point.label}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {point.count}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum clique registrado para o filtro selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsGaragesTab() {
  const [year, setYear] = useState<number>(currentYear);
  const [period, setPeriod] = useState<Period>("monthly");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const { data: garages } = useQuery({
    queryKey: ["stats-garages-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("garages")
        .select("id, name, is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const {
    data: aggregated,
    isFetching,
    refetch,
  } = useQuery<{ points: AggregatedPoint[]; total: number }>({
    queryKey: ["stats-garages", selectedGarageId, year, period, reportGenerated],
    enabled: reportGenerated && !!selectedGarageId,
    queryFn: async () => {
      const from = `${year}-01-01`;
      const to = `${year + 1}-01-01`;

      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("id")
        .eq("garage_id", selectedGarageId);
      if (carsError) throw carsError;
      const carIds = (cars || []).map((c: any) => c.id);
      if (!carIds.length) {
        return { points: [], total: 0 };
      }

      const { data, error } = await supabase
        .from("action_logs")
        .select("id, created_at, entity_id, entity_type, action")
        .eq("action", "click")
        .eq("entity_type", "car")
        .in("entity_id", carIds)
        .gte("created_at", from)
        .lt("created_at", to);

      if (error) throw error;
      const logs = (data || []) as ActionLog[];
      const points = aggregateByPeriod(logs, period);
      const total = logs.length;
      return { points, total };
    },
  });

  const handleGenerateReport = () => {
    if (!selectedGarageId) return;
    setReportGenerated(true);
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas por Garagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Ano</p>
            <Select
              value={String(year)}
              onValueChange={(value) => {
                setYear(Number(value));
                setReportGenerated(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Período</p>
            <Select
              value={period}
              onValueChange={(value: Period) => {
                setPeriod(value);
                setReportGenerated(false);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Garagem</p>
            <Select
              value={selectedGarageId}
              onValueChange={(value) => {
                setSelectedGarageId(value);
                setReportGenerated(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a garagem" />
              </SelectTrigger>
              <SelectContent>
                {garages?.map((garage: any) => (
                  <SelectItem key={garage.id} value={garage.id}>
                    {garage.name}
                    {garage.is_active ? "" : " (inativa)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleGenerateReport}
            disabled={!selectedGarageId || isFetching}
          >
            {isFetching ? "Gerando..." : "Gerar relatório"}
          </Button>
        </div>

        {reportGenerated && selectedGarageId && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Total de cliques em veículos desta garagem no período selecionado: {aggregated?.total ?? 0}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregated?.points.length ? (
                  aggregated.points.map((point) => (
                    <TableRow key={point.label}>
                      <TableCell>{point.label}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {point.count}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum clique registrado para o filtro selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSiteTab() {
  const [year, setYear] = useState<number>(currentYear);
  const [period, setPeriod] = useState<Period>("monthly");
  const [reportGenerated, setReportGenerated] = useState(false);

  const {
    data: aggregated,
    isFetching,
    refetch,
  } = useQuery<{ points: AggregatedPoint[]; total: number }>({
    queryKey: ["stats-site", year, period, reportGenerated],
    enabled: reportGenerated,
    queryFn: async () => {
      const from = `${year}-01-01`;
      const to = `${year + 1}-01-01`;

      const { data, error } = await supabase
        .from("action_logs")
        .select("id, created_at, entity_id, entity_type, action")
        .eq("action", "visit")
        .eq("entity_type", "site")
        .gte("created_at", from)
        .lt("created_at", to);

      if (error) throw error;
      const logs = (data || []) as ActionLog[];
      const points = aggregateByPeriod(logs, period);
      const total = logs.length;
      return { points, total };
    },
  });

  const handleGenerateReport = () => {
    setReportGenerated(true);
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas do Site</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Ano</p>
            <Select
              value={String(year)}
              onValueChange={(value) => {
                setYear(Number(value));
                setReportGenerated(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Período</p>
            <Select
              value={period}
              onValueChange={(value: Period) => {
                setPeriod(value);
                setReportGenerated(false);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleGenerateReport} disabled={isFetching}>
            {isFetching ? "Gerando..." : "Gerar relatório"}
          </Button>
        </div>

        {reportGenerated && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Total de visitas no período selecionado: {aggregated?.total ?? 0}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregated?.points.length ? (
                  aggregated.points.map((point) => (
                    <TableRow key={point.label}>
                      <TableCell>{point.label}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {point.count}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhuma visita registrada para o filtro selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminStats() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Estatísticas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho de anúncios, garagens e do site em tempo real.
          </p>
        </div>

        <Tabs defaultValue="ads" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ads">Anúncios</TabsTrigger>
            <TabsTrigger value="garages">Garagens</TabsTrigger>
            <TabsTrigger value="site">Site</TabsTrigger>
          </TabsList>
          <TabsContent value="ads">
            <StatsAdsTab />
          </TabsContent>
          <TabsContent value="garages">
            <StatsGaragesTab />
          </TabsContent>
          <TabsContent value="site">
            <StatsSiteTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
