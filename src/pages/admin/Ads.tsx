import { useState, useEffect } from "react";
import { smartSlug, MAX_SLUG_LENGTH } from "@/lib/utils";
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon, Home, Search, Copy, Link } from "lucide-react";
import { getPartnerPublicUrl } from "@/lib/partner-utils";

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
  slug: string | null;
  category: string;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
  is_active: boolean;
  created_at: string;
  click_type?: string | null;
  click_target?: string | null;
  whatsapp_number?: string | null;
}

interface AdFormData {
  title: string;
  slug: string;
  category: string;
  click_type: "link" | "instagram" | "whatsapp";
  click_target: string;
  whatsapp_number: string;
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
    slug: "",
    category: "",
    click_type: "link",
    click_target: "",
    whatsapp_number: "",
    is_active: true,
  });

  // Normaliza o slug com abreviação inteligente e limite de 15 chars.
  function normalizeSlug(input: string): string {
    return smartSlug(input);
  }

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
      slug: "",
      category: "",
      click_type: "link",
      click_target: "",
      whatsapp_number: "",
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
      slug: ad.slug || "",
      category: ad.category,
      click_type: (ad.click_type as "link" | "instagram" | "whatsapp") || "link",
      click_target: ad.click_target || ad.link || "",
      whatsapp_number: ad.whatsapp_number || "",
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

    // Create image to get dimensions (no validation, just info)
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(objectUrl);

      // Accept any image - set preview and dimensions
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
    
    if (!formData.title || !formData.category || !formData.slug) {
      toast.error("Preencha os campos obrigatórios (incluindo slug)");
      return;
    }

    // Normalize the slug
    const normalizedSlug = normalizeSlug(formData.slug);
    if (!normalizedSlug) {
      toast.error("O slug deve conter pelo menos um caractere válido");
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
        slug: normalizedSlug,
        category: formData.category,
        image_url_home: imageUrlHome,
        image_url_search: imageUrlSearch,
        // Legacy link column kept for backward compatibility (uses click_target when applicable)
        link:
          formData.click_type === "whatsapp" ? null : formData.click_target || null,
        is_active: formData.is_active,
        click_type: formData.click_type,
        click_target:
          formData.click_type === "whatsapp" ? null : formData.click_target || null,
        whatsapp_number:
          formData.click_type === "whatsapp"
            ? formData.whatsapp_number.replace(/\D/g, "") || null
            : null,
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

  function copyAdLink(ad: Ad) {
    const url = getPartnerPublicUrl(ad);
    navigator.clipboard.writeText(url);
    toast.success("Link copiado: " + url);
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
                  <Label htmlFor="slug">Slug do link (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      const normalized = normalizeSlug(e.target.value);
                      setFormData({ ...formData, slug: normalized });
                    }}
                    placeholder="Ex: armazemautolatas"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Usado na URL: {window.location.origin}/anuncio/<strong>{formData.slug || "slug"}</strong>
                  </p>
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
                    Resolução recomendada: 1200 × 260 px
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
                      <div className="relative w-full h-20 rounded-md overflow-hidden border">
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
                          Recomendado: <span className="font-medium text-primary">1200 × 260px</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {!imagePreviewHome && (
                    <div className="flex items-center justify-center w-full h-20 bg-muted rounded-md border border-dashed">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-5 w-5 mb-1" />
                        <p className="text-xs">Imagem horizontal</p>
                        <p className="text-[10px] mt-0.5">Recomendado: 1200 × 260px</p>
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
                  <Label htmlFor="click-type">Destino do clique</Label>
                  <Select
                    value={formData.click_type}
                    onValueChange={(value: "link" | "instagram" | "whatsapp") =>
                      setFormData((prev) => ({ ...prev, click_type: value }))
                    }
                  >
                    <SelectTrigger id="click-type">
                      <SelectValue placeholder="Selecione o tipo de link" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link de site</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {formData.click_type === "whatsapp" ? (
                    <>
                      <Label htmlFor="whatsapp-number">Número do WhatsApp (com DDI)</Label>
                      <Input
                        id="whatsapp-number"
                        value={formData.whatsapp_number}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            whatsapp_number: e.target.value,
                          }))
                        }
                        placeholder="Ex: 5565999999999"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        O clique abre o WhatsApp com mensagem automática do CompreCarrosBr.
                      </p>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="link">Link</Label>
                      <Input
                        id="link"
                        value={formData.click_target}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            click_target: e.target.value,
                          }))
                        }
                        placeholder={
                          formData.click_type === "instagram"
                            ? "Cole o link do Instagram"
                            : "Cole o link completo (https://...)"
                        }
                      />
                    </>
                  )}
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
                  {/* Slug/URL section */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono truncate max-w-[180px]" title={ad.slug || ""}>
                      /{ad.slug || "sem-slug"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyAdLink(ad)}
                      title="Copiar link"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <a href={getPartnerPublicUrl(ad)} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-6 w-6" title="Abrir página">
                        <Link className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                  {ad.link && (
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Ver link externo
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
