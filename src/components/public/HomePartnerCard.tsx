import { memo, useEffect, useRef, forwardRef } from "react";
import { Link } from "react-router-dom";
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

interface HomeAdCardProps {
  ad: Ad;
}

/**
 * HomeAdCard - Ad card specifically for the Home page
 * Always navigates to /anuncio/:slug for the ad details page
 * Click tracking happens on the ad details page when user clicks CTA buttons
 */
export const HomePartnerCard = memo(
  forwardRef<HTMLDivElement, HomePartnerCardProps>(function HomePartnerCard({ item }, ref) {
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

    const imageUrl = ad.image_url_home || "/placeholder.svg";
    // Always navigate to ad details page using slug (or fallback to id)
    const adPath = `/anuncio/${ad.slug || ad.id}`;

    const content = (
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-xl border bg-card md:bg-gray-300/50 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      >
        {/* Selo PUBLICIDADE - visível apenas no desktop */}
        <span className="absolute top-2 left-2 z-10 hidden rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white md:block">
          PUBLICIDADE
        </span>
        <div className="relative w-full aspect-[1200/393] md:aspect-[1200/200] bg-gray-300/50">
          <img
            src={imageUrl}
            alt="Publicidade"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>
    );

    return (
      <Link to={adPath} className="block">
        {content}
      </Link>
    );
  })
);
