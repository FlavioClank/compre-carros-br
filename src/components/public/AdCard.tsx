import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <CardWrapper {...wrapperProps} className="block group h-full">
      <Card className="h-full flex flex-col overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-[16/10] bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          >
            Publicidade
          </Badge>
          {ad.link && (
            <div className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full shadow-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-3 flex-1 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {ad.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{categoryLabel}</p>
            </div>
          </div>
          {ad.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {ad.description}
            </p>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}
