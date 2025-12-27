import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";

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
  image_url: string;
  description: string | null;
  link: string | null;
  is_active: boolean;
  created_at: string;
}

interface AdFormData {
  title: string;
  category: string;
  description: string;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    category: "",
    description: "",
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
      description: "",
      link: "",
      is_active: true,
    });
    setImageFile(null);
    setImagePreview(null);
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
      description: ad.description || "",
      link: ad.link || "",
      is_active: ad.is_active,
    });
    setImagePreview(ad.image_url);
    setImageFile(null);
    setIsDialogOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (!editingAd && !imageFile) {
      toast.error("Selecione uma imagem para o anúncio");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = editingAd?.image_url || "";

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (!uploadedUrl) {
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const adData = {
        title: formData.title,
        category: formData.category,
        image_url: imageUrl,
        description: formData.description || null,
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
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? "Editar Anúncio" : "Novo Anúncio"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Estabelecimento *</Label>
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
                  <Label htmlFor="category">Tipo *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
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

                <div className="space-y-2">
                  <Label htmlFor="image">Imagem *</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative w-full h-40 rounded-md overflow-hidden border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!imagePreview && (
                      <div className="flex items-center justify-center w-full h-40 bg-muted rounded-md border border-dashed">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                          <p className="text-sm">Selecione uma imagem</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Breve descrição do estabelecimento"
                    rows={3}
                  />
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
                <div className="relative h-40">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    variant={ad.is_active ? "default" : "secondary"}
                    className="absolute top-2 right-2"
                  >
                    {ad.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(ad.category)}
                    </p>
                  </div>
                  {ad.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ad.description}
                    </p>
                  )}
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
      </div>

      <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O anúncio será removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
