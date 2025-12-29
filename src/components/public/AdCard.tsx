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
 * Precisa ocupar exatamente o mesmo espaço visual de um CarCard no grid.
 * Estrutura: área de imagem (aspect-[16/10]) + placeholder de conteúdo com altura fixa.
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
    <CardWrapper {...wrapperProps} className="block h-full">
      <VehicleCardShell className="h-full">
        {/* Área de imagem idêntica ao CarCard */}
        <div className="relative block aspect-[16/10] overflow-hidden bg-muted">
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

        {/* Placeholder para igualar a altura total do CarCard */}
        <div className="p-3 h-[72px]" aria-hidden="true" />
      </VehicleCardShell>
    </CardWrapper>
  );
}
