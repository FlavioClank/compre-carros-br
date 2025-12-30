import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
}

export function useAdsRotation() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<number[]>([]);
  const currentIndexRef = useRef(0);
  const shuffleSeedRef = useRef<number>(Date.now());

  // Helper to create a non-repeating permutation of ad indices
  const createShuffledOrder = (length: number): number[] => {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  useEffect(() => {
    async function fetchAds() {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, category, image_url_home, image_url_search, link, click_type, click_target, whatsapp_number")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching ads:", error);
        setAds([]);
        setOrder([]);
      } else {
        const safeData = data || [];
        setAds(safeData);
        setOrder(safeData.length > 0 ? createShuffledOrder(safeData.length) : []);
        currentIndexRef.current = 0;
      }
      setIsLoading(false);
    }

    fetchAds();
  }, []);

  // Re-shuffle ads order every 30 minutes to avoid fixed positions
  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      shuffleSeedRef.current = Date.now();
      setOrder(createShuffledOrder(ads.length));
      currentIndexRef.current = 0;
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [ads.length]);

  // Get next ad in round-robin fashion, without repetition inside a cycle
  const getNextAd = useCallback((): Ad | null => {
    if (ads.length === 0 || order.length === 0) return null;

    const index = order[currentIndexRef.current];
    const ad = ads[index];

    currentIndexRef.current = (currentIndexRef.current + 1) % order.length;
    return ad;
  }, [ads, order]);

  // Get ad for a specific position (kept for backward compatibility)
  const getAdAtPosition = useCallback(
    (position: number): Ad | null => {
      if (ads.length === 0 || order.length === 0) return null;
      const safeIndex = order[position % order.length];
      return ads[safeIndex];
    },
    [ads, order]
  );

  const resetRotation = useCallback(() => {
    currentIndexRef.current = 0;
  }, []);

  return {
    ads,
    isLoading,
    hasAds: ads.length > 0,
    getNextAd,
    getAdAtPosition,
    resetRotation,
  };
}
