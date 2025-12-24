import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { History, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [notes, setNotes] = useState("");

  // Fetch sales history
  const { data: salesHistory, isLoading } = useQuery({
    queryKey: ["admin-sales-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_history")
        .select("*, garages(name)")
        .order("sold_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Confirm sale mutation
  const confirmSaleMutation = useMutation({
    mutationFn: async ({ id, isSuspicious }: { id: string; isSuspicious: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("sales_history")
        .update({
          confirmed_at: new Date().toISOString(),
          confirmed_by: user?.id,
          is_suspicious: isSuspicious,
          notes: notes || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Venda atualizada!" });
      queryClient.invalidateQueries({ queryKey: ["admin-sales-history"] });
      setSelectedSale(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar venda", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setNotes(sale.notes || "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Histórico de Vendas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe todas as vendas realizadas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Vendas ({salesHistory?.length || 0})
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
                      <TableHead>Garagem</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
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
                          <TableCell>{sale.garages?.name || "-"}</TableCell>
                          <TableCell className="max-w-32 truncate">
                            {sale.sold_reason || "-"}
                          </TableCell>
                          <TableCell>
                            {sale.confirmed_at ? (
                              <Badge variant={sale.is_suspicious ? "destructive" : "default"}>
                                {sale.is_suspicious ? "Suspeita" : "Confirmada"}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pendente</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(sale)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Sale Details Dialog */}
        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Venda</DialogTitle>
            </DialogHeader>
            {selectedSale && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Veículo</p>
                    <p className="font-medium">
                      {(selectedSale.car_snapshot as any)?.brand} {(selectedSale.car_snapshot as any)?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Código</p>
                    <p className="font-mono">{(selectedSale.car_snapshot as any)?.code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Preço</p>
                    <p className="font-semibold text-accent">
                      {formatPrice((selectedSale.car_snapshot as any)?.price || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Garagem</p>
                    <p>{selectedSale.garages?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data da Venda</p>
                    <p>{format(new Date(selectedSale.sold_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Motivo</p>
                    <p>{selectedSale.sold_reason || "-"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Observações do Admin</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações sobre esta venda..."
                    rows={3}
                  />
                </div>

                {!selectedSale.confirmed_at && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => confirmSaleMutation.mutate({ id: selectedSale.id, isSuspicious: false })}
                      disabled={confirmSaleMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Venda
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => confirmSaleMutation.mutate({ id: selectedSale.id, isSuspicious: true })}
                      disabled={confirmSaleMutation.isPending}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Marcar Suspeita
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
