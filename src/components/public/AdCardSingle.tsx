import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string | null;
  link: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  mecanica: "Mecânica",
  guincho: "Guincho",
  borracharia: "Borracharia",
  autoeletrica: "Autoelétrica",
  funilaria: "Funilaria e Pintura",
  lavagem: "Lavagem",
  seguro: "Seguro",
  financiamento: "Financiamento",
  outros: "Outros",
};

interface AdCardSingleProps {
  ad: Ad;
}

/**
 * AdCardSingle - Horizontal ad card that matches CarCardSingle layout
 * Used in the Home page FeaturedCars section
 */
export function AdCardSingle({ ad }: AdCardSingleProps) {
  const categoryLabel = CATEGORY_LABELS[ad.category] || ad.category;

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
        <div className="flex flex-row">
          {/* Image Section - Same dimensions as CarCardSingle */}
          <div className="relative w-32 h-28 md:w-56 lg:w-64 md:h-40 lg:h-44 overflow-hidden flex-shrink-0 bg-muted">
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
          </div>

          {/* Content Section - Same padding as CarCardSingle */}
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
            <div>
              {/* Title & Category */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm md:text-lg lg:text-xl font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {ad.title}
                  </h3>
                  <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-1">
                    {categoryLabel}
                  </p>
                </div>
                {ad.link && (
                  <div className="p-1.5 bg-muted rounded-full flex-shrink-0">
                    <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Description */}
              {ad.description && (
                <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2">
                  {ad.description}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border">
              {ad.link && (
                <Button size="sm" className="h-7 md:h-9 px-2 md:px-3 text-xs md:text-sm gap-1">
                  <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Saiba mais</span>
                  <span className="sm:hidden">Ver</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
