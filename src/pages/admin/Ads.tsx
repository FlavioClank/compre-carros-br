import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon, Home, Search } from "lucide-react";

const AD_CATEGORIES = [
  { value: "mecanica", label: "Mecânica" },
  { value: "guincho", label: "Guincho" },
  { value: "borracharia", label: "Borracharia" },
  { value: "autoeletrica", label: "Autoelétrica" },
  { value: "funilaria", label: "Funilaria e Pintura" },
  { value: "lavagem", label: "Lavagem" },
  { value: "seguro", label: "Seguro" },
  { value: "financiamento", label: "Financiamento" },
  { value: "outros", label: "Outros" },
];

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
  is_active: boolean;
  created_at: string;
}

interface AdFormData {
  title: string;
  category: string;
  link: string;
  is_active: boolean;
}

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Separate image states for Home and Search
  const [imageFileHome, setImageFileHome] = useState<File | null>(null);
  const [imagePreviewHome, setImagePreviewHome] = useState<string | null>(null);
  const [imageDimsHome, setImageDimsHome] = useState<{ width: number; height: number } | null>(null);
  const [imageFileSearch, setImageFileSearch] = useState<File | null>(null);
  const [imagePreviewSearch, setImagePreviewSearch] = useState<string | null>(null);
  const [imageDimsSearch, setImageDimsSearch] = useState<{ width: number; height: number } | null>(null);
  
  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    category: "",
    link: "",
    is_active: true,
  });

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar anúncios");
      console.error(error);
    } else {
      setAds(data || []);
    }
    setIsLoading(false);
  }

  function resetForm() {
    setFormData({
      title: "",
      category: "",
      link: "",
      is_active: true,
    });
    setImageFileHome(null);
    setImagePreviewHome(null);
    setImageDimsHome(null);
    setImageFileSearch(null);
    setImagePreviewSearch(null);
    setImageDimsSearch(null);
    setEditingAd(null);
  }

  function openCreateDialog() {
    resetForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(ad: Ad) {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      category: ad.category,
      link: ad.link || "",
      is_active: ad.is_active,
    });
    setImagePreviewHome(ad.image_url_home);
    setImagePreviewSearch(ad.image_url_search);
    setImageDimsHome(null); // Will be loaded when image loads
    setImageDimsSearch(null);
    setImageFileHome(null);
    setImageFileSearch(null);
    setIsDialogOpen(true);
  }

  function validateImageDimensions(
    img: HTMLImageElement,
    type: "home" | "search"
  ): { valid: boolean; message?: string } {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const aspectRatio = width / height;

    if (type === "home") {
      // Home: aspect ratio 2:1 (tolerance: 1.8 to 2.2)
      const expectedRatio = 2;
      const minRatio = 1.8;
      const maxRatio = 2.2;
      
      if (aspectRatio < minRatio || aspectRatio > maxRatio) {
        return {
          valid: false,
          message: `Proporção incorreta para Home. Esperado: 2:1 (horizontal). Atual: ${aspectRatio.toFixed(2)}:1. Recomendado: 1200×600px`,
        };
      }
      
      if (width < 600 || height < 300) {
        return {
          valid: false,
          message: `Imagem muito pequena para Home. Mínimo: 600×300px. Atual: ${width}×${height}px`,
        };
      }
    } else {
      // Search: aspect ratio 16:9 (tolerance: 1.6 to 1.9)
      const expectedRatio = 16 / 9; // ~1.78
      const minRatio = 1.5;
      const maxRatio = 1.9;
      
      if (aspectRatio < minRatio || aspectRatio > maxRatio) {
        return {
          valid: false,
          message: `Proporção incorreta para Busca. Esperado: 16:9. Atual: ${aspectRatio.toFixed(2)}:1. Recomendado: 1600×900px`,
        };
      }
      
      if (width < 800 || height < 450) {
        return {
          valid: false,
          message: `Imagem muito pequena para Busca. Mínimo: 800×450px. Atual: ${width}×${height}px`,
        };
      }
    }

    return { valid: true };
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "home" | "search"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    // Create image to validate dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const validation = validateImageDimensions(img, type);
      URL.revokeObjectURL(objectUrl);

      if (!validation.valid) {
        toast.error(validation.message);
        e.target.value = "";
        return;
      }

      // Valid image - set preview and dimensions
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "home") {
          setImageFileHome(file);
          setImagePreviewHome(reader.result as string);
          setImageDimsHome({ width, height });
        } else {
          setImageFileSearch(file);
          setImagePreviewSearch(reader.result as string);
          setImageDimsSearch({ width, height });
        }
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Erro ao carregar imagem");
    };

    img.src = objectUrl;
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Erro ao fazer upload da imagem");
      return null;
    }

    const { data } = supabase.storage.from("ad-images").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    // Validate images for new ads
    if (!editingAd) {
      if (!imageFileHome) {
        toast.error("Selecione uma imagem para a Home");
        return;
      }
      if (!imageFileSearch) {
        toast.error("Selecione uma imagem para a Busca");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let imageUrlHome = editingAd?.image_url_home || "";
      let imageUrlSearch = editingAd?.image_url_search || "";

      // Upload Home image if changed
      if (imageFileHome) {
        const uploadedUrl = await uploadImage(imageFileHome);
        if (!uploadedUrl) {
          setIsSubmitting(false);
          return;
        }
        imageUrlHome = uploadedUrl;
      }

      // Upload Search image if changed
      if (imageFileSearch) {
        const uploadedUrl = await uploadImage(imageFileSearch);
        if (!uploadedUrl) {
          setIsSubmitting(false);
          return;
        }
        imageUrlSearch = uploadedUrl;
      }

      const adData = {
        title: formData.title,
        category: formData.category,
        image_url_home: imageUrlHome,
        image_url_search: imageUrlSearch,
        link: formData.link || null,
        is_active: formData.is_active,
      };

      if (editingAd) {
        const { error } = await supabase
          .from("ads")
          .update(adData)
          .eq("id", editingAd.id);

        if (error) throw error;
        toast.success("Anúncio atualizado com sucesso");
      } else {
        const { error } = await supabase.from("ads").insert(adData);
        if (error) throw error;
        toast.success("Anúncio criado com sucesso");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAds();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar anúncio");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteAdId) return;

    try {
      const { error } = await supabase.from("ads").delete().eq("id", deleteAdId);
      if (error) throw error;
      toast.success("Anúncio excluído com sucesso");
      fetchAds();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir anúncio");
    } finally {
      setDeleteAdId(null);
    }
  }

  async function toggleAdStatus(ad: Ad) {
    try {
      const { error } = await supabase
        .from("ads")
        .update({ is_active: !ad.is_active })
        .eq("id", ad.id);

      if (error) throw error;
      toast.success(ad.is_active ? "Anúncio desativado" : "Anúncio ativado");
      fetchAds();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao alterar status");
    }
  }

  function getCategoryLabel(value: string) {
    return AD_CATEGORIES.find((c) => c.value === value)?.label || value;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Anúncios</h1>
            <p className="text-muted-foreground">
              Gerencie os anúncios de estabelecimentos parceiros
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? "Editar Anúncio" : "Novo Anúncio"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Anúncio (uso interno) *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Auto Mecânica Silva"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image for HOME */}
                <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <Label htmlFor="image-home" className="font-medium">Imagem para HOME *</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Resolução recomendada: 1200 × 600 (horizontal)
                  </p>
                  <Input
                    id="image-home"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "home")}
                    className="cursor-pointer"
                  />
                  {imagePreviewHome && (
                    <div className="space-y-1">
                      <div className="relative w-full h-28 rounded-md overflow-hidden border">
                        <img
                          src={imagePreviewHome}
                          alt="Preview Home"
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            if (!imageDimsHome) {
                              const img = e.target as HTMLImageElement;
                              setImageDimsHome({ width: img.naturalWidth, height: img.naturalHeight });
                            }
                          }}
                        />
                      </div>
                      {imageDimsHome && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">
                            Atual: <span className="font-medium text-foreground">{imageDimsHome.width} × {imageDimsHome.height}px</span>
                          </span>
                          <span className="text-muted-foreground">
                            Recomendado: <span className="font-medium text-primary">1200 × 600px</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {!imagePreviewHome && (
                    <div className="flex items-center justify-center w-full h-28 bg-muted rounded-md border border-dashed">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-6 w-6 mb-1" />
                        <p className="text-xs">Imagem horizontal (2:1)</p>
                        <p className="text-[10px] mt-0.5">Recomendado: 1200 × 600px</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image for SEARCH */}
                <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <Label htmlFor="image-search" className="font-medium">Imagem para BUSCA *</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Resolução recomendada: 1600 × 900 (16:9)
                  </p>
                  <Input
                    id="image-search"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "search")}
                    className="cursor-pointer"
                  />
                  {imagePreviewSearch && (
                    <div className="space-y-1">
                      <div className="relative w-full h-28 rounded-md overflow-hidden border">
                        <img
                          src={imagePreviewSearch}
                          alt="Preview Busca"
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            if (!imageDimsSearch) {
                              const img = e.target as HTMLImageElement;
                              setImageDimsSearch({ width: img.naturalWidth, height: img.naturalHeight });
                            }
                          }}
                        />
                      </div>
                      {imageDimsSearch && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">
                            Atual: <span className="font-medium text-foreground">{imageDimsSearch.width} × {imageDimsSearch.height}px</span>
                          </span>
                          <span className="text-muted-foreground">
                            Recomendado: <span className="font-medium text-primary">1600 × 900px</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {!imagePreviewSearch && (
                    <div className="flex items-center justify-center w-full h-28 bg-muted rounded-md border border-dashed">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-6 w-6 mb-1" />
                        <p className="text-xs">Imagem 16:9</p>
                        <p className="text-[10px] mt-0.5">Recomendado: 1600 × 900px</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (opcional)</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="WhatsApp, site ou Instagram"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Anúncio ativo</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum anúncio cadastrado ainda.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro anúncio
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                {/* Show both images in admin */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="relative h-24">
                    {ad.image_url_home ? (
                      <img
                        src={ad.image_url_home}
                        alt={`${ad.title} - Home`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-[10px] px-1">
                      Home
                    </Badge>
                  </div>
                  <div className="relative h-24">
                    {ad.image_url_search ? (
                      <img
                        src={ad.image_url_search}
                        alt={`${ad.title} - Busca`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-[10px] px-1">
                      Busca
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryLabel(ad.category)}
                      </p>
                    </div>
                    <Badge variant={ad.is_active ? "default" : "secondary"}>
                      {ad.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  {ad.link && (
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Ver link
                    </a>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(ad)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdStatus(ad)}
                    >
                      {ad.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteAdId(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este anúncio? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
