import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string | null;
  link: string | null;
}

export function useAdsRotation() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    async function fetchAds() {
      const { data, error } = await supabase
        .from("ads")
        .select("id, title, category, image_url, description, link")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching ads:", error);
        setAds([]);
      } else {
        setAds(data || []);
      }
      setIsLoading(false);
    }

    fetchAds();
  }, []);

  // Get next ad in round-robin fashion
  const getNextAd = useCallback((): Ad | null => {
    if (ads.length === 0) return null;

    const ad = ads[currentIndexRef.current];
    currentIndexRef.current = (currentIndexRef.current + 1) % ads.length;
    return ad;
  }, [ads]);

  // Get ad for a specific position (useful for deterministic rendering)
  const getAdAtPosition = useCallback(
    (position: number): Ad | null => {
      if (ads.length === 0) return null;
      return ads[position % ads.length];
    },
    [ads]
  );

  // Reset rotation index
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
