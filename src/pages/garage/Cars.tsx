import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GarageLayout } from "@/components/layout/GarageLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Package, CheckCircle, Upload, X, ImagePlus, Car, Bike } from "lucide-react";
import { 
  formatPrice, 
  formatMileage, 
  FUEL_LABELS,
  CAR_FUEL_LABELS,
  MOTORCYCLE_FUEL_LABELS,
  TRANSMISSION_LABELS,
  COOLING_TYPE_LABELS,
  MOTORCYCLE_CATEGORY_LABELS,
  CATEGORY_LABELS
} from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

type FuelType = Database["public"]["Enums"]["fuel_type"];
type TransmissionType = Database["public"]["Enums"]["transmission_type"];
type VehicleCategory = 'car' | 'motorcycle';

interface CarFormData {
  category: VehicleCategory;
  brand_id: string;
  model: string;
  year: number;
  model_year: number | null;
  version: string;
  mileage: number | null;
  transmission: TransmissionType;
  fuel: FuelType;
  color: string;
  price: number;
  description: string;
  photos: string[];
  // Motorcycle-specific fields
  engine_cc: number | null;
  cooling_type: string | null;
  motorcycle_category: string | null;
}

const initialFormData: CarFormData = {
  category: "car",
  brand_id: "",
  model: "",
  year: new Date().getFullYear(),
  model_year: null,
  version: "",
  mileage: null,
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

export default function GarageCars() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [sellingCar, setSellingCar] = useState<any>(null);
  const [soldReason, setSoldReason] = useState("");
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch garage's cars
  const { data: cars, isLoading } = useQuery({
    queryKey: ["garage-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, brands(name, logo_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch brands filtered by selected category (car or motorcycle)
  const { data: brands } = useQuery({
    queryKey: ["brands-select", formData.category],
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

  // Get garage info including permission
  const { data: garage } = useQuery({
    queryKey: ["my-garage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("garages")
        .select("id, can_add_vehicles")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Create car mutation
  const createCarMutation = useMutation({
    mutationFn: async (data: CarFormData) => {
      if (!garage?.id) throw new Error("Garagem não encontrada");
      
      const insertData: any = {
        garage_id: garage.id,
        category: data.category,
        brand_id: data.brand_id,
        model: data.model,
        year: data.year,
        model_year: data.model_year,
        version: data.version || null,
        mileage: data.mileage,
        fuel: data.fuel,
        color: data.color,
        price: data.price,
        description: data.description || null,
        photos: data.photos.length > 0 ? data.photos : null,
        code: "TEMP",
      };

      // Add car-specific fields
      if (data.category === 'car') {
        insertData.transmission = data.transmission;
      }

      // Add motorcycle-specific fields
      if (data.category === 'motorcycle') {
        insertData.engine_cc = data.engine_cc;
        insertData.cooling_type = data.cooling_type;
        insertData.motorcycle_category = data.motorcycle_category;
        insertData.transmission = 'manual'; // Default for motorcycles
      }

      const { error } = await supabase.from("cars").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Veículo cadastrado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["garage-cars"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao cadastrar veículo", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CarFormData> }) => {
      const updateData: any = {
        category: data.category,
        brand_id: data.brand_id,
        model: data.model,
        year: data.year,
        model_year: data.model_year,
        version: data.version || null,
        mileage: data.mileage,
        fuel: data.fuel,
        color: data.color,
        price: data.price,
        description: data.description || null,
        photos: data.photos && data.photos.length > 0 ? data.photos : null,
      };

      // Add car-specific fields
      if (data.category === 'car') {
        updateData.transmission = data.transmission;
        updateData.engine_cc = null;
        updateData.cooling_type = null;
        updateData.motorcycle_category = null;
      }

      // Add motorcycle-specific fields
      if (data.category === 'motorcycle') {
        updateData.engine_cc = data.engine_cc;
        updateData.cooling_type = data.cooling_type;
        updateData.motorcycle_category = data.motorcycle_category;
        updateData.transmission = 'manual';
      }

      const { error } = await supabase
        .from("cars")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Veículo atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["garage-cars"] });
      setIsDialogOpen(false);
      setEditingCar(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar veículo", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Mark as sold mutation
  const markAsSoldMutation = useMutation({
    mutationFn: async ({ carId, reason }: { carId: string; reason: string }) => {
      // Get car details for snapshot
      const { data: car, error: carError } = await supabase
        .from("cars")
        .select("*, brands(name)")
        .eq("id", carId)
        .single();
      if (carError) throw carError;

      // Update car status
      const { error: updateError } = await supabase
        .from("cars")
        .update({
          status: "sold",
          sold_at: new Date().toISOString(),
          sold_reason: reason,
        })
        .eq("id", carId);
      if (updateError) throw updateError;

      // Create sales history record
      const { error: historyError } = await supabase.from("sales_history").insert({
        car_id: carId,
        garage_id: car.garage_id,
        sold_reason: reason,
        car_snapshot: {
          code: car.code,
          brand_id: car.brand_id, // Store brand_id for future reference
          brand: car.brands?.name, // Keep brand name for display
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
      queryClient.invalidateQueries({ queryKey: ["garage-cars"] });
      setIsSellDialogOpen(false);
      setSellingCar(null);
      setSoldReason("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao marcar como vendido", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setPreviewPhotos([]);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewPhotos(prev => [...prev, ...newPreviews]);
    
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload photos to storage
  const uploadPhotos = async (): Promise<string[]> => {
    if (previewPhotos.length === 0) return formData.photos;
    
    setIsUploading(true);
    const uploadedUrls: string[] = [...formData.photos];
    
    try {
      for (const { file } of previewPhotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${garage?.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("car-photos")
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("car-photos")
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
      
      return uploadedUrls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const photos = await uploadPhotos();
      const dataWithPhotos = { ...formData, photos };
      
      if (editingCar) {
        updateCarMutation.mutate({ id: editingCar.id, data: dataWithPhotos });
      } else {
        createCarMutation.mutate(dataWithPhotos);
      }
      
      // Cleanup preview URLs
      previewPhotos.forEach(p => URL.revokeObjectURL(p.preview));
      setPreviewPhotos([]);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar fotos",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setFormData({
      category: car.category || 'car',
      brand_id: car.brand_id,
      model: car.model,
      year: car.year,
      model_year: car.model_year || null,
      version: car.version || "",
      mileage: car.mileage ?? null,
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

  const handleSell = (car: any) => {
    setSellingCar(car);
    setIsSellDialogOpen(true);
  };

  const removePhoto = (index: number) => {
    setFormData({ 
      ...formData, 
      photos: formData.photos.filter((_, i) => i !== index) 
    });
  };

  const removePreviewPhoto = (index: number) => {
    URL.revokeObjectURL(previewPhotos[index].preview);
    setPreviewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (category: VehicleCategory) => {
    // Reset fields that are category-specific AND clear brand (different brands per category)
    setFormData(prev => ({
      ...prev,
      category,
      // Clear brand since brands are different per category
      brand_id: "",
      // Reset car-specific fields
      transmission: category === 'car' ? 'automatic' : 'manual',
      // Set appropriate fuel defaults
      fuel: category === 'car' ? 'flex' : 'gasoline',
      // Reset motorcycle-specific fields
      engine_cc: category === 'motorcycle' ? prev.engine_cc : null,
      cooling_type: category === 'motorcycle' ? (prev.cooling_type && ['air', 'liquid'].includes(prev.cooling_type) ? prev.cooling_type : 'air') : null,
      motorcycle_category: category === 'motorcycle' ? prev.motorcycle_category : null,
    }));
  };

  const availableCars = cars?.filter((car: any) => car.status === "available");
  const soldCars = cars?.filter((car: any) => car.status === "sold");

  return (
    <GarageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Meus Veículos</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus veículos cadastrados</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCar(null);
              resetForm();
            }
          }}>
            {(garage?.can_add_vehicles || editingCar) && (
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Veículo
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCar ? "Editar Veículo" : "Novo Veículo"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Vehicle Type Selector - TOP OF FORM */}
                <div className="space-y-2">
                  <Label>Tipo de Veículo *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('car')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
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
                      onClick={() => handleCategoryChange('motorcycle')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
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

                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano (Fabricação) *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                      min={1900}
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model_year">Ano do Modelo</Label>
                    <Input
                      id="model_year"
                      type="number"
                      value={formData.model_year || ''}
                      onChange={(e) => setFormData({ ...formData, model_year: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Ex: 2023"
                      min={1900}
                      max={new Date().getFullYear() + 2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Versão</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder={formData.category === 'car' ? "Ex: LTZ, Titanium..." : "Ex: ABS, CBS..."}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Quilometragem *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                      required
                      min={0}
                    />
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

                {/* CAR-SPECIFIC FIELDS */}
                {formData.category === 'car' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transmission">Câmbio *</Label>
                      <Select 
                        value={formData.transmission} 
                        onValueChange={(value) => setFormData({ ...formData, transmission: value as TransmissionType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRANSMISSION_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel">Combustível *</Label>
                      <Select 
                        value={formData.fuel} 
                        onValueChange={(value) => setFormData({ ...formData, fuel: value as FuelType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CAR_FUEL_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* MOTORCYCLE-SPECIFIC FIELDS */}
                {formData.category === 'motorcycle' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="engine_cc">Cilindradas (cc) *</Label>
                        <Input
                          id="engine_cc"
                          type="number"
                          value={formData.engine_cc || ''}
                          onChange={(e) => setFormData({ ...formData, engine_cc: parseInt(e.target.value) || null })}
                          placeholder="Ex: 160, 300, 600..."
                          required
                          min={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cooling_type">Refrigeração *</Label>
                        <Select 
                          value={formData.cooling_type || ''} 
                          onValueChange={(value) => setFormData({ ...formData, cooling_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(COOLING_TYPE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="motorcycle_category">Categoria da Moto *</Label>
                        <Select 
                          value={formData.motorcycle_category || ''} 
                          onValueChange={(value) => setFormData({ ...formData, motorcycle_category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(MOTORCYCLE_CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuel">Combustível *</Label>
                        <Select 
                          value={formData.fuel} 
                          onValueChange={(value) => setFormData({ ...formData, fuel: value as FuelType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(MOTORCYCLE_FUEL_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min={0}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Detalhes do veículo..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fotos</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Selecionar Fotos
                  </Button>
                  
                  {/* Preview of already uploaded photos */}
                  {formData.photos.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fotos salvas:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.photos.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Foto ${index + 1}`} 
                              className="h-16 w-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Preview of new photos to upload */}
                  {previewPhotos.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Novas fotos ({previewPhotos.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {previewPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={photo.preview} 
                              alt={`Nova foto ${index + 1}`} 
                              className="h-16 w-20 object-cover rounded border-2 border-primary/50"
                            />
                            <button
                              type="button"
                              onClick={() => removePreviewPhoto(index)}
                              className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2"
                  disabled={createCarMutation.isPending || updateCarMutation.isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 animate-pulse" />
                      Enviando fotos...
                    </>
                  ) : createCarMutation.isPending || updateCarMutation.isPending ? (
                    "Salvando..."
                  ) : editingCar ? (
                    "Salvar Alterações"
                  ) : (
                    "Cadastrar Veículo"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Available Cars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Veículos Disponíveis ({availableCars?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : availableCars && availableCars.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>KM</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableCars.map((car: any) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <Badge variant={car.category === 'motorcycle' ? 'secondary' : 'default'}>
                            {car.category === 'motorcycle' ? (
                              <Bike className="h-3 w-3 mr-1" />
                            ) : (
                              <Car className="h-3 w-3 mr-1" />
                            )}
                            {CATEGORY_LABELS[car.category] || 'Carro'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{car.code}</TableCell>
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
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{formatMileage(car.mileage)}</TableCell>
                        <TableCell className="font-semibold text-accent">
                          {formatPrice(car.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(car)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-success"
                              onClick={() => handleSell(car)}
                            >
                              <CheckCircle className="h-4 w-4" />
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
                Nenhum veículo disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sold Cars */}
        {soldCars && soldCars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Veículos Vendidos ({soldCars.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soldCars.map((car: any) => (
                      <TableRow key={car.id} className="opacity-60">
                        <TableCell>
                          <Badge variant="outline">
                            {car.category === 'motorcycle' ? (
                              <Bike className="h-3 w-3 mr-1" />
                            ) : (
                              <Car className="h-3 w-3 mr-1" />
                            )}
                            {CATEGORY_LABELS[car.category] || 'Carro'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{car.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{car.brands?.name}</p>
                            <p className="text-sm text-muted-foreground">{car.model}</p>
                          </div>
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(car.price)}
                        </TableCell>
                        <TableCell className="max-w-32 truncate">
                          {car.sold_reason || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sell Dialog */}
        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como Vendido</DialogTitle>
            </DialogHeader>
            {sellingCar && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você está marcando o veículo <strong>{sellingCar.brands?.name} {sellingCar.model}</strong> ({sellingCar.code}) como vendido.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="sold_reason">Motivo da Venda *</Label>
                  <Textarea
                    id="sold_reason"
                    value={soldReason}
                    onChange={(e) => setSoldReason(e.target.value)}
                    rows={3}
                    placeholder="Descreva o motivo da venda..."
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => markAsSoldMutation.mutate({ carId: sellingCar.id, reason: soldReason })}
                  disabled={!soldReason.trim() || markAsSoldMutation.isPending}
                >
                  {markAsSoldMutation.isPending ? "Processando..." : "Confirmar Venda"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GarageLayout>
  );
}