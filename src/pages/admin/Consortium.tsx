import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Handshake,
  Download,
  Archive,
  ArchiveRestore,
  Settings,
  Users,
  FileSpreadsheet,
  FileText,
  Search,
  Phone,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  encaminhado: "Encaminhado",
  em_negociacao: "Em negociação",
  fechado: "Fechado",
  nao_fechou: "Não fechou",
};

const STATUS_COLORS: Record<string, string> = {
  novo: "bg-blue-100 text-blue-800",
  encaminhado: "bg-yellow-100 text-yellow-800",
  em_negociacao: "bg-purple-100 text-purple-800",
  fechado: "bg-green-100 text-green-800",
  nao_fechou: "bg-red-100 text-red-800",
};

interface Lead {
  id: string;
  name: string;
  birth_date: string;
  email: string;
  cpf: string;
  phone: string;
  vehicle_info: string | null;
  vehicle_id: string | null;
  status: string;
  is_archived: boolean;
  created_at: string;
}

interface ConsortiumSettings {
  id: string;
  is_enabled: boolean;
  whatsapp_number: string;
}

export default function AdminConsortium() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ConsortiumSettings | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [settingsRes, leadsRes] = await Promise.all([
      supabase.from("consortium_settings").select("*").limit(1).single(),
      supabase
        .from("consortium_leads")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (settingsRes.data) {
      setSettings(settingsRes.data as ConsortiumSettings);
      setWhatsappInput(settingsRes.data.whatsapp_number || "");
    }
    if (leadsRes.data) {
      setLeads(leadsRes.data as Lead[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleEnabled = async () => {
    if (!settings) return;
    const newValue = !settings.is_enabled;
    const { error } = await supabase
      .from("consortium_settings")
      .update({ is_enabled: newValue, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSettings({ ...settings, is_enabled: newValue });
      toast({ title: newValue ? "Consórcio ativado" : "Consórcio desativado" });
    }
  };

  const saveWhatsapp = async () => {
    if (!settings) return;
    const { error } = await supabase
      .from("consortium_settings")
      .update({ whatsapp_number: whatsappInput, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSettings({ ...settings, whatsapp_number: whatsappInput });
      toast({ title: "WhatsApp atualizado com sucesso" });
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from("consortium_leads")
      .update({ status: newStatus as any, updated_at: new Date().toISOString() })
      .eq("id", leadId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    }
  };

  const toggleArchive = async (leadId: string, archive: boolean) => {
    const { error } = await supabase
      .from("consortium_leads")
      .update({ is_archived: archive, updated_at: new Date().toISOString() })
      .eq("id", leadId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, is_archived: archive } : l))
      );
      toast({ title: archive ? "Lead arquivado" : "Lead restaurado" });
    }
  };

  const archiveAll = async () => {
    const activeIds = filteredLeads.filter((l) => !l.is_archived).map((l) => l.id);
    if (activeIds.length === 0) return;
    const { error } = await supabase
      .from("consortium_leads")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .in("id", activeIds);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setLeads((prev) =>
        prev.map((l) => (activeIds.includes(l.id) ? { ...l, is_archived: true } : l))
      );
      toast({ title: `${activeIds.length} leads arquivados` });
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (showArchived !== l.is_archived) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !l.name.toLowerCase().includes(term) &&
          !l.email.toLowerCase().includes(term) &&
          !l.cpf.includes(term) &&
          !l.phone.includes(term)
        )
          return false;
      }
      if (dateFrom && l.created_at < dateFrom) return false;
      if (dateTo && l.created_at > dateTo + "T23:59:59") return false;
      return true;
    });
  }, [leads, showArchived, statusFilter, searchTerm, dateFrom, dateTo]);

  const exportCSV = () => {
    const headers = ["Nome", "Data Nascimento", "Email", "CPF", "Celular", "Veículo", "Status", "Data Cadastro"];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.birth_date,
      l.email,
      l.cpf,
      l.phone,
      l.vehicle_info || "",
      STATUS_LABELS[l.status] || l.status,
      new Date(l.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consorcio-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printContent = `
      <html><head><title>Leads Consórcio</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        h1 { font-size: 18px; margin-bottom: 10px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 15px; }
      </style></head><body>
      <h1>Leads de Consórcio</h1>
      <p class="meta">Exportado em: ${new Date().toLocaleString("pt-BR")} | Total: ${filteredLeads.length} leads</p>
      <table>
        <thead><tr><th>Nome</th><th>Nascimento</th><th>Email</th><th>CPF</th><th>Celular</th><th>Veículo</th><th>Status</th><th>Cadastro</th></tr></thead>
        <tbody>
        ${filteredLeads
          .map(
            (l) => `<tr>
            <td>${l.name}</td>
            <td>${l.birth_date}</td>
            <td>${l.email}</td>
            <td>${l.cpf}</td>
            <td>${l.phone}</td>
            <td>${l.vehicle_info || "-"}</td>
            <td>${STATUS_LABELS[l.status] || l.status}</td>
            <td>${new Date(l.created_at).toLocaleString("pt-BR")}</td>
          </tr>`
          )
          .join("")}
        </tbody>
      </table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(printContent);
      w.document.close();
      w.print();
    }
  };

  const activeCount = leads.filter((l) => !l.is_archived).length;
  const archivedCount = leads.filter((l) => l.is_archived).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-sidebar-foreground flex items-center gap-2">
              <Handshake className="h-6 w-6" />
              Consórcio
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie o botão de consórcio e leads de interessados
            </p>
          </div>
        </div>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ativar botão de Consórcio</p>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, o botão aparece nas páginas dos veículos
                </p>
              </div>
              <Switch checked={settings?.is_enabled || false} onCheckedChange={toggleEnabled} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp do Consórcio
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="5565999999999"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={saveWhatsapp} size="sm">
                  Salvar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formato: código do país + DDD + número (ex: 5565999999999)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leads Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Leads ({showArchived ? archivedCount : activeCount})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={showArchived ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowArchived(false)}
                >
                  Ativos ({activeCount})
                </Button>
                <Button
                  variant={showArchived ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowArchived(true)}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Arquivados ({archivedCount})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
                placeholder="De"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
                placeholder="Até"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Exportar Excel/CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF}>
                <FileText className="h-4 w-4 mr-1" />
                Exportar PDF
              </Button>
              {!showArchived && filteredLeads.length > 0 && (
                <Button variant="outline" size="sm" onClick={archiveAll}>
                  <Archive className="h-4 w-4 mr-1" />
                  Arquivar todos visíveis
                </Button>
              )}
            </div>

            {/* Table */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {showArchived ? "Nenhum lead arquivado" : "Nenhum lead encontrado"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Celular</TableHead>
                      <TableHead className="hidden lg:table-cell">CPF</TableHead>
                      <TableHead className="hidden lg:table-cell">Veículo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <button
                            className="text-left hover:underline font-medium"
                            onClick={() => setSelectedLead(lead)}
                          >
                            {lead.name}
                          </button>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{lead.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{lead.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell">{lead.cpf}</TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                          {lead.vehicle_info || "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(v) => updateLeadStatus(lead.id, v)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <Badge className={`${STATUS_COLORS[lead.status]} text-xs`}>
                                {STATUS_LABELS[lead.status]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleArchive(lead.id, !lead.is_archived)}
                            title={lead.is_archived ? "Restaurar" : "Arquivar"}
                          >
                            {lead.is_archived ? (
                              <ArchiveRestore className="h-4 w-4" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-3 text-sm">
              <div><strong>Nome:</strong> {selectedLead.name}</div>
              <div><strong>Data de Nascimento:</strong> {selectedLead.birth_date}</div>
              <div><strong>Email:</strong> {selectedLead.email}</div>
              <div><strong>CPF:</strong> {selectedLead.cpf}</div>
              <div><strong>Celular:</strong> {selectedLead.phone}</div>
              <div><strong>Veículo:</strong> {selectedLead.vehicle_info || "-"}</div>
              <div>
                <strong>Status:</strong>{" "}
                <Badge className={`${STATUS_COLORS[selectedLead.status]} text-xs`}>
                  {STATUS_LABELS[selectedLead.status]}
                </Badge>
              </div>
              <div><strong>Cadastro:</strong> {new Date(selectedLead.created_at).toLocaleString("pt-BR")}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
