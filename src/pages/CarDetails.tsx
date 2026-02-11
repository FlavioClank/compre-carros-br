import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { canonicalUrl as buildCanonical, absoluteImageUrl } from "@/lib/seo";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  WHATSAPP_NUMBER,
  buildCarWhatsAppMessage,
  COOLING_TYPE_LABELS,
  FUEL_LABELS,
  formatEngineCC,
  formatMileage,
  formatPrice,
  generateWhatsAppUrl,
  MOTORCYCLE_CATEGORY_LABELS,
  TRANSMISSION_LABELS,
} from "@/lib/constants";
import {
  ArrowLeft,
  Bike,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  FileText,
  Fuel,
  Gauge,
  Palette,
  Share2,
  Tag,
  Thermometer,
  ZoomIn,
} from "lucide-react";
import { trackVehicleView, trackVehicleClick } from "@/lib/analytics";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          slug,
        );

      let query = supabase
        .from("cars")
        .select(
          `
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
        `,
        );

      query = isUuid ? query.eq("id", slug) : query.eq("slug", slug);

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching car:", error);
        setCar(null);
        setIsLoading(false);
        return;
      }

      if (data) {
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
          category: data.category || "car",
          engine_cc: data.engine_cc,
          cooling_type: data.cooling_type,
          motorcycle_category: data.motorcycle_category,
          brands: data.brands,
        };
        setCar(carData);
      } else {
        setCar(null);
      }

      setIsLoading(false);
    };

    fetchCar();
  }, [slug]);

  // Track vehicle view when car data is loaded
  useEffect(() => {
    if (car?.id) {
      trackVehicleView(car.id, {
        slug: car.slug,
        brand: car.brands?.name,
        model: car.model,
        page: `/carro/${slug}`,
      });
    }
  }, [car?.id]);

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
  const invertBrandLogo = ["toyota", "nissan", "audi", "volkswagen"].includes(
    brandName.toLowerCase(),
  );
  const photos = car.photos?.length > 0 ? car.photos : ["/placeholder.svg"];
  const isMotorcycle = car.category === "motorcycle";

  const whatsappUrl = generateWhatsAppUrl(
    WHATSAPP_NUMBER,
    buildCarWhatsAppMessage({
      slug: car.slug,
      code: car.code,
      model: car.model,
      year: car.year,
      version: car.version,
      price: car.price,
      brand_name: brandName,
      category: car.category,
    }),
  );

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  // Canonical URL using slug for SEO (fallback to ID if no slug)
  const canonicalUrl = buildCanonical(`/carro/${car.slug || car.id}`);
  const shareUrl = canonicalUrl;

  const specs = isMotorcycle
    ? [
        { icon: Calendar, label: "Ano", value: car.year },
        {
          icon: Gauge,
          label: "Quilometragem",
          value: formatMileage(car.mileage),
        },
        {
          icon: Bike,
          label: "Cilindradas",
          value: car.engine_cc ? formatEngineCC(car.engine_cc) : "-",
        },
        {
          icon: Thermometer,
          label: "Refrigeração",
          value: car.cooling_type ? COOLING_TYPE_LABELS[car.cooling_type] : "-",
        },
        {
          icon: Tag,
          label: "Categoria",
          value: car.motorcycle_category
            ? MOTORCYCLE_CATEGORY_LABELS[car.motorcycle_category]
            : "-",
        },
        {
          icon: Fuel,
          label: "Combustível",
          value: FUEL_LABELS[car.fuel] || car.fuel,
        },
        { icon: Palette, label: "Cor", value: car.color },
        { icon: FileText, label: "Código", value: car.code },
      ]
    : [
        { icon: Calendar, label: "Ano", value: car.year },
        {
          icon: Gauge,
          label: "Quilometragem",
          value: formatMileage(car.mileage),
        },
        {
          icon: Car,
          label: "Câmbio",
          value: TRANSMISSION_LABELS[car.transmission] || car.transmission,
        },
        {
          icon: Fuel,
          label: "Combustível",
          value: FUEL_LABELS[car.fuel] || car.fuel,
        },
        { icon: Palette, label: "Cor", value: car.color },
        { icon: FileText, label: "Código", value: car.code },
      ];

  const vehicleType = isMotorcycle ? "Moto" : "Carro";
  const pageTitle = `${brandName} ${car.model} ${car.year}${car.version ? ` ${car.version}` : ""} | CompreCarrosBr`;
  const transmissionLabel =
    TRANSMISSION_LABELS[car.transmission] || car.transmission;
  const fuelLabel = FUEL_LABELS[car.fuel] || car.fuel;

  const metaDescription = car.description
    ? car.description.substring(0, 155) + (car.description.length > 155 ? "..." : "")
    : isMotorcycle
      ? `${brandName} ${car.model} ${car.year}, ${car.engine_cc ? formatEngineCC(car.engine_cc) : ""}, ${fuelLabel}, ${formatMileage(car.mileage)}. ${formatPrice(car.price)}. ${vehicleType} verificada na CompreCarrosBr.`
      : `${brandName} ${car.model} ${car.year}, ${transmissionLabel}, ${fuelLabel}, ${formatMileage(car.mileage)}. ${formatPrice(car.price)}. Veículo verificado na CompreCarrosBr.`;

  const mainPhoto = photos[0] || "/placeholder.svg";

  return (
    <PublicLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={absoluteImageUrl(mainPhoto)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl(mainPhoto)} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <nav className="mb-4" aria-label="Voltar">
            <Link
              to="/carros"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para veículos
            </Link>
          </nav>

          <main className="w-full max-w-full">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full max-w-full">
              {/* Galeria */}
              <section className="min-w-0 min-h-0 w-full max-w-full">
                <div className="space-y-3 min-w-0 min-h-0">
                  <div 
                    className="relative w-full max-w-full aspect-[4/3] max-h-[70vh] overflow-hidden rounded-2xl bg-muted cursor-zoom-in group"
                    onClick={() => openLightbox(currentPhotoIndex)}
                  >
                    <OptimizedImage
                      src={photos[currentPhotoIndex]}
                      alt={`${brandName} ${car.model}`}
                      width={800}
                      height={600}
                      quality={85}
                      eager={currentPhotoIndex === 0}
                      className="w-full h-full object-contain"
                      containerClassName="w-full h-full flex items-center justify-center"
                    />

                    {/* Zoom indicator */}
                    <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <ZoomIn className="h-4 w-4" />
                      Ampliar
                    </div>

                    {/* Status */}
                    {car.status === "sold" && (
                      <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center pointer-events-none">
                        <Badge className="badge-sold text-2xl px-6 py-3">
                          VENDIDO
                        </Badge>
                      </div>
                    )}

                    {/* Categoria */}
                    {isMotorcycle && (
                      <div className="absolute top-4 right-4 pointer-events-none">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Bike className="h-4 w-4" />
                          Moto
                        </Badge>
                      </div>
                    )}

                    {/* Logo da marca */}
                    {car.brands?.logo_url && (
                      <div className="absolute top-4 left-4 h-12 w-12 bg-background/90 rounded-lg p-2 backdrop-blur-sm pointer-events-none">
                        <img
                          src={car.brands.logo_url}
                          alt={brandName}
                          className={`w-full h-full object-contain ${invertBrandLogo ? "brand-logo-premium-invert" : ""}`}
                        />
                      </div>
                    )}

                    {/* Navegação */}
                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          aria-label="Foto anterior"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          aria-label="Próxima foto"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium pointer-events-none">
                          {currentPhotoIndex + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Miniaturas (sem overflow horizontal) */}
                  {photos.length > 1 && (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 w-full max-w-full">
                      {photos.map((photo, index) => (
                        <button
                          key={photo + index}
                          type="button"
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors w-full ${
                            index === currentPhotoIndex
                              ? "border-accent"
                              : "border-transparent hover:border-border"
                          }`}
                          aria-label={`Selecionar foto ${index + 1}`}
                        >
                          <OptimizedImage
                            src={photo}
                            alt={`Foto ${index + 1} do veículo`}
                            width={120}
                            height={120}
                            quality={60}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Detalhes */}
              <article className="space-y-6 min-w-0 min-h-0 w-full max-w-full text-base md:text-sm leading-relaxed md:leading-normal">
                <header>
                  <div className="flex items-start justify-between gap-4 min-w-0">
                    <div className="min-w-0">
                      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground break-words">
                        {brandName} {car.model}
                      </h1>
                      {car.version && (
                        <p className="text-muted-foreground text-lg md:text-lg mt-1 break-words">
                          {car.version}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigator.share?.({
                          url: shareUrl,
                          title: `${brandName} ${car.model}`,
                        })
                      }
                      className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors flex-shrink-0"
                      aria-label="Compartilhar"
                    >
                      <Share2 className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="font-display text-4xl font-bold text-accent break-words">
                      {formatPrice(car.price)}
                    </p>
                  </div>
                </header>

                {/* Specs (GRID obrigatório) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-full">
                  {specs.map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div
                        key={spec.label}
                        className="rounded-xl border bg-card w-full max-w-full p-4"
                      >
                        <div className="flex items-center gap-2 text-muted-foreground mb-1 min-w-0">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{spec.label}</span>
                        </div>
                        <p className="font-semibold text-foreground break-words max-w-full">
                          {spec.value}
                        </p>
                      </div>
                    );
                  })}
                </section>

                {/* Descrição */}
                {car.description && (
                  <section className="max-w-full">
                    <h2 className="font-display font-semibold text-foreground mb-2 text-lg md:text-base">
                      Descrição
                    </h2>
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground max-w-full">
                      {car.description}
                    </p>
                  </section>
                )}

                {/* CTA */}
                {car.status === "available" && (
                  <aside className="rounded-xl border bg-card w-full max-w-full p-5 md:p-6">
                    <h2 className="font-display font-semibold text-foreground mb-2 text-lg md:text-base">
                      Interessado {isMotorcycle ? "nesta moto" : "neste veículo"}?
                    </h2>
                    <p className="text-muted-foreground mb-4 leading-relaxed max-w-full">
                      Entre em contato pelo WhatsApp e receba todas as informações.
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={() =>
                        trackVehicleClick(car.id, {
                          source: "details_whatsapp",
                          slug: car.slug,
                          brand: brandName,
                          model: car.model,
                        })
                      }
                    >
                      <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Falar pelo WhatsApp
                      </Button>
                    </a>
                  </aside>
                )}
              </article>
            </section>
          </main>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        images={photos}
        currentIndex={currentPhotoIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onPrev={prevPhoto}
        onNext={nextPhoto}
        alt={`${brandName} ${car.model}`}
      />
    </PublicLayout>
  );
}
