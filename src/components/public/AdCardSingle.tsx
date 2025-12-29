import { Badge } from "@/components/ui/badge";
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
 * Layout HORIZONTAL idêntico ao CarCardSingle:
 * - Mesma altura (h-28 md:h-40 lg:h-44)
 * - Imagem à esquerda com mesma largura (w-32 md:w-56 lg:w-64)
 * - Área de conteúdo à direita
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
        <div className="flex flex-row">
          {/* Image Section - SAME dimensions as CarCardSingle */}
          <div className="relative w-32 h-28 md:w-56 lg:w-64 md:h-40 lg:h-44 overflow-hidden flex-shrink-0">
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
          </div>

          {/* Content Section - mirrors CarCardSingle structure */}
          <div className="flex-1 p-3 md:p-4 flex flex-col justify-center min-w-0">
            <h3 className="font-display text-sm md:text-lg lg:text-xl font-bold text-card-foreground line-clamp-2">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2 mt-1">
                {ad.description}
              </p>
            )}
          </div>
        </div>
      </VehicleCardShell>
    </CardWrapper>
  );
}
