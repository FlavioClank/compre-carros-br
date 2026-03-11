import { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { trackView } from "@/lib/analytics";

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

export const PartnerCardSingle = memo(function PartnerCardSingle({ item }: { item: PartnerItem }) {
  const hasTrackedView = useRef(false);

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

  const imageUrl = item.image_url_home || "/placeholder.svg";
  const itemPath = `/anuncio/${item.slug || item.id}`;

  return (
    <Link to={itemPath} className="block">
      <div className="relative w-full overflow-hidden rounded-xl border bg-card shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 z-20 rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-bold bg-foreground/80 text-background uppercase"
        >
          Publicidade
        </Badge>

        <div className="relative w-full aspect-[1200/210] md:aspect-[1200/310]">
          <img
            src={imageUrl}
            alt={`Publicidade: ${item.title}`}
            className="absolute inset-0 w-full h-full object-contain p-2 md:p-0"
          />
        </div>
      </div>
    </Link>
  );
});
