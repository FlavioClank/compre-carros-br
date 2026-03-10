import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
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
  Plus,
  Edit,
  Car,
  Bike,
  Upload,
  X,
  ImagePlus,
  Copy,
  Link,
  CheckCircle,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  formatPrice,
  formatMileage,
  generateWhatsAppUrl,
  WHATSAPP_NUMBER,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  COOLING_TYPE_LABELS,
  MOTORCYCLE_CATEGORY_LABELS,
} from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type FuelType = Database["public"]["Enums"]["fuel_type"];
type TransmissionType = Database["public"]["Enums"]["transmission_type"];
type VehicleCategory = "car" | "motorcycle";

interface CarFormData {
  garage_id: string;
  category: VehicleCategory;
  brand_id: string;
  model: string;
  year: number;
  model_year: number | null;
  version: string;
  mileage: number;
  transmission: TransmissionType;
  fuel: FuelType;
  color: string;
  price: number;
  description: string;
  photos: string[];
  engine_cc: number | null;
  cooling_type: string | null;
  motorcycle_category: string | null;
}

const initialFormData: CarFormData = {
  garage_id: "",
  category: "car",
  brand_id: "",
  model: "",
  year: new Date().getFullYear(),
  model_year: null,
  version: "",
  mileage: 0,
  transmission: "automatic",
  fuel: "flex",
  color: "",
  price: 0,
  description: "",
  photos: [],
  engine_cc: null,
  cooling_type: null,
  motorcycle_category: null,
};

export default function AdminCars() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [garageFilter, setGarageFilter] = useState<string>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCar, setDeletingCar] = useState<any>(null);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [sellingCar, setSellingCar] = useState<any>(null);
  const [soldReason, setSoldReason] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [previewPhotos, setPreviewPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch garages for filter and form
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

  // Fetch brands filtered by selected category (for form)
  const { data: brands } = useQuery({
    queryKey: ["brands-select-admin", formData.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, category")
        .eq("is_active", true)
        .eq("category", formData.category)
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
          : "O veículo aparecerá em destaque na home.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar destaque",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete car mutation (SuperAdmin only)
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
        variant: "destructive",
      });
    },
  });

  // Mark as sold mutation (reuses garage logic)
  const markAsSoldMutation = useMutation({
    mutationFn: async ({ carId, reason }: { carId: string; reason: string }) => {
      const { data: car, error: carError } = await supabase
        .from("cars")
        .select("*, brands(name)")
        .eq("id", carId)
        .single();
      if (carError) throw carError;

      const { error: updateError } = await supabase
        .from("cars")
        .update({
          status: "sold",
          sold_at: new Date().toISOString(),
          sold_reason: reason,
        })
        .eq("id", carId);
      if (updateError) throw updateError;

      const { error: historyError } = await supabase.from("sales_history").insert({
        car_id: carId,
        garage_id: car.garage_id,
        sold_reason: reason,
        car_snapshot: {
          code: car.code,
          brand_id: car.brand_id,
          brand: car.brands?.name,
          model: car.model,
          year: car.year,
          version: car.version,
          price: car.price,
          mileage: car.mileage,
          color: car.color,
          category: car.category,
        },
      });
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      toast({ title: "Veículo marcado como vendido!" });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      setIsSellDialogOpen(false);
      setSellingCar(null);
      setSoldReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao marcar como vendido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (category: VehicleCategory) => {
    setFormData((prev) => ({
      ...prev,
      category,
      brand_id: "",
      transmission: category === "car" ? "automatic" : "manual",
      fuel: category === "car" ? "flex" : "gasoline",
      engine_cc: category === "motorcycle" ? prev.engine_cc : null,
      cooling_type:
        category === "motorcycle"
          ? prev.cooling_type && ["air", "liquid"].includes(prev.cooling_type)
            ? prev.cooling_type
            : "air"
          : null,
      motorcycle_category: category === "motorcycle" ? prev.motorcycle_category : null,
    }));
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setFormData({
      garage_id: car.garage_id,
      category: (car.category as VehicleCategory) || "car",
      brand_id: car.brand_id,
      model: car.model,
      year: car.year,
      version: car.version || "",
      mileage: car.mileage,
      transmission: car.transmission,
      fuel: car.fuel,
      color: car.color,
      price: car.price,
      description: car.description || "",
      photos: car.photos || [],
      engine_cc: car.engine_cc || null,
      cooling_type: car.cooling_type || null,
      motorcycle_category: car.motorcycle_category || null,
    });
    setPreviewPhotos([]);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPreviewPhotos([]);
    setEditingCar(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviewPhotos((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const removePreviewPhoto = (index: number) => {
    URL.revokeObjectURL(previewPhotos[index].preview);
    setPreviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (previewPhotos.length === 0) return formData.photos;

    setIsUploading(true);
    const uploadedUrls: string[] = [...formData.photos];

    try {
      for (const { file } of previewPhotos) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const targetGarageId = formData.garage_id || editingCar?.garage_id;
        const filePath = `${targetGarageId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("car-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("car-photos").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } finally {
      setIsUploading(false);
    }
  };

  const createCarMutation = useMutation({
    mutationFn: async (data: CarFormData) => {
      if (!data.garage_id) throw new Error("Selecione uma garagem");

      const insertData: any = {
        garage_id: data.garage_id,
        category: data.category,
        brand_id: data.brand_id,
        model: data.model,
        year: data.year,
        version: data.version || null,
        mileage: data.mileage,
        fuel: data.fuel,
        color: data.color,
        price: data.price,
        description: data.description || null,
        photos: data.photos.length > 0 ? data.photos : null,
        code: "TEMP",
      };

      if (data.category === "car") {
        insertData.transmission = data.transmission;
      }

      if (data.category === "motorcycle") {
        insertData.engine_cc = data.engine_cc;
        insertData.cooling_type = data.cooling_type;
        insertData.motorcycle_category = data.motorcycle_category;
        insertData.transmission = "manual";
      }

      const { error } = await supabase.from("cars").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Veículo cadastrado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CarFormData }) => {
      if (!data.garage_id) throw new Error("Selecione uma garagem");

      const updateData: any = {
        garage_id: data.garage_id,
        category: data.category,
        brand_id: data.brand_id,
        model: data.model,
        year: data.year,
        version: data.version || null,
        mileage: data.mileage,
        fuel: data.fuel,
        color: data.color,
        price: data.price,
        description: data.description || null,
        photos: data.photos && data.photos.length > 0 ? data.photos : null,
      };

      if (data.category === "car") {
        updateData.transmission = data.transmission;
        updateData.engine_cc = null;
        updateData.cooling_type = null;
        updateData.motorcycle_category = null;
      }

      if (data.category === "motorcycle") {
        updateData.engine_cc = data.engine_cc;
        updateData.cooling_type = data.cooling_type;
        updateData.motorcycle_category = data.motorcycle_category;
        updateData.transmission = "manual";
      }

      const { error } = await supabase
        .from("cars")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Veículo atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const photos = await uploadPhotos();
      const dataWithPhotos: CarFormData = { ...formData, photos };

      if (editingCar) {
        updateCarMutation.mutate({ id: editingCar.id, data: dataWithPhotos });
      } else {
        createCarMutation.mutate(dataWithPhotos);
      }

      previewPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPreviewPhotos([]);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar fotos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCars = cars?.filter((car: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      car.model?.toLowerCase().includes(searchLower) ||
      car.brands?.name?.toLowerCase().includes(searchLower) ||
      car.code?.toLowerCase().includes(searchLower)
    );
  });

  const getWhatsAppShareUrl = (car: any) => {
    const message = `🚗 *${car.brands?.name} ${car.model}*\n\n📅 Ano: ${car.year}\n⚙️ Versão: ${car.version || "-"}\n💰 Preço: ${formatPrice(
      car.price,
    )}\n📍 Código: ${car.code}\n\n🔗 Veja mais detalhes: /carro/${car.id}`;
    return generateWhatsAppUrl(WHATSAPP_NUMBER, message);
  };

  const getFacebookShareUrl = (car: any) => {
    const url = `${window.location.origin}/carro/${car.id}`;
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  };

  const copyInstagramText = (car: any) => {
    const text = `🚗 ${car.brands?.name} ${car.model} ${car.year}\n💰 ${formatPrice(
      car.price,
    )}\n📍 ${car.code}\n\n📲 Entre em contato via WhatsApp!`;
    navigator.clipboard.writeText(text);
    toast({ title: "Texto copiado!", description: "Cole no Instagram para publicar." });
  };

  const copyTikTokText = (car: any) => {
    const text = `🚗 ${car.brands?.name} ${car.model} ${car.year} - ${formatPrice(
      car.price,
    )} - Código: ${car.code}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Texto copiado!", description: "Cole no TikTok para publicar." });
  };

  const SITE_URL = "https://comprecarrosbr.com.br";

  const getCarPublicUrl = (car: any) => {
    return `${SITE_URL}/carro/${car.slug || car.id}`;
  };

  const copyCarLink = (car: any) => {
    const url = getCarPublicUrl(car);
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", description: url });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground mt-1">Gerencie todos os veículos do sistema</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <Button
              className="gap-2"
              onClick={() => {
                setEditingCar(null);
                setFormData(initialFormData);
                setPreviewPhotos([]);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Novo Veículo
            </Button>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCar ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de veículo */}
                <div className="space-y-2">
                  <Label>Tipo de Veículo *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("car")}
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        formData.category === "car"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Car className="h-5 w-5" />
                      <span className="font-medium">Carro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("motorcycle")}
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        formData.category === "motorcycle"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Bike className="h-5 w-5" />
                      <span className="font-medium">Moto</span>
                    </button>
                  </div>
                </div>

                {/* Garagem, marca, modelo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="garage_id">Garagem *</Label>
                    <Select
                      value={formData.garage_id}
                      onValueChange={(value) => setFormData({ ...formData, garage_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a garagem" />
                      </SelectTrigger>
                      <SelectContent>
                        {garages?.map((garage: any) => (
                          <SelectItem key={garage.id} value={garage.id}>
                            {garage.name} {!garage.is_active && "(Inativa)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_id">Marca *</Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Ano, km, preço */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: Number(e.target.value || new Date().getFullYear()) })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Quilometragem *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value || 0) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value || 0) })}
                      required
                    />
                  </div>
                </div>

                {/* Combustível, câmbio / campos de moto */}
                {formData.category === "car" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label>Combustível *</Label>
                    <Select
                      value={formData.fuel}
                      onValueChange={(value) => setFormData({ ...formData, fuel: value as FuelType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FUEL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Câmbio *</Label>
                      <Select
                        value={formData.transmission}
                        onValueChange={(value) =>
                          setFormData({ ...formData, transmission: value as TransmissionType })
                        }
                      >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRANSMISSION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Cor *</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label>Combustível *</Label>
                    <Select
                      value={formData.fuel}
                      onValueChange={(value) => setFormData({ ...formData, fuel: value as FuelType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FUEL_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cilindradas (cc)</Label>
                      <Input
                        type="number"
                        value={formData.engine_cc ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            engine_cc: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                    <Label>Refrigeração</Label>
                    <Select
                      value={formData.cooling_type ?? ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, cooling_type: value || null })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COOLING_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                )}

                {formData.category === "motorcycle" && (
                  <div className="space-y-2">
                    <Label>Categoria da moto</Label>
                    <Select
                      value={formData.motorcycle_category ?? ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, motorcycle_category: value || null })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MOTORCYCLE_CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Versão e descrição */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Versão</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Fotos */}
                <div className="space-y-2">
                  <Label>Fotos</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.photos.map((url, index) => (
                      <div key={url} className="relative h-20 w-28 rounded-md overflow-hidden border">
                        <img
                          src={url}
                          alt={`Foto ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {previewPhotos.map((photo, index) => (
                      <div key={photo.preview} className="relative h-20 w-28 rounded-md overflow-hidden border">
                        <img
                          src={photo.preview}
                          alt="Pré-visualização"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePreviewPhoto(index)}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-xs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Enviando..." : "Adicionar fotos"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createCarMutation.isPending || updateCarMutation.isPending}>
                    {editingCar
                      ? updateCarMutation.isPending
                        ? "Salvando..."
                        : "Atualizar veículo"
                      : createCarMutation.isPending
                      ? "Salvando..."
                      : "Salvar veículo"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                      <TableHead>Slug/URL</TableHead>
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
                            {car.is_featured && <Sparkles className="h-4 w-4 text-accent" />}
                            {car.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {car.photos?.[0] && (
                              <OptimizedImage
                                src={car.photos[0]}
                                alt={car.model}
                                width={80}
                                height={56}
                                quality={60}
                                className="h-10 w-14 object-cover rounded"
                                containerClassName="h-10 w-14 rounded"
                                showSkeleton={false}
                              />
                            )}
                            <div>
                              <p className="font-medium">{car.brands?.name}</p>
                              <p className="text-sm text-muted-foreground">{car.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground font-mono max-w-[150px] truncate" title={car.slug || car.id}>
                              {car.slug || car.id.slice(0, 8) + "..."}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyCarLink(car)}
                              title="Copiar link"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <a href={getCarPublicUrl(car)} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-6 w-6" title="Abrir página">
                                <Link className="h-3 w-3" />
                              </Button>
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell className="font-semibold text-accent">{formatPrice(car.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {car.garages?.name || "-"}
                            {car.garages && !car.garages.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inativa
                              </Badge>
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
                              onClick={() => handleEdit(car)}
                              title="Editar veículo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleFeaturedMutation.mutate({
                                  id: car.id,
                                  isFeatured: car.is_featured,
                                })
                              }
                              title={car.is_featured ? "Remover destaque" : "Marcar como destaque"}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  car.is_featured ? "text-accent fill-accent" : ""
                                }`}
                              />
                            </Button>
                            <a href={`/carro/${car.id}`} target="_blank" rel="noopener noreferrer">
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
                            {car.status === "available" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSellingCar(car);
                                  setIsSellDialogOpen(true);
                                }}
                                title="Marcar como vendido"
                                className="text-accent hover:text-accent"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
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
              <div className="text-center py-8 text-muted-foreground">Nenhum veículo encontrado</div>
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
                <p className="text-destructive font-semibold">⚠️ Essa ação é irreversível.</p>
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

        {/* Sell Confirmation Dialog */}
        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como Vendido</DialogTitle>
            </DialogHeader>
            {sellingCar && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Deseja realmente marcar o veículo{" "}
                  <strong>
                    {sellingCar.brands?.name} {sellingCar.model}
                  </strong>{" "}
                  ({sellingCar.code}) como vendido?
                </p>
                <div className="space-y-2">
                  <Label htmlFor="admin_sold_reason">Motivo da Venda *</Label>
                  <Textarea
                    id="admin_sold_reason"
                    value={soldReason}
                    onChange={(e) => setSoldReason(e.target.value)}
                    rows={3}
                    placeholder="Descreva o motivo da venda..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsSellDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() =>
                      markAsSoldMutation.mutate({ carId: sellingCar.id, reason: soldReason })
                    }
                    disabled={!soldReason.trim() || markAsSoldMutation.isPending}
                  >
                    {markAsSoldMutation.isPending ? "Processando..." : "Confirmar Venda"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
