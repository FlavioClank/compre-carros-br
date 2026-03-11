import { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { trackView } from "@/lib/analytics";

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
 * AdCardSingle - Ad card for search/listing pages
 * Always navigates to /anuncio/:slug for the ad details page
 * Click tracking happens on the ad details page when user clicks CTA buttons
 */
export const PartnerCardSingle = memo(function PartnerCardSingle({ item }: { item: Ad }) {
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

  const imageUrl = ad.image_url_home || "/placeholder.svg";
  // Always navigate to ad details page using slug (or fallback to id)
  const adPath = `/anuncio/${ad.slug || ad.id}`;

  return (
    <Link to={adPath} className="block">
      <div className="relative w-full overflow-hidden rounded-xl border bg-white shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
    </Link>
  );
});
