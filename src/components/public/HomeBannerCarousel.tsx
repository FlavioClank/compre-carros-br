import { useEffect, useState, memo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import { generateWhatsAppUrl } from "@/lib/constants";
import { trackClick } from "@/lib/analytics";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Banner {
  id: string;
  image_url: string;
  position: number;
  click_type: string | null;
  click_target: string | null;
  whatsapp_number: string | null;
}

export const HomeBannerCarousel = memo(function HomeBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplayKey, setAutoplayKey] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  });

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, image_url, position, click_type, click_target, whatsapp_number")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error && data) setBanners(data);
      setIsLoading(false);
    };

    fetchBanners();
  }, []);

  // Auto-scroll every 8 seconds if more than 1 banner
  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [emblaApi, banners.length, autoplayKey]);

  const handlePrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    setAutoplayKey((key) => key + 1);
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    setAutoplayKey((key) => key + 1);
  }, [emblaApi]);

  const getBannerHref = useCallback((banner: Banner): string | undefined => {
    const type = banner.click_type || "none";

    if (type === "whatsapp" && banner.whatsapp_number) {
      const message =
        "Olá! Vim do CompreCarrosBr 😊 Vi seu banner no site e gostaria de mais informações.";
      return generateWhatsAppUrl(banner.whatsapp_number.replace(/\D/g, ""), message);
    }

    if ((type === "link" || type === "instagram") && banner.click_target) {
      return banner.click_target;
    }

    return undefined;
  }, []);

  // Proporção responsiva:
  // Mobile: 4:3 (mais alto, melhor visualização)
  // Desktop: 16:7 (~1920×840px)
  const renderImage = useCallback(
    (banner: Banner, isFirst: boolean = false) => {
      const href = getBannerHref(banner);

      // Only the first banner loads eagerly, rest are lazy
      const image = (
        <div className="relative w-full aspect-[4/3] md:aspect-[16/7] bg-muted overflow-hidden">
          <OptimizedImage
            src={banner.image_url}
            alt="Banner promocional"
            width={1920}
            height={840}
            quality={85}
            eager={isFirst}
            className="w-full h-full object-cover object-center"
            containerClassName="w-full h-full"
            showSkeleton={true}
          />
        </div>
      );

      if (!href) return image;

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick("banner", banner.id)}
        >
          {image}
        </a>
      );
    },
    [getBannerHref]
  );

  // Important: do not early-return before hooks above (prevents hook-order crashes)
  if (isLoading || banners.length === 0) return null;

  // Single banner - no carousel needed
  if (banners.length === 1) {
    return (
      <section className="w-full flex justify-center">
        <div className="relative w-full md:w-[70%]">
          {renderImage(banners[0], true)}

          {/* Mobile controls */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:hidden pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/70 text-foreground shadow-md border border-border/60"
              aria-label="Banner anterior"
            >
              &#8592;
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/70 text-foreground shadow-md border border-border/60"
              aria-label="Próximo banner"
            >
              &#8594;
            </button>
          </div>

          {/* Desktop controls */}
          <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/80 text-foreground shadow-lg border border-border/60 hover:bg-background"
              aria-label="Banner anterior"
            >
              &#8592;
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/80 text-foreground shadow-lg border border-border/60 hover:bg-background"
              aria-label="Próximo banner"
            >
              &#8594;
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Multiple banners - use carousel
  return (
    <section className="w-full overflow-hidden flex justify-center">
      <div className="relative w-full md:w-[70%] overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              {renderImage(banner, index === 0)}
            </div>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:hidden pointer-events-none">
          <button
            type="button"
            onClick={handlePrev}
            className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/70 text-foreground shadow-md border border-border/60"
            aria-label="Banner anterior"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/70 text-foreground shadow-md border border-border/60"
            aria-label="Próximo banner"
          >
            &#8594;
          </button>
        </div>

        {/* Desktop controls */}
        <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none">
          <button
            type="button"
            onClick={handlePrev}
            className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/80 text-foreground shadow-lg border border-border/60 hover:bg-background"
            aria-label="Banner anterior"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/80 text-foreground shadow-lg border border-border/60 hover:bg-background"
            aria-label="Próximo banner"
          >
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
});

