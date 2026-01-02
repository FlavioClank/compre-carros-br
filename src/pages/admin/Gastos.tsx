import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Check, CalendarIcon, Trash2, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  expense_date: string;
  name: string;
  description: string | null;
  category: string;
  amount: number;
  notes: string | null;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "combustivel", label: "Combustível" },
  { value: "brindes", label: "Brindes" },
  { value: "propaganda", label: "Propaganda" },
  { value: "outdoor", label: "Outdoor" },
  { value: "sistemas", label: "Sistemas Pagos" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "manutencao", label: "Manutenção" },
  { value: "outros", label: "Outros" },
];

export default function AdminGastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "outros",
    amount: "",
    notes: "",
    status: "pending",
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("internal_expenses")
      .select("*")
      .order("expense_date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar gastos");
      console.error(error);
    } else {
      setExpenses(data || []);
    }

    setIsLoading(false);
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      category: "outros",
      amount: "",
      notes: "",
      status: "pending",
    });
    setSelectedDate(new Date());
    setEditingExpense(null);
  }

  function openEditDialog(expense: Expense) {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      description: expense.description || "",
      category: expense.category,
      amount: String(expense.amount),
      notes: expense.notes || "",
      status: expense.status,
    });
    setSelectedDate(parseISO(expense.expense_date));
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.amount) {
      toast.error("Preencha nome e valor");
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        expense_date: format(selectedDate, "yyyy-MM-dd"),
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        amount: parseFloat(formData.amount),
        notes: formData.notes || null,
        status: formData.status,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from("internal_expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);

        if (error) throw error;
        toast.success("Gasto atualizado");
      } else {
        const { error } = await supabase
          .from("internal_expenses")
          .insert(expenseData);

        if (error) throw error;
        toast.success("Gasto cadastrado");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar gasto");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function togglePaidStatus(expense: Expense) {
    const newStatus = expense.status === "paid" ? "pending" : "paid";
    
    try {
      const { error } = await supabase
        .from("internal_expenses")
        .update({ status: newStatus })
        .eq("id", expense.id);

      if (error) throw error;
      toast.success(newStatus === "paid" ? "Marcado como pago" : "Marcado como pendente");
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("internal_expenses")
        .delete()
        .eq("id", deleteId);
      
      if (error) throw error;
      toast.success("Gasto removido");
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover gasto");
    } finally {
      setDeleteId(null);
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidAmount = expenses.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);

  function getCategoryLabel(value: string) {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gastos Internos</h1>
            <p className="text-muted-foreground">
              Controle de despesas administrativas
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Editar Gasto" : "Novo Gasto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Abastecimento"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes do gasto..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observação</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anotações adicionais..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : editingExpense ? "Atualizar" : "Cadastrar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Geral</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalAmount.toFixed(2).replace(".", ",")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pagos</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {paidAmount.toFixed(2).replace(".", ",")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-destructive">
                R$ {pendingAmount.toFixed(2).replace(".", ",")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum gasto cadastrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow
                        key={expense.id}
                        className={expense.status === "pending" ? "bg-red-50 dark:bg-red-950/20" : ""}
                      >
                        <TableCell className="whitespace-nowrap">
                          {format(parseISO(expense.expense_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                          {expense.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(expense.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {expense.amount.toFixed(2).replace(".", ",")}
                        </TableCell>
                        <TableCell>
                          {expense.status === "paid" ? (
                            <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">
                              🟢 Pago
                            </Badge>
                          ) : (
                            <Badge variant="destructive">🔴 Pendente</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePaidStatus(expense)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                Tem certeza que deseja remover este gasto?
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