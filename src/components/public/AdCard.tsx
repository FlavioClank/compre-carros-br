import { VehicleCardShell } from "@/components/public/VehicleCardShell";

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string | null;
  link: string | null;
}

interface AdCardProps {
  ad: Ad;
}

/**
 * AdCard
 * Renderiza apenas a área de imagem, sem footer.
 * Mesma proporção (aspect-[16/10]) da imagem do CarCard.
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

  return (
    <CardWrapper {...wrapperProps} className="block">
      <VehicleCardShell>
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={ad.image_url}
            alt={ad.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
      </VehicleCardShell>
    </CardWrapper>
  );
}
