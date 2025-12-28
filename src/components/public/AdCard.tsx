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

interface AdCardProps {
  ad: Ad;
}

/**
 * AdCard - Vertical ad card that matches CarCard layout
 * Used in the Cars search/listing page
 */
export function AdCard({ ad }: AdCardProps) {
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
      {/* Same structure and sizing as CarCard */}
      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-card card-hover">
        {/* Image - Same aspect ratio as CarCard */}
        <div className="relative block aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* Publicidade Badge - Same position as brand logo in CarCard */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 rounded-lg px-2 py-0.5 text-[10px] font-semibold bg-foreground/80 text-background backdrop-blur-sm"
          >
            Publicidade
          </Badge>

          {/* External link indicator - Same position as code badge in CarCard */}
          {ad.link && (
            <div className="absolute top-2 right-2 h-8 w-8 bg-background/90 rounded-lg p-1.5 backdrop-blur-sm flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content - Same padding as CarCard */}
        <div className="p-3">
          {/* Title - Same style as CarCard */}
          <h3 className="font-display text-sm font-bold text-card-foreground mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
            {ad.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {categoryLabel}
          </p>

          {/* Description placeholder area - Same height as specs grid */}
          {ad.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {ad.description}
            </p>
          )}

          {/* CTA - Same structure as price/action area in CarCard */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground">Anúncio</p>
            
            {ad.link && (
              <Button size="sm" className="gap-1.5 h-7 px-2 text-xs">
                <ExternalLink className="h-3 w-3" />
                Saiba mais
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
