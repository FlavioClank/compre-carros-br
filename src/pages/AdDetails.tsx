import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, ExternalLink, Loader2 } from "lucide-react";
import { generateWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/constants";
import { trackClick, trackView } from "@/lib/analytics";
import { format } from "date-fns";
import { getAdPublicUrl } from "@/lib/ad-utils";

interface AdDetail {
  id: string;
  title: string;
  category: string;
  slug: string | null;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
  click_type: string | null;
  click_target: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
  ad_billing?: {
    company_name: string;
  } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  mecanica: "Mecânica",
  guincho: "Guincho",
  borracharia: "Borracharia",
  autoeletrica: "Autoelétrica",
  funilaria: "Funilaria e Pintura",
  lavagem: "Lavagem",
  seguro: "Seguro",
  financiamento: "Financiamento",
  outros: "Outros",
};

export default function AdDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [ad, setAd] = useState<AdDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string>("");
  const hasRedirected = useRef(false);

  // Build WhatsApp message - extracted so it can be used before redirect
  const buildAdWhatsAppMessage = (companyName: string, canonicalUrl: string) => {
    const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
    return `Olá! Vi este anúncio no site CompreCarros e tenho interesse.

Anunciante: ${companyName}
Página do anúncio: ${canonicalUrl}
Data/hora: ${timestamp}`;
  };

  useEffect(() => {
    const fetchAd = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      // Try to find by slug first, then by id (for backwards compatibility)
      let query = supabase
        .from("ads")
        .select(`
          id,
          title,
          category,
          slug,
          image_url_home,
          image_url_search,
          link,
          click_type,
          click_target,
          whatsapp_number,
          is_active,
          created_at,
          ad_billing (
            company_name
          )
        `)
        .eq("is_active", true);

      // Check if it's a UUID (for backwards compatibility) or a slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      
      if (isUuid) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching ad:", error);
        setAd(null);
        setIsLoading(false);
        return;
      }

      if (data) {
        setAd(data as AdDetail);
        // Track view
        trackView("ad", data.id, {
          placement: "ad_page",
          category: data.category,
          title: data.title,
        });
      } else {
        setAd(null);
      }

      setIsLoading(false);
    };

    fetchAd();
  }, [slug]);

  // Build redirect URL based on click_type
  const getRedirectUrl = (ad: AdDetail, canonicalUrl: string): string => {
    const companyName = ad.ad_billing?.company_name || ad.title;
    
    switch (ad.click_type) {
      case "whatsapp": {
        const phone = ad.whatsapp_number?.replace(/\D/g, "") || WHATSAPP_NUMBER;
        return generateWhatsAppUrl(phone, buildAdWhatsAppMessage(companyName, canonicalUrl));
      }
      case "instagram":
      case "link":
        return ad.click_target || ad.link || "";
      default: {
        // Fallback to WhatsApp if no click_type defined
        const phone = ad.whatsapp_number?.replace(/\D/g, "") || WHATSAPP_NUMBER;
        return generateWhatsAppUrl(phone, buildAdWhatsAppMessage(companyName, canonicalUrl));
      }
    }
  };

  // Auto-redirect based on click_type after ad is loaded
  useEffect(() => {
    if (!ad || hasRedirected.current || isLoading) return;

    // Prevent double redirect
    hasRedirected.current = true;
    setIsRedirecting(true);

    // Always use slug for canonical URL (never UUID)
    const canonicalUrl = getAdPublicUrl(ad);
    
    // Get redirect URL based on click_type
    const redirectUrl = getRedirectUrl(ad, canonicalUrl);
    
    if (!redirectUrl) {
      // No valid redirect URL, just show the page
      setIsRedirecting(false);
      hasRedirected.current = false;
      return;
    }

    // Store URL for fallback button
    setFallbackUrl(redirectUrl);

    // Track click before redirect
    trackClick("ad", ad.id, {
      placement: "ad_page",
      category: ad.category,
      title: ad.title,
      action: `auto_redirect_${ad.click_type || "whatsapp"}`,
    });

    // Show fallback button after 1.5s
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, 1500);

    // Small delay to ensure tracking is sent and page renders for SEO
    const redirectTimer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 500);

    return () => {
      clearTimeout(redirectTimer);
      clearTimeout(fallbackTimer);
    };
  }, [ad, isLoading]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="aspect-video bg-muted rounded-2xl max-w-3xl" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-1/2" />
              <div className="h-6 bg-muted rounded w-1/3" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Get overlay text based on click_type
  const getOverlayText = () => {
    switch (ad?.click_type) {
      case "instagram":
        return { title: "Redirecionando para Instagram", description: "Você será direcionado para o perfil do anunciante..." };
      case "link":
        return { title: "Redirecionando para o site", description: "Você será direcionado para o site do anunciante..." };
      default:
        return { title: "Redirecionando para WhatsApp", description: "Você será direcionado para conversar com o anunciante..." };
    }
  };

  // Show redirecting overlay
  const RedirectingOverlay = () => {
    const overlayText = getOverlayText();
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {overlayText.title}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {overlayText.description}
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-green-600 mx-auto" />
          
          {/* Fallback button - appears after 1.5s */}
          {showFallback && fallbackUrl && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-sm text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Se não redirecionar, clique aqui
            </a>
          )}
        </div>
      </div>
    );
  };

  if (!ad) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Anúncio não encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            O anúncio que você está procurando não existe ou foi removido.
          </p>
          <Link to="/">
            <Button>Voltar para a Home</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const companyName = ad.ad_billing?.company_name || ad.title;
  const categoryLabel = CATEGORY_LABELS[ad.category] || ad.category;
  const imageUrl = ad.image_url_home || ad.image_url_search || "/placeholder.svg";
  const canonicalUrl = getAdPublicUrl(ad);
  
  const pageTitle = `${companyName} - ${categoryLabel} | CompreCarrosBr`;
  const metaDescription = `${companyName} - Anúncio de ${categoryLabel} no CompreCarrosBr. Entre em contato e saiba mais sobre os serviços oferecidos.`;

  const getWhatsAppUrl = () => {
    const phone = ad.whatsapp_number?.replace(/\D/g, "") || WHATSAPP_NUMBER;
    return generateWhatsAppUrl(phone, buildAdWhatsAppMessage(companyName, canonicalUrl));
  };

  const handleWhatsAppClick = () => {
    trackClick("ad", ad.id, {
      placement: "ad_page",
      category: ad.category,
      title: ad.title,
      action: "whatsapp_click",
    });
  };

  const handleExternalLinkClick = () => {
    trackClick("ad", ad.id, {
      placement: "ad_page",
      category: ad.category,
      title: ad.title,
      action: "external_link_click",
    });
  };

  return (
    <PublicLayout>
      {isRedirecting && <RedirectingOverlay />}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <nav className="mb-4" aria-label="Voltar">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para a Home
            </Link>
          </nav>

          <main className="max-w-4xl mx-auto">
            {/* Ad Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-6">
              <img
                src={imageUrl}
                alt={`Anúncio: ${ad.title}`}
                className="w-full h-full object-contain"
              />
              <Badge
                variant="secondary"
                className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold bg-foreground/80 text-background uppercase"
              >
                Publicidade
              </Badge>
            </div>

            {/* Ad Info */}
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  {categoryLabel}
                </Badge>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {companyName}
                </h1>
                {ad.title !== companyName && (
                  <p className="text-muted-foreground mt-1">{ad.title}</p>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="flex-1"
                >
                  <Button size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-5 w-5" />
                    Falar no WhatsApp
                  </Button>
                </a>

                {ad.click_type === "link" && ad.click_target && (
                  <a
                    href={ad.click_target}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleExternalLinkClick}
                    className="flex-1"
                  >
                    <Button size="lg" variant="outline" className="w-full gap-2">
                      <ExternalLink className="h-5 w-5" />
                      Visitar Site
                    </Button>
                  </a>
                )}

                {ad.click_type === "instagram" && ad.click_target && (
                  <a
                    href={ad.click_target}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleExternalLinkClick}
                    className="flex-1"
                  >
                    <Button size="lg" variant="outline" className="w-full gap-2">
                      <ExternalLink className="h-5 w-5" />
                      Ver Instagram
                    </Button>
                  </a>
                )}
              </div>

              {/* Info */}
              <p className="text-sm text-muted-foreground pt-4">
                Este é um anúncio de estabelecimento parceiro exibido no CompreCarrosBr.
              </p>
            </div>
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}
