import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Check, Trash2, Pencil, DollarSign, TrendingDown, CircleCheck, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminGastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(() => format(new Date(), "yyyy-MM"));
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "outros",
    amount: "",
    notes: "",
    status: "pending",
    expense_date: format(new Date(), "yyyy-MM-dd"),
  });

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

  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    if (!filterMonth) return expenses;
    return expenses.filter((e) => e.expense_date.startsWith(filterMonth));
  }, [expenses, filterMonth]);

  const totalAmount = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const paidAmount = filteredExpenses.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pendingAmount = filteredExpenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);

  // Available months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((e) => months.add(e.expense_date.substring(0, 7)));
    // Always include current month
    months.add(format(new Date(), "yyyy-MM"));
    return Array.from(months).sort().reverse();
  }, [expenses]);

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      category: "outros",
      amount: "",
      notes: "",
      status: "pending",
      expense_date: format(new Date(), "yyyy-MM-dd"),
    });
    setEditingExpense(null);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      description: expense.description || "",
      category: expense.category,
      amount: String(expense.amount),
      notes: expense.notes || "",
      status: expense.status,
      expense_date: expense.expense_date,
    });
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
      const payload = {
        expense_date: formData.expense_date,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        amount: parseFloat(formData.amount),
        notes: formData.notes || null,
        status: formData.status,
      };

      if (editingExpense) {
        const { error } = await supabase.from("internal_expenses").update(payload).eq("id", editingExpense.id);
        if (error) throw error;
        toast.success("Gasto atualizado");
      } else {
        const { error } = await supabase.from("internal_expenses").insert(payload);
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

  async function toggleStatus(expense: Expense) {
    const newStatus = expense.status === "paid" ? "pending" : "paid";
    try {
      const { error } = await supabase.from("internal_expenses").update({ status: newStatus }).eq("id", expense.id);
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
      const { error } = await supabase.from("internal_expenses").delete().eq("id", deleteId);
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

  function formatMonthLabel(ym: string) {
    const [y, m] = ym.split("-");
    return format(new Date(Number(y), Number(m) - 1, 1), "MMMM yyyy", { locale: ptBR });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gastos Internos</h1>
            <p className="text-sm text-muted-foreground">Controle de despesas da plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((m) => (
                  <SelectItem key={m} value={m}>
                    {formatMonthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Novo Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingExpense ? "Editar Gasto" : "Novo Gasto"}</DialogTitle>
                  <DialogDescription>
                    {editingExpense ? "Atualize os dados." : "Registre uma nova despesa."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Data *</Label>
                      <Input
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Categoria</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Abastecimento"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Valor (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalhes opcionais..."
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : editingExpense ? "Atualizar" : "Cadastrar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatBRL(totalAmount)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CircleCheck className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Pagos</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatBRL(paidAmount)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground font-medium">Pendentes</span>
            </div>
            <p className="text-xl font-bold text-destructive">{formatBRL(pendingAmount)}</p>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="text-center py-12 text-muted-foreground">Carregando...</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Nenhum gasto neste período</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Data</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center w-[90px]">Status</TableHead>
                      <TableHead className="text-right w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(parseISO(expense.expense_date), "dd/MM/yy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium text-sm">{expense.name}</span>
                            {expense.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {expense.description}
                              </p>
                            )}
                            <span className="md:hidden text-xs text-muted-foreground">
                              {getCategoryLabel(expense.category)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {getCategoryLabel(expense.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {formatBRL(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => toggleStatus(expense)}
                            className="inline-flex"
                            title={expense.status === "paid" ? "Marcar como pendente" : "Marcar como pago"}
                          >
                            {expense.status === "paid" ? (
                              <Badge className="bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer text-xs">
                                Pago
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="cursor-pointer text-xs">
                                Pendente
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(expense)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(expense.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza que deseja remover este gasto?</AlertDialogDescription>
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
