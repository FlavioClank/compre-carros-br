import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

type Period = "daily" | "weekly" | "monthly";

interface ActionLog {
  id: string;
  created_at: string;
  entity_id: string | null;
  entity_type: string;
  action: string;
}

interface AggregatedPoint {
  label: string;
  count: number;
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

function StatsAdsTab() {
  const [year, setYear] = useState<number>(currentYear);
  const [period, setPeriod] = useState<Period>("monthly");
  const [selectedAdId, setSelectedAdId] = useState<string>("");

  const { data: ads } = useQuery({
    queryKey: ["stats-ads-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, category, is_active")
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
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Anúncios</CardTitle>
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
  );
}

function StatsGaragesTab() {
  const [year, setYear] = useState<number>(currentYear);
  const [period, setPeriod] = useState<Period>("monthly");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");

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
    queryKey: ["stats-garages", selectedGarageId, year, period],
    enabled: !!selectedGarageId,
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
            <p className="text-sm font-medium text-muted-foreground">Garagem</p>
            <Select
              value={selectedGarageId}
              onValueChange={(value) => setSelectedGarageId(value)}
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
            onClick={() => refetch()}
            disabled={!selectedGarageId || isFetching}
          >
            Gerar relatório
          </Button>
        </div>

        {selectedGarageId && (
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

  const {
    data: aggregated,
    isFetching,
    refetch,
  } = useQuery<{ points: AggregatedPoint[]; total: number }>({
    queryKey: ["stats-site", year, period],
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas do Site</CardTitle>
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
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={() => refetch()} disabled={isFetching}>
            Gerar relatório
          </Button>
        </div>

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
            Acompanhe o desempenho de anúncios, garagens e do site para apresentações comerciais.
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
