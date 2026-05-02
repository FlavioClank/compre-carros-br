import { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";
import { trackView } from "@/lib/analytics";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { saveListScrollFromElement } from "@/lib/scroll-restoration";

interface PartnerItem {
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

export const PartnerCard = memo(function PartnerCard({ item }: { item: PartnerItem }) {
  const hasTrackedView = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasTrackedView.current) {
      trackView("ad", item.id, {
        placement: "search",
        category: item.category,
        title: item.title,
      });
      hasTrackedView.current = true;
    }
  }, [item.id, item.category, item.title]);

  const imageUrl = item.image_url_search || "/placeholder.svg";
  const itemSlug = item.slug || item.id;

  // Save the absolute Y position of THIS slot before navigating away.
  // The slot index is what matters (not the ad id), because ads rotate
  // every 5 minutes — when the user comes back, we want to land in the
  // same spot of the vehicle list, even if a different ad now occupies it.
  const handleClick = () => {
    saveListScrollFromElement(wrapperRef.current);
  };

  return (
    <div ref={wrapperRef}>
      <Link to={`/anuncio/${itemSlug}`} className="block" onClick={handleClick}>
        <VehicleCardShell>
          <div className="relative block aspect-[16/10] overflow-hidden">
            <OptimizedImage
              src={imageUrl}
              alt={`Publicidade: ${item.title}`}
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
    </div>
  );
});
