import { memo, useEffect, useRef, forwardRef } from "react";
import { generateWhatsAppUrl } from "@/lib/constants";
import { trackClick, trackView } from "@/lib/analytics";
import { format } from "date-fns";
import { getAdPublicUrl } from "@/lib/ad-utils";

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
 * Builds a simplified WhatsApp message for ads
 */
function buildAdWhatsAppMessage(ad: Ad): string {
  const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  const adPageUrl = getAdPublicUrl(ad);
  
  return `Olá! Vi este anúncio no site CompreCarros e tenho interesse.

Anunciante: ${ad.title}
Página do anúncio: ${adPageUrl}
Data/hora: ${timestamp}`;
}

/**
 * HomeAdCard - Ad card specifically for the Home page
 * Matches the exact visual structure of CarCardSingle (horizontal layout)
 * Uses VehicleCardShell for consistent styling with vehicle cards
 */
export const HomeAdCard = memo(
  forwardRef<HTMLDivElement, HomeAdCardProps>(function HomeAdCard({ ad }, ref) {
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
  })
);

function getAdHref(ad: Ad): string | undefined {
  const type = ad.click_type || (ad.link ? "link" : null);

  if (type === "whatsapp" && ad.whatsapp_number) {
    const message = buildAdWhatsAppMessage(ad);
    return generateWhatsAppUrl(ad.whatsapp_number.replace(/\D/g, ""), message);
  }

  const target = ad.click_target || ad.link || undefined;
  if ((type === "link" || type === "instagram") && target) {
    return target;
  }

  return undefined;
}
