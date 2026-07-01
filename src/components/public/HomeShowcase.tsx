import { useEffect, useState, memo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";
import { trackClick } from "@/lib/analytics";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { resolveContactWhatsAppUrl } from "@/lib/contact-link";

interface Banner {
  id: string;
  image_url: string;
  image_desktop: string | null;
  image_mobile: string | null;
  position: number;
  click_type: string | null;
  click_target: string | null;
}

export const HomeShowcase = memo(function HomeShowcase() {
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
      const { data, error } = await (supabase as any)
        .from("banners_public")
        .select("id, image_url, image_desktop, image_mobile, position, click_type, click_target")
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

    // WhatsApp is resolved server-side via edge function on click.
    if (type === "whatsapp") return undefined;

    if ((type === "link" || type === "instagram") && banner.click_target) {
      return banner.click_target;
    }

    return undefined;
  }, []);

  const handleWhatsAppBanner = useCallback(async (banner: Banner) => {
    trackClick("banner", banner.id);
    const message =
      "Olá! Vim do CompreCarrosBr 😊 Vi seu banner no site e gostaria de mais informações.";
    const url = await resolveContactWhatsAppUrl("banner", banner.id, message);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // Proporção responsiva com imagens separadas:
  // Mobile: 1:1 (1080×1080px) - usa image_mobile
  // Desktop: 16:7 (1920×840px) - usa image_desktop
  const renderImage = useCallback(
    (banner: Banner, isFirst: boolean = false) => {
      const href = getBannerHref(banner);
      
      // Use new columns with fallback to legacy image_url
      const desktopSrc = banner.image_desktop || banner.image_url;
      const mobileSrc = banner.image_mobile || banner.image_url;

      // Only the first banner loads eagerly, rest are lazy
      const image = (
        <div className="relative w-full overflow-hidden">
          {/* Desktop/Tablet Image */}
          <div className="hidden md:block aspect-[16/7] bg-muted">
            <OptimizedImage
              src={desktopSrc}
              alt="Promoção destaque"
              width={1920}
              height={840}
              quality={85}
              eager={isFirst}
              className="w-full h-full object-cover object-center"
              containerClassName="w-full h-full"
              showSkeleton={true}
            />
          </div>
          {/* Mobile Image */}
          <div className="block md:hidden aspect-[1/1] bg-muted">
            <OptimizedImage
              src={mobileSrc}
              alt="Promoção destaque"
              width={1080}
              height={1080}
              quality={85}
              eager={isFirst}
              className="w-full h-full object-cover object-center"
              containerClassName="w-full h-full"
              showSkeleton={true}
            />
          </div>
        </div>
      );

      const isWhatsApp = (banner.click_type || "none") === "whatsapp";

      if (isWhatsApp) {
        return (
          <button
            type="button"
            onClick={() => handleWhatsAppBanner(banner)}
            className="block w-full text-left"
          >
            {image}
          </button>
        );
      }

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
    [getBannerHref, handleWhatsAppBanner]
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
              className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/30 text-foreground/70 shadow-sm border border-border/30"
              aria-label="Anterior"
            >
              &#8592;
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/30 text-foreground/70 shadow-sm border border-border/30"
              aria-label="Próximo"
            >
              &#8594;
            </button>
          </div>

          {/* Desktop controls */}
          <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/40 text-foreground/70 shadow-md border border-border/30 hover:bg-background/60"
              aria-label="Anterior"
            >
              &#8592;
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/40 text-foreground/70 shadow-md border border-border/30 hover:bg-background/60"
              aria-label="Próximo"
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
            className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/30 text-foreground/70 shadow-sm border border-border/30"
            aria-label="Anterior"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="pointer-events-auto inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/30 text-foreground/70 shadow-sm border border-border/30"
            aria-label="Próximo"
          >
            &#8594;
          </button>
        </div>

        {/* Desktop controls */}
        <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none">
          <button
            type="button"
            onClick={handlePrev}
            className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/40 text-foreground/70 shadow-md border border-border/30 hover:bg-background/60"
            aria-label="Anterior"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="pointer-events-auto inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/40 text-foreground/70 shadow-md border border-border/30 hover:bg-background/60"
            aria-label="Próximo"
          >
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
});

