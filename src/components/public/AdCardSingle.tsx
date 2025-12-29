import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";

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
 * AdCardSingle - usado na Home (lista de destaques)
 * Renderiza somente a imagem no mesmo padrão de proporção (aspect-[16/10]).
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
    <CardWrapper {...wrapperProps} className="block">
      <VehicleCardShell>
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={ad.image_url}
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

          {ad.link && (
            <div className="absolute top-1.5 right-1.5 h-7 w-7 md:h-8 md:w-8 bg-background/90 rounded-full p-1.5 backdrop-blur-sm flex items-center justify-center">
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </VehicleCardShell>
    </CardWrapper>
  );
}
