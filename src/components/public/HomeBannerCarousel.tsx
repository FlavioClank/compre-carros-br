import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Banner {
  id: string;
  image_url: string;
}

export function HomeBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBanners(data);
        setCurrentIndex(0);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="w-full bg-background">
      <div className="w-full">
        <AspectRatio ratio={16 / 5} className="bg-muted">
          <img
            src={currentBanner.image_url}
            alt="Banner promocional"
            className="w-full h-full object-cover"
          />
        </AspectRatio>
      </div>
    </section>
  );
}
