import { memo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Gauge, Car, Fuel, Sparkles } from "lucide-react";
import {
  WHATSAPP_NUMBER,
  buildCarWhatsAppMessage,
  formatMileage,
  formatPrice,
  FUEL_LABELS,
  generateWhatsAppUrl,
  TRANSMISSION_LABELS,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateCarUrl } from "@/lib/utils";
import { VehicleCardShell } from "@/components/public/VehicleCardShell";
import { trackClick } from "@/lib/analytics";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getCarCoverImage } from "@/lib/image-utils";

interface CarCardSingleProps {
  car: {
    id: string;
    slug?: string | null;
    code: string;
    model: string;
    year: number;
    version: string | null;
    mileage: number;
    transmission: string;
    fuel: string;
    color: string;
    price: number;
    photos: string[] | null;
    status: string;
    is_featured?: boolean;
    brands?: {
      name: string;
      logo_url: string | null;
    } | null;
  };
}

export const CarCardSingle = memo(function CarCardSingle({ car }: CarCardSingleProps) {
  const brandName = car.brands?.name || "";
  const mainPhoto = getCarCoverImage(car.photos);
  const invertBrandLogo = ["toyota", "nissan", "audi", "volkswagen"].includes(brandName.toLowerCase());
  const carUrl = generateCarUrl({ id: car.id, slug: car.slug, model: car.model, version: car.version, brands: car.brands });
  
  const whatsappUrl = generateWhatsAppUrl(
    WHATSAPP_NUMBER,
    buildCarWhatsAppMessage({
      id: car.id,
      code: car.code,
      model: car.model,
      year: car.year,
      version: car.version,
      price: car.price,
      brand_name: brandName,
    })
  );

  return (
    <VehicleCardShell className={car.is_featured ? "border-accent/50 ring-1 ring-accent/20" : ""}>
      <div className="flex flex-row">
        {/* Image Section */}
        <Link 
          to={carUrl} 
          className="relative w-32 h-28 md:w-56 lg:w-64 md:h-40 lg:h-44 overflow-hidden flex-shrink-0"
        >
          <OptimizedImage
            src={mainPhoto}
            alt={`${brandName} ${car.model}`}
            width={320}
            height={240}
            quality={70}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            containerClassName="w-full h-full"
          />
          
          {/* Featured Badge */}
          {car.is_featured && (
            <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold z-10">
              <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3" />
              Destaque
            </div>
          )}

          {/* Status Badge */}
          {car.status === "sold" && (
            <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center z-10">
              <Badge className="badge-sold text-xs md:text-sm px-2 py-1">VENDIDO</Badge>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
          <div>
            {/* Brand Logo + Title */}
            <div className="flex items-center gap-2 mb-2">
              {car.brands?.logo_url && (
                <div className="h-7 w-7 md:h-9 md:w-9 bg-muted rounded p-0.5 flex-shrink-0">
                  <img
                    src={car.brands.logo_url}
                    alt={brandName}
                    className={`w-full h-full object-contain ${invertBrandLogo ? "brand-logo-premium-invert" : ""}`}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link to={carUrl}>
                  <h3 className="font-display text-sm md:text-lg lg:text-xl font-bold text-card-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {brandName} {car.model}
                  </h3>
                </Link>
                {car.version && (
                  <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-1">
                    {car.version}
                  </p>
                )}
              </div>
              {/* Code Badge */}
              <Badge variant="secondary" className="bg-muted text-[9px] md:text-xs font-mono px-1.5 py-0.5 flex-shrink-0">
                {car.code}
              </Badge>
            </div>

            {/* Specs Grid */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4 text-accent" />
                {car.year}
              </span>
              <span className="flex items-center gap-1">
                <Gauge className="h-3 w-3 md:h-4 md:w-4 text-accent" />
                {formatMileage(car.mileage)}
              </span>
              <span className="hidden md:flex items-center gap-1">
                <Car className="h-4 w-4 text-accent" />
                {TRANSMISSION_LABELS[car.transmission] || car.transmission}
              </span>
              <span className="hidden md:flex items-center gap-1">
                <Fuel className="h-4 w-4 text-accent" />
                {FUEL_LABELS[car.fuel] || car.fuel}
              </span>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border">
            <p className="price-tag text-base md:text-xl lg:text-2xl font-bold">{formatPrice(car.price)}</p>
            
            <div className="flex gap-1.5 md:gap-2">
              <Link to={carUrl}>
                <Button variant="outline" size="sm" className="h-7 md:h-9 px-2 md:px-3 text-xs md:text-sm">
                  Ver
                </Button>
              </Link>
              {car.status === "available" && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackClick("car", car.id, {
                      source: "featured_whatsapp",
                      brand: brandName,
                      model: car.model,
                    })
                  }
                >
                  <Button size="sm" className="h-7 md:h-9 px-2 md:px-3 text-xs md:text-sm bg-accent hover:bg-accent/90 text-accent-foreground gap-1">
                    <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </VehicleCardShell>
  );
});