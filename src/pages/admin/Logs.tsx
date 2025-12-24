import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const actionColors: Record<string, string> = {
  create: "bg-success text-success-foreground",
  update: "bg-accent text-accent-foreground",
  delete: "bg-destructive text-destructive-foreground",
  login: "bg-primary text-primary-foreground",
  logout: "bg-secondary text-secondary-foreground",
  sold: "bg-warning text-warning-foreground",
};

const entityLabels: Record<string, string> = {
  car: "Veículo",
  garage: "Garagem",
  brand: "Marca",
  user: "Usuário",
  sale: "Venda",
};

export default function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  // Fetch logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-logs", entityFilter, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from("action_logs")
        .select("*, profiles:user_id(email, name)")
        .order("created_at", { ascending: false })
        .limit(500);

      if (entityFilter !== "all") {
        query = query.eq("entity_type", entityFilter);
      }
      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = logs?.filter((log: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.entity_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.profiles?.email?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.details)?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Logs de Ações</h1>
          <p className="text-muted-foreground mt-1">Histórico de todas as ações do sistema</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nos logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Entidades</SelectItem>
                  <SelectItem value="car">Veículo</SelectItem>
                  <SelectItem value="garage">Garagem</SelectItem>
                  <SelectItem value="brand">Marca</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  <SelectItem value="create">Criar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="delete">Excluir</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs ({filteredLogs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.profiles?.name || "Sistema"}</p>
                            <p className="text-xs text-muted-foreground">{log.profiles?.email || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entityLabels[log.entity_type] || log.entity_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || "bg-muted"}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.details ? (
                            <code className="text-xs bg-muted p-1 rounded block truncate">
                              {JSON.stringify(log.details)}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
