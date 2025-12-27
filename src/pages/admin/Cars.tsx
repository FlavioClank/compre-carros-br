import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Search, 
  ExternalLink,
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { formatPrice, formatMileage, generateWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminCars() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [garageFilter, setGarageFilter] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCar, setDeletingCar] = useState<any>(null);

  // Fetch all cars with brand and garage
  const { data: cars, isLoading } = useQuery({
    queryKey: ["admin-cars", statusFilter, garageFilter],
    queryFn: async () => {
      let query = supabase
        .from("cars")
        .select("*, brands(name, logo_url), garages(name, is_active)")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (statusFilter === "available" || statusFilter === "sold") {
        query = query.eq("status", statusFilter);
      }
      if (garageFilter !== "all") {
        query = query.eq("garage_id", garageFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch garages for filter
  const { data: garages } = useQuery({
    queryKey: ["admin-garages-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("garages")
        .select("id, name, is_active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from("cars")
        .update({ is_featured: !isFeatured })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: variables.isFeatured ? "Destaque removido!" : "Veículo em destaque!",
        description: variables.isFeatured 
          ? "O veículo não aparecerá mais em destaque." 
          : "O veículo aparecerá em destaque na home."
      });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar destaque", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: async (carId: string) => {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", carId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Veículo excluído com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      setIsDeleteDialogOpen(false);
      setDeletingCar(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir veículo", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const filteredCars = cars?.filter((car: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      car.model?.toLowerCase().includes(searchLower) ||
      car.brands?.name?.toLowerCase().includes(searchLower) ||
      car.code?.toLowerCase().includes(searchLower)
    );
  });

  const getWhatsAppShareUrl = (car: any) => {
    const message = `🚗 *${car.brands?.name} ${car.model}*\n\n📅 Ano: ${car.year}\n⚙️ Versão: ${car.version || "-"}\n💰 Preço: ${formatPrice(car.price)}\n📍 Código: ${car.code}\n\n🔗 Veja mais detalhes: /carro/${car.id}`;
    return generateWhatsAppUrl(WHATSAPP_NUMBER, message);
  };

  const getFacebookShareUrl = (car: any) => {
    const url = `${window.location.origin}/carro/${car.id}`;
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  };

  const shareOnInstagram = (car: any) => {
    const text = `🚗 ${car.brands?.name} ${car.model} ${car.year}\n💰 ${formatPrice(car.price)}\n📍 ${car.code}\n\n📲 Entre em contato via WhatsApp!`;
    navigator.clipboard.writeText(text);
    toast({ title: "Texto copiado!", description: "Cole no Instagram para publicar." });
  };

  const copyInstagramText = (car: any) => {
    const text = `🚗 ${car.brands?.name} ${car.model} ${car.year}\n💰 ${formatPrice(car.price)}\n📍 ${car.code}\n\n📲 Entre em contato via WhatsApp!`;
    navigator.clipboard.writeText(text);
    toast({ title: "Texto copiado!", description: "Cole no Instagram para publicar." });
  };

  const copyTikTokText = (car: any) => {
    const text = `🚗 ${car.brands?.name} ${car.model} ${car.year} - ${formatPrice(car.price)} - Código: ${car.code}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Texto copiado!", description: "Cole no TikTok para publicar." });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os veículos do sistema</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por marca, modelo ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={garageFilter} onValueChange={setGarageFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Garagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Garagens</SelectItem>
                  {garages?.map((garage: any) => (
                    <SelectItem key={garage.id} value={garage.id}>
                      {garage.name} {!garage.is_active && "(Inativa)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cars Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Veículos ({filteredCars?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredCars && filteredCars.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Garagem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCars.map((car: any) => (
                      <TableRow key={car.id} className={!car.garages?.is_active ? "opacity-50" : ""}>
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            {car.is_featured && (
                              <Sparkles className="h-4 w-4 text-accent" />
                            )}
                            {car.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {car.photos?.[0] && (
                              <img 
                                src={car.photos[0]} 
                                alt={car.model} 
                                className="h-10 w-14 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{car.brands?.name}</p>
                              <p className="text-sm text-muted-foreground">{car.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell className="font-semibold text-accent">
                          {formatPrice(car.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {car.garages?.name || "-"}
                            {car.garages && !car.garages.is_active && (
                              <Badge variant="secondary" className="text-xs">Inativa</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={car.status === "available" ? "default" : "secondary"}>
                            {car.status === "available" ? "Disponível" : "Vendido"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeaturedMutation.mutate({ 
                                id: car.id, 
                                isFeatured: car.is_featured 
                              })}
                              title={car.is_featured ? "Remover destaque" : "Marcar como destaque"}
                            >
                              <Star className={`h-4 w-4 ${car.is_featured ? "text-accent fill-accent" : ""}`} />
                            </Button>
                            <a 
                              href={`/carro/${car.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a
                                    href={getWhatsAppShareUrl(car)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyInstagramText(car)}>
                                  <Instagram className="h-4 w-4 mr-2" />
                                  Instagram
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={getFacebookShareUrl(car)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                  >
                                    <Facebook className="h-4 w-4 mr-2" />
                                    Facebook
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyTikTokText(car)}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  TikTok
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingCar(car);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Excluir Veículo"
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
                Nenhum veículo encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Tem certeza que deseja excluir o veículo{" "}
                  <strong>
                    {deletingCar?.brands?.name} {deletingCar?.model} ({deletingCar?.code})
                  </strong>
                  ?
                </p>
                <p className="text-destructive font-semibold">
                  ⚠️ Essa ação é irreversível.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingCar && deleteCarMutation.mutate(deletingCar.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCarMutation.isPending}
              >
                {deleteCarMutation.isPending ? "Excluindo..." : "Excluir Definitivamente"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}