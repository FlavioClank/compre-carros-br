import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  WHATSAPP_NUMBER,
  buildCarWhatsAppMessage,
  formatPrice,
  formatMileage,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  COOLING_TYPE_LABELS,
  MOTORCYCLE_CATEGORY_LABELS,
  formatEngineCC,
  generateWhatsAppUrl,
} from "@/lib/constants";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gauge,
  Fuel,
  Car,
  Palette,
  FileText,
  ArrowLeft,
  Share2,
  Bike,
  Thermometer,
  Tag,
} from "lucide-react";
import { trackClick } from "@/lib/analytics";

interface CarDetail {
  id: string;
  slug: string | null;
  code: string;
  model: string;
  year: number;
  version: string | null;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  price: number;
  description: string | null;
  photos: string[];
  status: string;
  created_at: string;
  category: string;
  engine_cc: number | null;
  cooling_type: string | null;
  motorcycle_category: string | null;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

export default function CarDetails() {
  const { slug } = useParams<{ slug?: string }>();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      // Determine if slug is a UUID (fallback) or an actual slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      
      // Fetch directly from cars table with brand join
      // RLS policy filters to only available cars from active garages
      let query = supabase
        .from("cars")
        .select(`
          id,
          slug,
          code,
          model,
          year,
          version,
          mileage,
          transmission,
          fuel,
          color,
          price,
          photos,
          description,
          status,
          created_at,
          category,
          engine_cc,
          cooling_type,
          motorcycle_category,
          brands:brand_id (
            name,
            logo_url
          )
        `);
      
      // Search by slug or ID depending on format
      if (isUuid) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching car:", error);
        setCar(null);
      } else if (data) {
        const carData: CarDetail = {
          id: data.id,
          slug: data.slug,
          code: data.code,
          model: data.model,
          year: data.year,
          version: data.version,
          mileage: data.mileage,
          transmission: data.transmission,
          fuel: data.fuel,
          color: data.color,
          price: data.price,
          description: data.description,
          photos: data.photos || [],
          status: data.status,
          created_at: data.created_at,
          category: data.category || 'car',
          engine_cc: data.engine_cc,
          cooling_type: data.cooling_type,
          motorcycle_category: data.motorcycle_category,
          brands: data.brands,
        };
        setCar(carData);
      }
      setIsLoading(false);
    };

    fetchCar();
  }, [slug]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="aspect-[16/9] bg-muted rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!car) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Veículo não encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            O veículo que você está procurando não existe ou foi removido.
          </p>
          <Link to="/carros">
            <Button>Ver todos os veículos</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const brandName = car.brands?.name || "";
  const invertBrandLogo = ["toyota", "nissan", "audi", "volkswagen"].includes(brandName.toLowerCase());
  const photos = car.photos?.length > 0 ? car.photos : ["/placeholder.svg"];
  const isMotorcycle = car.category === 'motorcycle';

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
      category: car.category,
    })
  );

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Canonical URL using slug for SEO (fallback to ID if no slug)
  const canonicalUrl = `${window.location.origin}/carro/${car.slug || car.id}`;
  const shareUrl = canonicalUrl;

  // Build specs based on vehicle type
  const specs = isMotorcycle ? [
    { icon: Calendar, label: "Ano", value: car.year },
    { icon: Gauge, label: "Quilometragem", value: formatMileage(car.mileage) },
    { icon: Bike, label: "Cilindradas", value: car.engine_cc ? formatEngineCC(car.engine_cc) : "-" },
    { icon: Thermometer, label: "Refrigeração", value: car.cooling_type ? COOLING_TYPE_LABELS[car.cooling_type] : "-" },
    { icon: Tag, label: "Categoria", value: car.motorcycle_category ? MOTORCYCLE_CATEGORY_LABELS[car.motorcycle_category] : "-" },
    { icon: Fuel, label: "Combustível", value: FUEL_LABELS[car.fuel] || car.fuel },
    { icon: Palette, label: "Cor", value: car.color },
    { icon: FileText, label: "Código", value: car.code },
  ] : [
    { icon: Calendar, label: "Ano", value: car.year },
    { icon: Gauge, label: "Quilometragem", value: formatMileage(car.mileage) },
    { icon: Car, label: "Câmbio", value: TRANSMISSION_LABELS[car.transmission] || car.transmission },
    { icon: Fuel, label: "Combustível", value: FUEL_LABELS[car.fuel] || car.fuel },
    { icon: Palette, label: "Cor", value: car.color },
    { icon: FileText, label: "Código", value: car.code },
  ];

  // SEO: Generate dynamic page title and meta description
  const vehicleType = isMotorcycle ? 'Moto' : 'Carro';
  const pageTitle = `${brandName} ${car.model} ${car.year}${car.version ? ` ${car.version}` : ""} | CompreCarrosBr`;
  const transmissionLabel = TRANSMISSION_LABELS[car.transmission] || car.transmission;
  const fuelLabel = FUEL_LABELS[car.fuel] || car.fuel;
  
  const metaDescription = car.description 
    ? car.description.substring(0, 155) + (car.description.length > 155 ? "..." : "")
    : isMotorcycle
      ? `${brandName} ${car.model} ${car.year}, ${car.engine_cc ? formatEngineCC(car.engine_cc) : ''}, ${fuelLabel}, ${formatMileage(car.mileage)}. ${formatPrice(car.price)}. Moto verificada na CompreCarrosBr.`
      : `${brandName} ${car.model} ${car.year}, ${transmissionLabel}, ${fuelLabel}, ${formatMileage(car.mileage)}. ${formatPrice(car.price)}. Veículo verificado na CompreCarrosBr.`;
  
  const mainPhoto = photos[0] || "/placeholder.svg";

  return (
    <PublicLayout>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={mainPhoto} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={mainPhoto} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/carros"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para veículos
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full max-h-[70vh] md:max-h-none md:aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
              <OptimizedImage
                src={photos[currentPhotoIndex]}
                alt={`${brandName} ${car.model}`}
                width={800}
                height={600}
                quality={85}
                eager={currentPhotoIndex === 0}
                className="w-full h-auto max-h-[70vh] md:max-h-none md:h-full object-contain md:object-cover"
                containerClassName="w-full h-auto md:h-full flex items-center justify-center"
              />

              {/* Status Badge */}
              {car.status === "sold" && (
                <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
                  <Badge className="badge-sold text-2xl px-6 py-3">VENDIDO</Badge>
                </div>
              )}

              {/* Category Badge */}
              {isMotorcycle && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Bike className="h-4 w-4" />
                    Moto
                  </Badge>
                </div>
              )}

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Counter */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              )}

              {/* Brand Logo */}
              {car.brands?.logo_url && (
                <div className="absolute top-4 left-4 h-12 w-12 bg-background/90 rounded-lg p-2 backdrop-blur-sm">
                  <img
                    src={car.brands.logo_url}
                    alt={brandName}
                    className={`w-full h-full object-contain ${invertBrandLogo ? "brand-logo-premium-invert" : ""}`}
                  />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentPhotoIndex
                        ? "border-accent"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <OptimizedImage
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      width={100}
                      height={100}
                      quality={60}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6 text-base md:text-sm leading-relaxed md:leading-normal">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {brandName} {car.model}
                  </h1>
                  {car.version && (
                    <p className="text-muted-foreground text-lg md:text-lg mt-1">{car.version}</p>
                  )}
                </div>
                <button
                  onClick={() => navigator.share?.({ url: shareUrl, title: `${brandName} ${car.model}` })}
                  className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Preço</p>
                <p className="font-display text-4xl font-bold text-accent">
                  {formatPrice(car.price)}
                </p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {specs.map((spec) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={spec.label}
                    className="bg-muted/50 rounded-xl p-3 md:p-4 border border-border"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm md:text-sm">{spec.label}</span>
                    </div>
                    <p className="font-semibold text-foreground text-base md:text-sm">{spec.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            {car.description && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-lg md:text-base">
                  Descrição
                </h3>
                <p className="text-muted-foreground whitespace-pre-line text-base md:text-sm leading-relaxed">
                  {car.description}
                </p>
              </div>
            )}

            {/* CTA */}
            {car.status === "available" && (
              <div className="bg-muted/50 rounded-xl p-5 md:p-6 border border-border">
                <h3 className="font-display font-semibold text-foreground mb-2 text-lg md:text-base">
                  Interessado {isMotorcycle ? 'nesta moto' : 'neste veículo'}?
                </h3>
                <p className="text-muted-foreground text-base md:text-sm mb-4 leading-relaxed">
                  Entre em contato pelo WhatsApp e receba todas as informações.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={() =>
                    trackClick("car", car.id, {
                      source: "details_whatsapp",
                      brand: brandName,
                      model: car.model,
                    })
                  }
                >
                  <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Falar pelo WhatsApp
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}