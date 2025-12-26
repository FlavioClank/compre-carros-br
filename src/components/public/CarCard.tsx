import { Link } from "react-router-dom";
import { Car, Fuel, Gauge, Calendar } from "lucide-react";
import { formatPrice, formatMileage, FUEL_LABELS, TRANSMISSION_LABELS, generateWhatsAppUrl } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CarCardProps {
  car: {
    id: string;
    code: string;
    model: string;
    year: number;
    version: string | null;
    mileage: number;
    transmission: string;
    fuel: string;
    color: string;
    price: number;
    photos: string[];
    status: string;
    brands?: {
      name: string;
      logo_url: string | null;
    } | null;
  };
}

export function CarCard({ car }: CarCardProps) {
  const brandName = car.brands?.name || "";
  const mainPhoto = car.photos?.[0] || "/placeholder.svg";
  const invertBrandLogo = ["toyota", "nissan", "audi", "volkswagen"].includes(brandName.toLowerCase());
  
  const whatsappUrl = generateWhatsAppUrl({
    code: car.code,
    model: car.model,
    year: car.year,
    version: car.version,
    price: car.price,
    brand_name: brandName,
  });

  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border shadow-card card-hover">
      {/* Image - reduced to ~70% scale */}
      <Link to={`/carro/${car.id}`} className="relative block aspect-[16/10] overflow-hidden">
        <img
          src={mainPhoto}
          alt={`${brandName} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        
        {/* Status Badge */}
        {car.status === "sold" && (
          <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
            <Badge className="badge-sold text-sm px-3 py-1">VENDIDO</Badge>
          </div>
        )}

        {/* Brand Logo */}
        {car.brands?.logo_url && (
          <div className="absolute top-2 left-2 h-8 w-8 bg-background/90 rounded-lg p-1 backdrop-blur-sm">
            <img
              src={car.brands.logo_url}
              alt={brandName}
              className={`w-full h-full object-contain ${invertBrandLogo ? "brand-logo-premium-invert" : ""}`}
            />
          </div>
        )}

        {/* Code Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5">
            {car.code}
          </Badge>
        </div>
      </Link>

      {/* Content - reduced padding */}
      <div className="p-3">
        {/* Title */}
        <Link to={`/carro/${car.id}`}>
          <h3 className="font-display text-sm font-bold text-card-foreground mb-0.5 group-hover:text-accent transition-colors line-clamp-1">
            {brandName} {car.model}
          </h3>
          {car.version && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {car.version}
            </p>
          )}
        </Link>

        {/* Specs Grid - smaller text */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 text-accent" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Gauge className="h-3 w-3 text-accent" />
            <span>{formatMileage(car.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Car className="h-3 w-3 text-accent" />
            <span>{TRANSMISSION_LABELS[car.transmission] || car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Fuel className="h-3 w-3 text-accent" />
            <span>{FUEL_LABELS[car.fuel] || car.fuel}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-[10px] text-muted-foreground">Preço</p>
            <p className="text-sm font-bold text-accent">{formatPrice(car.price)}</p>
          </div>
          
          {car.status === "available" && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 h-7 px-2 text-xs">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
