import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";
import { generateWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/constants";
import { trackClick } from "@/lib/analytics";
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

interface AdCardSingleProps {
  ad: Ad;
}

export const AdCardSingle = memo(function AdCardSingle({ ad }: AdCardSingleProps) {
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
        {/* EXACT same height as CarCardSingle image section: h-28 md:h-40 lg:h-44 */}
        <div className="relative w-full h-28 md:h-40 lg:h-44 overflow-hidden">
          {/* Blur background layer - DESKTOP ONLY - soft fill for empty space */}
          <div className="hidden md:block absolute inset-0">
            <OptimizedImage
              src={imageUrl}
              alt=""
              width={200}
              height={150}
              quality={30}
              className="w-full h-full object-cover blur-md scale-105 opacity-25"
              containerClassName="w-full h-full"
              showSkeleton={false}
            />
          </div>
          
          {/* Main image - cover on mobile (no white bands), contain on desktop */}
          <OptimizedImage
            src={imageUrl}
            alt={`Publicidade: ${ad.title}`}
            width={640}
            height={360}
            quality={75}
            className="relative z-10 w-full h-full object-cover object-center md:object-contain bg-transparent"
            containerClassName="w-full h-full"
          />

          <Badge
            variant="secondary"
            className="absolute top-1.5 left-1.5 z-20 rounded-full px-1.5 py-0.5 text-[9px] md:text-[11px] font-semibold bg-foreground/80 text-background"
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
