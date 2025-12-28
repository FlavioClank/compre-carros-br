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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Power, Tags, Car, Bike } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BrandCategory = 'car' | 'motorcycle';

export default function AdminBrands() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", logo_url: "", category: "car" as BrandCategory });

  // Fetch brands
  const { data: brands, isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (data: { name: string; logo_url: string; category: BrandCategory }) => {
      const { error } = await supabase.from("brands").insert({
        name: data.name,
        logo_url: data.logo_url || null,
        category: data.category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Marca criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar marca", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; logo_url: string; category: BrandCategory } }) => {
      const { error } = await supabase
        .from("brands")
        .update({
          name: data.name,
          logo_url: data.logo_url || null,
          category: data.category,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Marca atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      setIsDialogOpen(false);
      setEditingBrand(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar marca", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("brands")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Status atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", logo_url: "", category: "car" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createBrandMutation.mutate(formData);
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo_url: brand.logo_url || "",
      category: brand.category || "car",
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Marcas</h1>
            <p className="text-muted-foreground mt-1">Gerencie as marcas de veículos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingBrand(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Marca
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingBrand ? "Editar Marca" : "Nova Marca"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selector */}
                <div className="space-y-2">
                  <Label>Tipo de Veículo *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'car' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.category === 'car'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Car className="h-5 w-5" />
                      <span className="font-medium">Carro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'motorcycle' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.category === 'motorcycle'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Bike className="h-5 w-5" />
                      <span className="font-medium">Moto</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Marca *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {formData.logo_url && (
                  <div className="flex justify-center p-4 bg-muted rounded-lg">
                    <img 
                      src={formData.logo_url} 
                      alt="Preview" 
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                >
                  {createBrandMutation.isPending || updateBrandMutation.isPending 
                    ? "Salvando..." 
                    : editingBrand ? "Salvar Alterações" : "Criar Marca"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Lista de Marcas ({brands?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : brands && brands.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.map((brand: any) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          {brand.logo_url ? (
                            <img 
                              src={brand.logo_url} 
                              alt={brand.name}
                              className="h-10 w-14 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              Sem logo
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {brand.category === 'motorcycle' ? (
                              <><Bike className="h-3 w-3" /> Moto</>
                            ) : (
                              <><Car className="h-3 w-3" /> Carro</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={brand.is_active ? "default" : "secondary"}>
                            {brand.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(brand)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActiveMutation.mutate({ 
                                id: brand.id, 
                                isActive: brand.is_active 
                              })}
                            >
                              <Power className={`h-4 w-4 ${brand.is_active ? "text-success" : "text-muted-foreground"}`} />
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
                Nenhuma marca cadastrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
