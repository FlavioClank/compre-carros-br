import { Badge } from "@/components/ui/badge";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
}

interface AdCardSingleProps {
  ad: Ad;
}

/**
 * AdCardSingle - usado na HOME (lista de destaques)
 * Layout HORIZONTAL idêntico ao CarCardSingle:
 * - Mesma altura (h-28 md:h-40 lg:h-44)
 * - APENAS IMAGEM (sem texto ao lado)
 * - Imagem ocupa 100% do card
 * - Usa image_url_home
 */
export function AdCardSingle({ ad }: AdCardSingleProps) {
  const CardWrapper = ad.link ? "a" : "div";
  const wrapperProps = ad.link
    ? {
        href: ad.link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  const imageUrl = ad.image_url_home || "/placeholder.svg";

  return (
    <CardWrapper {...wrapperProps} className="block">
      <VehicleCardShell>
        {/* Full width image, same height as CarCardSingle */}
        <div className="relative h-28 md:h-40 lg:h-44 overflow-hidden">
          <img
            src={imageUrl}
            alt={`Publicidade: ${ad.title}`}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />

          <Badge
            variant="secondary"
            className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] md:text-[11px] font-semibold bg-foreground/80 text-background"
          >
            Publicidade
          </Badge>
        </div>
      </VehicleCardShell>
    </CardWrapper>
  );
}
