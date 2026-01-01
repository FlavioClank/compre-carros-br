import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Check, Calendar, AlertCircle, Trash2, Eye, MousePointerClick, MessageSquare, Copy } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Ad {
  id: string;
  title: string;
}

interface BillingRecord {
  id: string;
  ad_id: string;
  company_name: string;
  monthly_fee: number;
  billing_day: number;
  created_at: string;
  ad_title?: string;
}

interface Payment {
  id: string;
  billing_id: string;
  reference_month: number;
  reference_year: number;
  paid_at: string;
}

interface AdMetrics {
  views: number;
  clicks: number;
  weeklyViews: number;
  weeklyClicks: number;
}

function getBillingStatus(
  billingDay: number,
  payments: Payment[],
  billingId: string
): { status: "paid" | "pending"; isPastDue: boolean } {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // Check if current month is paid
  const isPaidThisMonth = payments.some(
    (p) =>
      p.billing_id === billingId &&
      p.reference_month === currentMonth &&
      p.reference_year === currentYear
  );

  if (isPaidThisMonth) {
    return { status: "paid", isPastDue: false };
  }

  // Check if we're past the billing day this month
  const isPastDue = currentDay >= billingDay;

  return { status: "pending", isPastDue };
}

export default function AdminPlanilha() {
  const [billings, setBillings] = useState<BillingRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [adMetrics, setAdMetrics] = useState<Record<string, AdMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    ad_id: "",
    company_name: "",
    monthly_fee: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    
    const [billingsRes, paymentsRes, adsRes] = await Promise.all([
      supabase.from("ad_billing").select("*").order("created_at", { ascending: false }),
      supabase.from("ad_billing_payments").select("*"),
      supabase.from("ads").select("id, title").order("title"),
    ]);

    if (billingsRes.error) {
      toast.error("Erro ao carregar dados de cobrança");
      console.error(billingsRes.error);
    } else {
      setBillings(billingsRes.data || []);
    }

    if (paymentsRes.error) {
      console.error(paymentsRes.error);
    } else {
      setPayments(paymentsRes.data || []);
    }

    if (adsRes.error) {
      console.error(adsRes.error);
    } else {
      setAds(adsRes.data || []);
      // Fetch metrics for all ads
      if (adsRes.data && adsRes.data.length > 0) {
        await fetchMetrics(adsRes.data.map((a) => a.id));
      }
    }

    setIsLoading(false);
  }

  async function fetchMetrics(adIds: string[]) {
    try {
      // Get all analytics logs for ads
      const { data: logs, error } = await supabase
        .from("action_logs")
        .select("entity_id, action, created_at")
        .eq("entity_type", "ad")
        .in("entity_id", adIds);

      if (error) {
        console.error("Error fetching metrics:", error);
        return;
      }

      // Calculate weekly date range
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

      const metricsMap: Record<string, AdMetrics> = {};

      // Initialize metrics for all ads
      adIds.forEach((id) => {
        metricsMap[id] = { views: 0, clicks: 0, weeklyViews: 0, weeklyClicks: 0 };
      });

      // Process logs
      (logs || []).forEach((log) => {
        if (!log.entity_id) return;
        
        const logDate = new Date(log.created_at);
        const isThisWeek = logDate >= weekStart && logDate <= weekEnd;

        if (log.action === "visit") {
          metricsMap[log.entity_id].views++;
          if (isThisWeek) {
            metricsMap[log.entity_id].weeklyViews++;
          }
        } else if (log.action === "click") {
          metricsMap[log.entity_id].clicks++;
          if (isThisWeek) {
            metricsMap[log.entity_id].weeklyClicks++;
          }
        }
      });

      setAdMetrics(metricsMap);
    } catch (error) {
      console.error("Error processing metrics:", error);
    }
  }

  // Enrich billings with ad title
  const enrichedBillings = useMemo(() => {
    return billings.map((b) => ({
      ...b,
      ad_title: ads.find((a) => a.id === b.ad_id)?.title || "Anúncio removido",
    }));
  }, [billings, ads]);

  // Filter ads that don't have billing yet
  const availableAds = useMemo(() => {
    const billedAdIds = billings.map((b) => b.ad_id);
    return ads.filter((a) => !billedAdIds.includes(a.id));
  }, [ads, billings]);

  function resetForm() {
    setFormData({
      ad_id: "",
      company_name: "",
      monthly_fee: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.ad_id || !formData.company_name || !formData.monthly_fee) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use today's day as billing_day (fixed due date)
      const billingDay = new Date().getDate();

      const { error } = await supabase.from("ad_billing").insert({
        ad_id: formData.ad_id,
        company_name: formData.company_name,
        monthly_fee: parseFloat(formData.monthly_fee),
        billing_day: billingDay,
      });

      if (error) throw error;

      toast.success("Cobrança cadastrada com sucesso");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar cobrança");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markAsPaid(billing: BillingRecord) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    try {
      // Insert payment for current month (doesn't change next due date)
      const { error } = await supabase.from("ad_billing_payments").insert({
        billing_id: billing.id,
        reference_month: currentMonth,
        reference_year: currentYear,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Este mês já foi marcado como pago");
          return;
        }
        throw error;
      }

      toast.success(`Pagamento de ${format(today, "MMMM/yyyy", { locale: ptBR })} registrado`);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar pagamento");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("ad_billing").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Cobrança removida");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover cobrança");
    } finally {
      setDeleteId(null);
    }
  }

  function generateWeeklyReport(billing: BillingRecord) {
    const metrics = adMetrics[billing.ad_id] || { weeklyViews: 0, weeklyClicks: 0 };
    
    const report = `Olá ${billing.company_name}, Notícias da semana sobre o seu anúncio na CompreCarrosBr! 🚀 O seu anúncio continua atraindo interessados! 📊 Relatório Rápido: Visualizações: ${metrics.weeklyViews} pessoas viram sua empresa. Interessados: ${metrics.weeklyClicks} cliques diretos no seu anúncio. Nossa plataforma está trabalhando para gerar visibilidade e novos clientes para você! Atenciosamente, Equipe CompreCarrosBr`;

    return report;
  }

  async function copyReportToClipboard(billing: BillingRecord) {
    const report = generateWeeklyReport(billing);
    
    try {
      await navigator.clipboard.writeText(report);
      toast.success("Relatório copiado para a área de transferência!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Erro ao copiar relatório");
    }
  }

  const pendingCount = useMemo(() => {
    return enrichedBillings.filter((b) => {
      const { status, isPastDue } = getBillingStatus(b.billing_day, payments, b.id);
      return status === "pending" && isPastDue;
    }).length;
  }, [enrichedBillings, payments]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Planilha Financeira</h1>
            <p className="text-muted-foreground">
              Gerencie cobranças mensais dos anúncios
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} disabled={availableAds.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Cobrança</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Anúncio *</Label>
                  <Select
                    value={formData.ad_id}
                    onValueChange={(v) => setFormData({ ...formData, ad_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o anúncio" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAds.map((ad) => (
                        <SelectItem key={ad.id} value={ad.id}>
                          {ad.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nome da Empresa *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    placeholder="Ex: Auto Mecânica Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor da Mensalidade (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthly_fee}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_fee: e.target.value })
                    }
                    placeholder="Ex: 150.00"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  O vencimento será fixado no dia de hoje ({new Date().getDate()}) de cada mês.
                </p>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Cadastrar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {pendingCount > 0 && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive font-medium">
                {pendingCount} cobrança{pendingCount > 1 ? "s" : ""} pendente{pendingCount > 1 ? "s" : ""}
              </span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cobranças Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : enrichedBillings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma cobrança cadastrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Anúncio</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Mensalidade</TableHead>
                      <TableHead className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                Views
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Total / Esta semana
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1">
                                <MousePointerClick className="h-4 w-4" />
                                Cliques
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Total / Esta semana
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedBillings.map((billing) => {
                      const { status, isPastDue } = getBillingStatus(
                        billing.billing_day,
                        payments,
                        billing.id
                      );
                      const isOverdue = status === "pending" && isPastDue;
                      const metrics = adMetrics[billing.ad_id] || { views: 0, clicks: 0, weeklyViews: 0, weeklyClicks: 0 };
                      const isPaid = status === "paid";

                      return (
                        <TableRow
                          key={billing.id}
                          className={isOverdue ? "bg-destructive/10" : ""}
                        >
                          <TableCell className="font-medium">
                            {billing.ad_title}
                          </TableCell>
                          <TableCell>{billing.company_name}</TableCell>
                          <TableCell>
                            Dia {billing.billing_day}
                          </TableCell>
                          <TableCell>
                            R$ {billing.monthly_fee.toFixed(2).replace(".", ",")}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-muted-foreground text-sm">
                              {metrics.views} / <span className="text-primary font-medium">{metrics.weeklyViews}</span>
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-muted-foreground text-sm">
                              {metrics.clicks} / <span className="text-primary font-medium">{metrics.weeklyClicks}</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            {status === "paid" ? (
                              <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                                Pago
                              </Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive">🔴 Pendente</Badge>
                            ) : (
                              <Badge variant="secondary">Aguardando</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Weekly Report Button - Only for paid companies */}
                              {isPaid && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 border-green-600/30 hover:bg-green-600/10"
                                        onClick={() => copyReportToClipboard(billing)}
                                      >
                                        <Copy className="h-4 w-4 mr-1" />
                                        Relatório
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Copiar relatório semanal para WhatsApp
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              
                              {status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsPaid(billing)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Pago
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteId(billing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover esta cobrança? O histórico de pagamentos será excluído.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}