import { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";
import { trackView } from "@/lib/analytics";
import { OptimizedImage } from "@/components/ui/optimized-image";

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

interface PartnerCardProps {
  item: Ad;
}

/**
 * AdCard component for displaying ads in search results / listings.
 * Always navigates to /anuncio/:slug page (no direct redirect to WhatsApp).
 * Click tracking happens on the ad detail page when user clicks CTA button.
 */
export const PartnerCard = memo(function PartnerCard({ item }: { item: Ad }) {
  const hasTrackedView = useRef(false);

  // Track view when ad is rendered in list (once per mount)
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

  const imageUrl = ad.image_url_search || "/placeholder.svg";
  const adSlug = ad.slug || ad.id;

  return (
    <Link to={`/anuncio/${adSlug}`} className="block">
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
    </Link>
  );
});
