import { useQuery } from "@tanstack/react-query";
import { GarageLayout } from "@/components/layout/GarageLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GarageHistory() {
  // Fetch garage's sales history
  const { data: salesHistory, isLoading } = useQuery({
    queryKey: ["garage-sales-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_history")
        .select("*")
        .order("sold_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <GarageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Histórico de Vendas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe suas vendas realizadas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Minhas Vendas ({salesHistory?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : salesHistory && salesHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.map((sale: any) => {
                      const snapshot = sale.car_snapshot as any;
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {format(new Date(sale.sold_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{snapshot?.brand} {snapshot?.model}</p>
                              <p className="text-sm text-muted-foreground">{snapshot?.code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-accent">
                            {formatPrice(snapshot?.price || 0)}
                          </TableCell>
                          <TableCell className="max-w-32 truncate">
                            {sale.sold_reason || "-"}
                          </TableCell>
                          <TableCell>
                            {sale.confirmed_at ? (
                              sale.is_suspicious ? (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Suspeita
                                </Badge>
                              ) : (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Confirmada
                                </Badge>
                              )
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </GarageLayout>
  );
}
