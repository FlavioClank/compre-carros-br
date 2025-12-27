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
    <CardWrapper {...wrapperProps} className="block group">
      <Card className="overflow-hidden h-full border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-amber-500 text-white hover:bg-amber-500"
          >
            Publicidade
          </Badge>
          {ad.link && (
            <div className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full">
              <ExternalLink className="h-4 w-4 text-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {ad.title}
              </h3>
              <p className="text-sm text-muted-foreground">{categoryLabel}</p>
            </div>
          </div>
          {ad.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ad.description}
            </p>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}
