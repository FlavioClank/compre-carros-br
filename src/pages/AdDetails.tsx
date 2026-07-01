import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle, ExternalLink, Instagram } from "lucide-react";
import { generateWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/constants";
import { trackClick, trackView } from "@/lib/analytics";
import { format } from "date-fns";
import { getPartnerPublicUrl } from "@/lib/partner-utils";
import { absoluteImageUrl } from "@/lib/seo";
import { resolveContactWhatsAppUrl } from "@/lib/contact-link";
import { fetchPublicPartnerBySlugOrId } from "@/lib/public-content";

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
  is_active: boolean;
  created_at: string;
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [ad, setAd] = useState<AdDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasTrackedView = useRef(false);
  const hasTrackedClick = useRef(false);

  const isUuidParam = !!slug && UUID_REGEX.test(slug);

  // Build WhatsApp message
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

      const data = await fetchPublicPartnerBySlugOrId(slug);

      if (data) {
        setAd(data as AdDetail);

        // If accessed via legacy UUID URL, upgrade the address bar to the slug URL
        if (isUuidParam && data.slug && data.slug.trim() !== "") {
          window.history.replaceState(null, "", `/anuncio/${data.slug}`);
        }

        // Track view once
        if (!hasTrackedView.current) {
          trackView("ad", data.id, {
            placement: "ad_page",
            category: data.category,
            title: data.title,
          });
          hasTrackedView.current = true;
        }
      } else {
        setAd(null);
      }

      setIsLoading(false);
    };

    fetchAd();
  }, [slug, isUuidParam]);

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

  const companyName = ad.title;
  const categoryLabel = CATEGORY_LABELS[ad.category] || ad.category;
  const imageUrl = ad.image_url_home || ad.image_url_search || "/placeholder.svg";
  const canonicalUrl = getPartnerPublicUrl(ad);

  const pageTitle = `${companyName} - ${categoryLabel} | CompreCarrosBr`;
  const metaDescription = `${companyName} - Anúncio de ${categoryLabel} no CompreCarrosBr. Entre em contato e saiba mais sobre os serviços oferecidos.`;

  const handleWhatsAppClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    handleCTAClick("whatsapp_click");
    const message = buildAdWhatsAppMessage(companyName, canonicalUrl);
    const url = await resolveContactWhatsAppUrl("ad", ad.id, message);
    const fallback = generateWhatsAppUrl(WHATSAPP_NUMBER, message);
    window.open(url || fallback, "_blank", "noopener,noreferrer");
  };

  // Track click only once per action type
  const handleCTAClick = (actionType: string) => {
    if (!hasTrackedClick.current) {
      trackClick("ad", ad.id, {
        placement: "ad_page",
        category: ad.category,
        title: ad.title,
        action: actionType,
      });
      hasTrackedClick.current = true;
    }
  };

  return (
    <PublicLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={absoluteImageUrl(imageUrl)} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl(imageUrl)} />
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

              {/* CTA Buttons - Based on click_type configuration */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {/* WhatsApp button - shown for whatsapp click_type or as default */}
                {(ad.click_type === "whatsapp" || !ad.click_type || ad.click_type === "") && (
                  <div className="flex-1">
                    <Button
                      size="lg"
                      onClick={handleWhatsAppClick}
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                )}

                {/* Site/Link button */}
                {ad.click_type === "link" && ad.click_target && (
                  <a
                    href={ad.click_target}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCTAClick("link_click")}
                    className="flex-1"
                  >
                    <Button size="lg" className="w-full gap-2 bg-primary hover:bg-primary/90">
                      <ExternalLink className="h-5 w-5" />
                      Acessar Site
                    </Button>
                  </a>
                )}

                {/* Instagram button */}
                {ad.click_type === "instagram" && ad.click_target && (
                  <a
                    href={ad.click_target}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCTAClick("instagram_click")}
                    className="flex-1"
                  >
                    <Button size="lg" className="w-full gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90">
                      <Instagram className="h-5 w-5" />
                      Ver no Instagram
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
