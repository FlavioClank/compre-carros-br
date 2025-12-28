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

          {/* Publicidade Badge */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 rounded-lg px-2 py-0.5 text-[10px] font-semibold bg-foreground/80 text-background backdrop-blur-sm"
          >
            Publicidade
          </Badge>

          {/* Indicador de link externo */}
          {ad.link && (
            <div className="absolute top-2 right-2 h-8 w-8 bg-background/90 rounded-lg p-1.5 backdrop-blur-sm flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Conteúdo removido: anúncio é apenas imagem + link */}

      </div>
    </CardWrapper>
  );
}
