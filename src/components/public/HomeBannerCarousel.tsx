import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import { generateWhatsAppUrl } from "@/lib/constants";

interface Banner {
  id: string;
  image_url: string;
  position: number;
  click_type: string | null;
  click_target: string | null;
  whatsapp_number: string | null;
}

export function HomeBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
    }
  );

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, image_url, position, click_type, click_target, whatsapp_number")
        .eq("is_active", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error && data) {
        setBanners(data);
      }
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
  }, [emblaApi, banners.length]);

  const getBannerHref = (banner: Banner): string | undefined => {
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
  };

  if (isLoading || banners.length === 0) return null;

  const renderImage = (banner: Banner) => {
    const href = getBannerHref(banner);

    const image = (
      <img
        src={banner.image_url}
        alt="Banner promocional"
        className="w-full h-auto"
        style={{ display: "block" }}
      />
    );

    if (!href) return image;

    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );
  };

  // Single banner - no carousel needed
  if (banners.length === 1) {
    return (
      <section className="w-full flex justify-center">
        <div className="w-full md:w-[70%]">
          {renderImage(banners[0])}
        </div>
      </section>
    );
  }

  // Multiple banners - use carousel
  return (
    <section className="w-full overflow-hidden flex justify-center">
      <div className="w-full md:w-[70%] overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              {renderImage(banner)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
