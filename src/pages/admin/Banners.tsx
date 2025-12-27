import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Banner {
  id: string;
  image_url: string;
  is_active: boolean;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("id, image_url, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching banners", error);
      toast({
        title: "Erro ao carregar banners",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } else {
      setBanners(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Selecione uma imagem",
        description: "Escolha um arquivo de imagem para o banner.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("banners").insert({
        image_url: imageUrl,
      });

      if (insertError) throw insertError;

      toast({
        title: "Banner cadastrado",
        description: "O banner foi enviado com sucesso.",
      });

      setFile(null);
      setPreviewUrl(null);
      await fetchBanners();
    } catch (error) {
      console.error("Error uploading banner", error);
      toast({
        title: "Erro ao enviar banner",
        description: "Verifique a imagem e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);

    if (error) {
      console.error("Error updating banner", error);
      toast({
        title: "Erro ao atualizar banner",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } else {
      fetchBanners();
    }
  };

  const handleDelete = async (banner: Banner) => {
    const { error } = await supabase.from("banners").delete().eq("id", banner.id);

    if (error) {
      console.error("Error deleting banner", error);
      toast({
        title: "Erro ao excluir banner",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Banner removido",
        description: "O banner foi excluído.",
      });
      fetchBanners();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Banners
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie as imagens exibidas no topo da Home.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro de banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="banner-image">Imagem do banner</Label>
              <Input
                id="banner-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                Prefira imagens em proporção horizontal (16:5), Full HD ou superiores. A imagem será ajustada automaticamente sem cortes.
              </p>
            </div>

            {previewUrl && (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground mb-2">Pré-visualização</p>
                <div className="w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Pré-visualização do banner"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Enviando..." : "Salvar banner"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banners cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : banners.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum banner cadastrado até o momento.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                  >
                    <div className="w-full bg-muted flex items-center justify-center aspect-[16/5]">
                      <img
                        src={banner.image_url}
                        alt="Banner"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${banner.id}`}
                          checked={banner.is_active}
                          onCheckedChange={() => handleToggleActive(banner)}
                        />
                        <Label
                          htmlFor={`active-${banner.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          {banner.is_active ? "Ativo" : "Inativo"}
                        </Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleDelete(banner)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
