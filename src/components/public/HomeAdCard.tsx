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

interface HomeAdCardProps {
  ad: Ad;
}

/**
 * HomeAdCard - Ad card specifically for the Home page
 * Matches the exact visual structure of CarCardSingle (horizontal layout)
 * Uses VehicleCardShell for consistent styling with vehicle cards
 */
export const HomeAdCard = memo(function HomeAdCard({ ad }: HomeAdCardProps) {
  const hasTrackedView = useRef(false);

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
  const imageUrl = ad.image_url_home || "/placeholder.svg";

  const handleClick = () => {
    trackClick("ad", ad.id, {
      placement: "home",
      category: ad.category,
      title: ad.title,
    });
  };

  const content = (
    <VehicleCardShell>
      <div className="flex flex-row">
        {/* Image Section - Same dimensions as CarCardSingle */}
        <div className="relative w-32 h-28 md:w-56 lg:w-64 md:h-40 lg:h-44 overflow-hidden flex-shrink-0">
          <Badge
            variant="secondary"
            className="absolute top-1.5 left-1.5 z-20 flex items-center gap-0.5 bg-foreground/80 text-background px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold"
          >
            Publicidade
          </Badge>
          <img
            src={imageUrl}
            alt={`Publicidade: ${ad.title}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section - Mirrors CarCardSingle structure */}
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
          <div>
            {/* Title area - mirrors brand logo + title */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm md:text-lg lg:text-xl font-bold text-card-foreground line-clamp-1">
                  {ad.title}
                </h3>
                <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-1">
                  Anúncio patrocinado
                </p>
              </div>
            </div>

            {/* Specs area spacer - mirrors specs grid height */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-sm text-muted-foreground">
              <span className="text-accent">Clique para saber mais</span>
            </div>
          </div>

          {/* Bottom area - mirrors price & actions */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border">
            <p className="text-xs md:text-sm text-muted-foreground">Saiba mais →</p>
          </div>
        </div>
      </div>
    </VehicleCardShell>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        {content}
      </a>
    );
  }

  return <div className="block">{content}</div>;
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
