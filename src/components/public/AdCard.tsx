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

interface AdCardProps {
  ad: Ad;
}

/**
 * AdCard - usado na BUSCA de veículos
 * Usa image_url_search e o aspect-ratio 16:10 da busca
 */
export function AdCard({ ad }: AdCardProps) {
  const CardWrapper = ad.link ? "a" : "div";
  const wrapperProps = ad.link
    ? {
        href: ad.link,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  const imageUrl = ad.image_url_search || "/placeholder.svg";

  return (
    <CardWrapper {...wrapperProps} className="block">
      <VehicleCardShell>
        <div className="relative block aspect-[16/10] overflow-hidden">
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
            className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-foreground/80 text-background"
          >
            Publicidade
          </Badge>
        </div>
      </VehicleCardShell>
    </CardWrapper>
  );
}
