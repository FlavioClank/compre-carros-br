import { memo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";
import { generateWhatsAppUrl } from "@/lib/constants";
import { trackClick, trackView } from "@/lib/analytics";

interface Ad {
  id: string;
  title: string;
  category: string;
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
      <VehicleCardShell>
        {/* Image - Mobile: fixed height matching CarCard | Desktop: aspect ratio for banner */}
        <div className="relative block overflow-hidden aspect-[16/10] md:aspect-[1200/310]">
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 z-20 rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-bold bg-foreground/80 text-background uppercase"
          >
            Publicidade
          </Badge>
          <img
            src={imageUrl}
            alt={`Publicidade: ${ad.title}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content - Mobile: spacer divs to match CarCard height | Desktop: hidden */}
        <div className="p-3 md:hidden">
          {/* Title spacer */}
          <div className="h-4 mb-0.5" />
          {/* Version spacer */}
          <div className="h-3 mb-2" />
          {/* Specs grid spacer */}
          <div className="h-[52px] mb-3" />
          {/* Price & action spacer */}
          <div className="h-7 pt-2 border-t border-border" />
        </div>
      </VehicleCardShell>
    </CardWrapper>
  );
});

function getAdHref(ad: Ad): string | undefined {
  const type = ad.click_type || (ad.link ? "link" : null);

  if (type === "whatsapp" && ad.whatsapp_number) {
    const message =
      "Olá! Vim do CompreCarrosBr 🚗 Seu anúncio apareceu para mim e gostaria de saber mais.";
    return generateWhatsAppUrl(ad.whatsapp_number.replace(/\D/g, ""), message);
  }

  const target = ad.click_target || ad.link || undefined;
  if ((type === "link" || type === "instagram") && target) {
    return target;
  }

  return undefined;
}
