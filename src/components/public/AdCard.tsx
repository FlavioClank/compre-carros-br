import { memo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";
import { generateWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/constants";
import { trackClick, trackView } from "@/lib/analytics";
import { OptimizedImage } from "@/components/ui/optimized-image";

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

interface AdCardProps {
  ad: Ad;
}

export const AdCard = memo(function AdCard({ ad }: AdCardProps) {
  const hasTrackedView = useRef(false);

  // Track view when ad is rendered (once per mount)
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackView("ad", ad.id, {
        placement: "search",
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

  const imageUrl = ad.image_url_search || "/placeholder.svg";

  return (
    <CardWrapper
      {...wrapperProps}
      className="block"
      {...(href
        ? {
            onClick: () =>
              trackClick("ad", ad.id, {
                placement: "search",
                category: ad.category,
                title: ad.title,
              }),
          }
        : {})}
    >
      <VehicleCardShell>
        <div className="relative block aspect-[16/10] overflow-hidden">
          <OptimizedImage
            src={imageUrl}
            alt={`Publicidade: ${ad.title}`}
            width={400}
            height={250}
            quality={75}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />

          <Badge
            variant="secondary"
            className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-foreground/80 text-background"
          >
            Publicidade
          </Badge>
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
