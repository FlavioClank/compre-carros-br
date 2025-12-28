import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";

interface Banner {
  id: string;
  image_url: string;
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
        .select("id, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBanners(data);
      }
      setIsLoading(false);
    };

    fetchBanners();
  }, []);

  // Auto-scroll every 5 seconds if more than 1 banner
  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, banners.length]);

  if (isLoading || banners.length === 0) return null;

  // Single banner - no carousel needed
  if (banners.length === 1) {
    return (
      <section className="w-full">
        <img
          src={banners[0].image_url}
          alt="Banner promocional"
          className="w-full h-auto"
          style={{ display: "block" }}
        />
      </section>
    );
  }

  // Multiple banners - use carousel
  return (
    <section className="w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              <img
                src={banner.image_url}
                alt="Banner promocional"
                className="w-full h-auto"
                style={{ display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
