import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, EyeOff, Edit, Power, Building2, KeyRound, Car, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface GarageFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export default function AdminGarages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingGarage, setDeletingGarage] = useState<any>(null);
  const [editingGarage, setEditingGarage] = useState<any>(null);
  const [resetPasswordGarage, setResetPasswordGarage] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<GarageFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // Fetch garages with profiles
  const { data: garages, isLoading } = useQuery({
    queryKey: ["admin-garages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("garages")
        .select("*, profiles(email, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create garage mutation using edge function for atomic operation
  const createGarageMutation = useMutation({
    mutationFn: async (data: GarageFormData) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const { data: result, error } = await supabase.functions.invoke("create-garage", {
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao criar garagem");
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      toast({ title: "Garagem criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-garages"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar garagem", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update garage mutation
  const updateGarageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GarageFormData> }) => {
      const { error } = await supabase
        .from("garages")
        .update({
          name: data.name,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Garagem atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-garages"] });
      setIsDialogOpen(false);
      setEditingGarage(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar garagem", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("garages")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.isActive ? "Garagem desativada!" : "Garagem ativada!",
        description: variables.isActive 
          ? "Todos os veículos desta garagem estão ocultos." 
          : "Os veículos desta garagem estão visíveis novamente."
      });
      queryClient.invalidateQueries({ queryKey: ["admin-garages"] });
    },
  });

  // Toggle can_add_vehicles permission
  const toggleCanAddVehiclesMutation = useMutation({
    mutationFn: async ({ id, canAdd }: { id: string; canAdd: boolean }) => {
      const { error } = await supabase
        .from("garages")
        .update({ can_add_vehicles: !canAdd })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.canAdd ? "Cadastro de veículos bloqueado!" : "Cadastro de veículos liberado!",
        description: variables.canAdd 
          ? "O garajista não pode mais cadastrar veículos." 
          : "O garajista pode cadastrar veículos novamente."
      });
      queryClient.invalidateQueries({ queryKey: ["admin-garages"] });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const { data: result, error } = await supabase.functions.invoke("reset-garage-password", {
        body: { userId, password },
      });

      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Senha redefinida com sucesso!" });
      setIsResetPasswordDialogOpen(false);
      setResetPasswordGarage(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao redefinir senha", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Delete garage mutation (CASCADE deletes all cars)
  const deleteGarageMutation = useMutation({
    mutationFn: async (garageId: string) => {
      const { error } = await supabase
        .from("garages")
        .delete()
        .eq("id", garageId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ 
        title: "Garagem excluída!", 
        description: "A garagem e todos os veículos vinculados foram removidos."
      });
      queryClient.invalidateQueries({ queryKey: ["admin-garages"] });
      setIsDeleteDialogOpen(false);
      setDeletingGarage(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir garagem", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      city: "",
      state: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGarage) {
      updateGarageMutation.mutate({ id: editingGarage.id, data: formData });
    } else {
      createGarageMutation.mutate(formData);
    }
  };

  const handleEdit = (garage: any) => {
    setEditingGarage(garage);
    setFormData({
      name: garage.name,
      email: garage.profiles?.email || "",
      password: "",
      phone: garage.phone || "",
      address: garage.address || "",
      city: garage.city || "",
      state: garage.state || "",
    });
    setIsDialogOpen(true);
  };

  const handleResetPassword = (garage: any) => {
    setResetPasswordGarage(garage);
    setNewPassword("");
    setIsResetPasswordDialogOpen(true);
  };

  const handleDelete = (garage: any) => {
    setDeletingGarage(garage);
    setIsDeleteDialogOpen(true);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Garagens</h1>
            <p className="text-muted-foreground mt-1">Gerencie as garagens do sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingGarage(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Garagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingGarage ? "Editar Garagem" : "Nova Garagem"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Garagem *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                {!editingGarage && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email de Acesso *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createGarageMutation.isPending || updateGarageMutation.isPending}
                >
                  {createGarageMutation.isPending || updateGarageMutation.isPending 
                    ? "Salvando..." 
                    : editingGarage ? "Salvar Alterações" : "Criar Garagem"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Garagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : garages && garages.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pode Cadastrar</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {garages.map((garage: any) => (
                      <TableRow key={garage.id} className={!garage.is_active ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{garage.name}</TableCell>
                        <TableCell>{garage.profiles?.email || "-"}</TableCell>
                        <TableCell>{garage.city || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={garage.is_active ? "default" : "secondary"}>
                            {garage.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={garage.can_add_vehicles}
                              onCheckedChange={() => toggleCanAddVehiclesMutation.mutate({
                                id: garage.id,
                                canAdd: garage.can_add_vehicles
                              })}
                            />
                            <span className="text-xs text-muted-foreground">
                              {garage.can_add_vehicles ? "Sim" : "Não"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(garage)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResetPassword(garage)}
                              title="Redefinir Senha"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActiveMutation.mutate({ 
                                id: garage.id, 
                                isActive: garage.is_active 
                              })}
                              title={garage.is_active ? "Desativar" : "Ativar"}
                            >
                              <Power className={`h-4 w-4 ${garage.is_active ? "text-success" : "text-muted-foreground"}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(garage)}
                              title="Excluir Garagem"
                              className="text-destructive hover:text-destructive"
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma garagem cadastrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redefinir Senha</DialogTitle>
            </DialogHeader>
            {resetPasswordGarage && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Redefinindo senha para: <strong>{resetPasswordGarage.name}</strong>
                  <br />
                  Email: {resetPasswordGarage.profiles?.email}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha *</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => resetPasswordMutation.mutate({ 
                    userId: resetPasswordGarage.user_id, 
                    password: newPassword 
                  })}
                  disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Processando..." : "Redefinir Senha"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Garagem</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Tem certeza que deseja excluir a garagem <strong>{deletingGarage?.name}</strong>?
                </p>
                <p className="text-destructive font-semibold">
                  ⚠️ Essa ação é irreversível. Todos os veículos vinculados a esta garagem serão excluídos permanentemente.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingGarage && deleteGarageMutation.mutate(deletingGarage.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteGarageMutation.isPending}
              >
                {deleteGarageMutation.isPending ? "Excluindo..." : "Excluir Definitivamente"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}