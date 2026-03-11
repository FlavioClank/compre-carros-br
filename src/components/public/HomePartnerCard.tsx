import { memo, useEffect, useRef, forwardRef } from "react";
import { Link } from "react-router-dom";
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

interface HomePartnerCardProps {
  item: PartnerItem;
}

export const HomePartnerCard = memo(
  forwardRef<HTMLDivElement, HomePartnerCardProps>(function HomePartnerCard({ item }, ref) {
    const hasTrackedView = useRef(false);

    useEffect(() => {
      if (!hasTrackedView.current) {
        trackView("ad", item.id, {
          placement: "home",
          category: item.category,
          title: item.title,
        });
        hasTrackedView.current = true;
      }
    }, [item.id, item.category, item.title]);

    const imageUrl = item.image_url_home || "/placeholder.svg";
    const itemPath = `/anuncio/${item.slug || item.id}`;

    const content = (
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-xl border bg-card md:bg-muted/50 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      >
        {/* Selo PUBLICIDADE - visível apenas no desktop */}
        <span className="absolute top-2 left-2 z-10 hidden rounded-md bg-foreground/70 px-2 py-1 text-xs font-semibold text-background md:block">
          PUBLICIDADE
        </span>
        <div className="relative w-full aspect-[1200/393] md:aspect-[1200/200] bg-muted/50">
          <img
            src={imageUrl}
            alt="Publicidade"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
    );

    return (
      <Link to={itemPath} className="block">
        {content}
      </Link>
    );
  })
);
