import { memo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
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
    <div className="relative w-full overflow-hidden rounded-xl border bg-card shadow-sm cursor-pointer">
      <Badge
        variant="secondary"
        className="absolute top-2 left-2 z-20 bg-foreground/80 text-background px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold"
      >
        Publicidade
      </Badge>
      <div className="relative w-full aspect-[1200/393] md:aspect-[1200/200]">
        <img
          src={imageUrl}
          alt="Publicidade"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
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
