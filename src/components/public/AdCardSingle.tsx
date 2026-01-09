import { memo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { generateWhatsAppUrl } from "@/lib/constants";
import { trackClick, trackView } from "@/lib/analytics";
import { format } from "date-fns";

interface Ad {
  id: string;
  title: string;
  category: string;
  slug?: string | null;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
  click_type?: string | null;
  click_target?: string | null;
  whatsapp_number?: string | null;
}

interface AdCardSingleProps {
  ad: Ad;
}

/**
 * Builds a simplified WhatsApp message for ads
 */
function buildAdWhatsAppMessage(ad: Ad): string {
  const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  const adSlug = ad.slug || ad.id;
  const adPageUrl = `${window.location.origin}/anuncio/${adSlug}`;
  
  return `Olá! Vi este anúncio no site CompreCarros e tenho interesse.

Anunciante: ${ad.title}
Página do anúncio: ${adPageUrl}
Data/hora: ${timestamp}`;
}

export const AdCardSingle = memo(function AdCardSingle({ ad }: AdCardSingleProps) {
  const hasTrackedView = useRef(false);

  // Track view when ad is rendered (once per mount)
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackView("ad", ad.id, {
        placement: "home",
        category: ad.category,
        title: ad.title,
      });
      hasTrackedView.current = true;
    }
  }, [ad.id, ad.category, ad.title]);

  const href = getAdHref(ad);
  const CardWrapper = href ? "a" : "div";
  const wrapperProps = href
    ? {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  const imageUrl = ad.image_url_home || "/placeholder.svg";

  return (
    <CardWrapper
      {...wrapperProps}
      className="block"
      {...(href
        ? {
            onClick: () =>
              trackClick("ad", ad.id, {
                placement: "home",
                category: ad.category,
                title: ad.title,
              }),
          }
        : {})}
    >
      <div className="relative w-full overflow-hidden rounded-xl border bg-white shadow-sm">
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 z-20 rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-bold bg-foreground/80 text-background uppercase"
        >
          Publicidade
        </Badge>

        {/* Mobile: slimmer (aspect-[1200/210]) | Desktop: taller (aspect-[1200/310]) */}
        <div className="relative w-full aspect-[1200/210] md:aspect-[1200/310]">
          <img
            src={imageUrl}
            alt={`Publicidade: ${ad.title}`}
            className="absolute inset-0 w-full h-full object-contain p-2 md:p-0"
          />
        </div>
      </div>
    </CardWrapper>
  );
});

function getAdHref(ad: Ad): string | undefined {
  const type = ad.click_type || (ad.link ? "link" : null);

  if (type === "whatsapp" && ad.whatsapp_number) {
    const message = buildAdWhatsAppMessage(ad);
    return generateWhatsAppUrl(ad.whatsapp_number.replace(/\D/g, ""), message);
  }

  const target = ad.click_target || ad.link || undefined;
  if ((type === "link" || type === "instagram") && target) {
    return target;
  }

  return undefined;
}
