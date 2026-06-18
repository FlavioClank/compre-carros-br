import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface WhatsappLog {
  id: string;
  phone_number: string;
  message: string;
  ai_response: string;
  created_at: string;
}

export default function AdminWhatsappLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-whatsapp-logs", dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("whatsapp_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WhatsappLog[];
    },
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    const s = searchTerm.toLowerCase().trim();
    if (!s) return logs;
    return logs.filter(
      (l) =>
        l.phone_number?.toLowerCase().includes(s) ||
        l.message?.toLowerCase().includes(s) ||
        l.ai_response?.toLowerCase().includes(s),
    );
  }, [logs, searchTerm]);

  const handleExportCsv = () => {
    if (!filteredLogs.length) {
      toast({ title: "Nada para exportar", variant: "destructive" });
      return;
    }
    const headers = ["Data/Hora", "Telefone", "Mensagem", "Resposta IA"];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = filteredLogs.map((l) =>
      [
        format(new Date(l.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
        l.phone_number,
        l.message,
        l.ai_response,
      ]
        .map(escape)
        .join(","),
    );
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whatsapp-logs-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado com sucesso" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Logs do WhatsApp
            </h1>
            <p className="text-muted-foreground mt-1">
              Histórico de interações do assistente virtual
            </p>
          </div>
          <Button onClick={handleExportCsv} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por telefone, mensagem ou resposta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">De</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Até</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversas ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Data/Hora</TableHead>
                      <TableHead className="whitespace-nowrap">Telefone</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Resposta IA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-sm">
                          {log.phone_number}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {log.message}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                            {log.ai_response}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
