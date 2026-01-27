import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Banner {
  id: string;
  image_url: string;
  image_desktop: string | null;
  image_mobile: string | null;
  is_active: boolean;
  position: number;
  click_type: string | null;
  click_target: string | null;
  whatsapp_number: string | null;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileDesktop, setFileDesktop] = useState<File | null>(null);
  const [fileMobile, setFileMobile] = useState<File | null>(null);
  const [previewDesktop, setPreviewDesktop] = useState<string | null>(null);
  const [previewMobile, setPreviewMobile] = useState<string | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [clickType, setClickType] = useState<"none" | "link" | "instagram" | "whatsapp">("none");
  const [clickTarget, setClickTarget] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const resetForm = () => {
    setFileDesktop(null);
    setFileMobile(null);
    setPreviewDesktop(null);
    setPreviewMobile(null);
    setPosition(0);
    setClickType("none");
    setClickTarget("");
    setWhatsappNumber("");
    setEditingBanner(null);
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("id, image_url, image_desktop, image_mobile, is_active, position, click_type, click_target, whatsapp_number")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

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

  const handleFileDesktopChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setFileDesktop(selected);
    if (selected) {
      setPreviewDesktop(URL.createObjectURL(selected));
    } else if (editingBanner) {
      setPreviewDesktop(editingBanner.image_desktop || editingBanner.image_url);
    } else {
      setPreviewDesktop(null);
    }
  };

  const handleFileMobileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setFileMobile(selected);
    if (selected) {
      setPreviewMobile(URL.createObjectURL(selected));
    } else if (editingBanner) {
      setPreviewMobile(editingBanner.image_mobile || editingBanner.image_url);
    } else {
      setPreviewMobile(null);
    }
  };

  const handleSave = async () => {
    // Validação: ambas imagens obrigatórias para novo banner
    if (!editingBanner && (!fileDesktop || !fileMobile)) {
      toast({
        title: "Selecione as duas imagens",
        description: "É necessário enviar uma imagem para Desktop (1920×840) e outra para Mobile (1080×1440).",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      let imageDesktopUrl = editingBanner?.image_desktop || editingBanner?.image_url || "";
      let imageMobileUrl = editingBanner?.image_mobile || editingBanner?.image_url || "";

      // Upload da imagem desktop se selecionada
      if (fileDesktop) {
        const fileExt = fileDesktop.name.split(".").pop();
        const filePath = `banner-desktop-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(filePath, fileDesktop, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("banners")
          .getPublicUrl(filePath);

        imageDesktopUrl = publicUrlData.publicUrl;
      }

      // Upload da imagem mobile se selecionada
      if (fileMobile) {
        const fileExt = fileMobile.name.split(".").pop();
        const filePath = `banner-mobile-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("banners")
          .upload(filePath, fileMobile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("banners")
          .getPublicUrl(filePath);

        imageMobileUrl = publicUrlData.publicUrl;
      }

      // click_type é NOT NULL no banco - sempre enviar valor válido
      const finalClickType = clickType || editingBanner?.click_type || "none";
      
      const payload = {
        image_url: imageDesktopUrl, // Mantém compatibilidade com coluna legada
        image_desktop: imageDesktopUrl,
        image_mobile: imageMobileUrl,
        position,
        click_type: finalClickType,
        click_target:
          finalClickType === "link" || finalClickType === "instagram" ? clickTarget || null : null,
        whatsapp_number:
          finalClickType === "whatsapp" ? whatsappNumber.replace(/\D/g, "") || null : null,
      };

      if (editingBanner) {
        const { error: updateError } = await supabase
          .from("banners")
          .update(payload)
          .eq("id", editingBanner.id);

        if (updateError) throw updateError;

        toast({
          title: "Banner atualizado",
          description: "As informações do banner foram salvas.",
        });
      } else {
        const { error: insertError } = await supabase.from("banners").insert(payload);

        if (insertError) throw insertError;

        toast({
          title: "Banner cadastrado",
          description: "O banner foi enviado com sucesso.",
        });
      }

      resetForm();
      await fetchBanners();
    } catch (error) {
      console.error("Error saving banner", error);
      toast({
        title: editingBanner ? "Erro ao atualizar banner" : "Erro ao enviar banner",
        description: "Verifique os dados e tente novamente.",
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

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setPosition(banner.position ?? 0);
    const type = (banner.click_type as "none" | "link" | "instagram" | "whatsapp") || "none";
    setClickType(type);
    setClickTarget(banner.click_target || "");
    setWhatsappNumber(banner.whatsapp_number || "");
    setPreviewDesktop(banner.image_desktop || banner.image_url);
    setPreviewMobile(banner.image_mobile || banner.image_url);
    setFileDesktop(null);
    setFileMobile(null);
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
            <CardTitle>{editingBanner ? "Editar banner" : "Cadastro de banner"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informação sobre tamanhos */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-medium text-primary">📐 Tamanhos oficiais</p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Desktop/Tablet:</strong> 1920 × 840 px (proporção 16:7)<br />
                <strong>Mobile:</strong> 1080 × 1440 px (proporção 3:4)
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Recomendado usar a mesma arte, adaptada para os dois tamanhos.
              </p>
            </div>

            {/* Upload Desktop */}
            <div className="space-y-2">
              <Label htmlFor="banner-desktop">Imagem para Desktop/Tablet (1920×840) *</Label>
              <Input
                id="banner-desktop"
                type="file"
                accept="image/*"
                onChange={handleFileDesktopChange}
              />
              {editingBanner && !fileDesktop && (
                <p className="text-xs text-muted-foreground break-all">
                  Imagem atual: <span className="underline">{editingBanner.image_desktop || editingBanner.image_url}</span>
                </p>
              )}
            </div>

            {/* Upload Mobile */}
            <div className="space-y-2">
              <Label htmlFor="banner-mobile">Imagem para Mobile (1080×1440) *</Label>
              <Input
                id="banner-mobile"
                type="file"
                accept="image/*"
                onChange={handleFileMobileChange}
              />
              {editingBanner && !fileMobile && (
                <p className="text-xs text-muted-foreground break-all">
                  Imagem atual: <span className="underline">{editingBanner.image_mobile || editingBanner.image_url}</span>
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="position">Posição do banner</Label>
                <Input
                  id="position"
                  type="number"
                  min={0}
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value) || 0)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Banners aparecem no site em ordem crescente de posição.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="click-type">Ação ao clicar</Label>
                <Select
                  value={clickType}
                  onValueChange={(value: "none" | "link" | "instagram" | "whatsapp") =>
                    setClickType(value)
                  }
                >
                  <SelectTrigger id="click-type">
                    <SelectValue placeholder="Nenhuma ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma ação</SelectItem>
                    <SelectItem value="link">Link de site</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {clickType === "whatsapp" ? (
                  <>
                    <Label htmlFor="whatsapp-number">Número do WhatsApp (com DDI)</Label>
                    <Input
                      id="whatsapp-number"
                      placeholder="Ex: 5565999999999"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      O clique abre o WhatsApp com mensagem automática do CompreCarrosBr.
                    </p>
                  </>
                ) : clickType === "link" || clickType === "instagram" ? (
                  <>
                    <Label htmlFor="click-target">
                      {clickType === "instagram" ? "Link do Instagram" : "Link do site"}
                    </Label>
                    <Input
                      id="click-target"
                      placeholder={
                        clickType === "instagram"
                          ? "Cole o link do perfil ou postagem"
                          : "Cole o link completo (https://...)"
                      }
                      value={clickTarget}
                      onChange={(e) => setClickTarget(e.target.value)}
                    />
                  </>
                ) : (
                  <div className="pt-6 text-[11px] text-muted-foreground">
                    Nenhuma ação configurada. O clique não redirecionará o usuário.
                  </div>
                )}
              </div>
            </div>

            {/* Previews */}
            {(previewDesktop || previewMobile) && (
              <div className="grid gap-4 md:grid-cols-2">
                {previewDesktop && (
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground mb-2">Desktop/Tablet (16:7)</p>
                    <div className="w-full overflow-hidden rounded-lg bg-muted aspect-[16/7]">
                      <img
                        src={previewDesktop}
                        alt="Preview Desktop"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {previewMobile && (
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground mb-2">Mobile (3:4)</p>
                    <div className="w-full max-w-[200px] overflow-hidden rounded-lg bg-muted aspect-[3/4]">
                      <img
                        src={previewMobile}
                        alt="Preview Mobile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={uploading}>
                {uploading
                  ? editingBanner
                    ? "Salvando..."
                    : "Enviando..."
                  : editingBanner
                    ? "Atualizar banner"
                    : "Salvar banner"}
              </Button>
              {editingBanner && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar edição
                </Button>
              )}
            </div>
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
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-muted aspect-[16/7] overflow-hidden rounded-t-lg">
                        <img
                          src={banner.image_desktop || banner.image_url}
                          alt="Desktop"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-muted aspect-[3/4] overflow-hidden rounded-t-lg max-h-20">
                        <img
                          src={banner.image_mobile || banner.image_url}
                          alt="Mobile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>Posição: <strong>{banner.position}</strong></span>
                        {banner.click_type && (
                          <span>
                            Clique: {banner.click_type === "whatsapp" ? "WhatsApp" : banner.click_type === "instagram" ? "Instagram" : "Link"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleEdit(banner)}
                          >
                            Editar
                          </Button>
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
