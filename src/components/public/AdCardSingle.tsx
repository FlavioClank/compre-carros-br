import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string | null;
  link: string | null;
}

interface AdCardSingleProps {
  ad: Ad;
}

/**
 * AdCardSingle - Horizontal ad card usado na Home
 * Agora exibe apenas imagem + link clicável
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

  return (
    <CardWrapper {...wrapperProps} className="block group">
      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
        {/* Imagem ocupa 100% do card */}
        <div className="relative w-full h-full overflow-hidden bg-muted">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />

          {/* Publicidade Badge */}
          <Badge
            variant="secondary"
            className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] md:text-[11px] font-semibold bg-foreground/80 text-background"
          >
            Publicidade
          </Badge>

          {/* Indicador de link externo */}
          {ad.link && (
            <div className="absolute top-1.5 right-1.5 h-7 w-7 md:h-8 md:w-8 bg-background/90 rounded-full p-1.5 backdrop-blur-sm flex items-center justify-center">
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
