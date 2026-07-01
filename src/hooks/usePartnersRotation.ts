import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { rotateArray, get5MinSeed, getMsUntilNextWindow } from "@/lib/shuffle";
import { fetchPublicPartners, type PublicPartner } from "@/lib/public-content";

type Ad = PublicPartner;

export function usePartnersRotation() {
  const [rawAds, setRawAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rotationTick, setRotationTick] = useState<number>(get5MinSeed);
  const currentIndexRef = useRef(0);

  // Fetch ads on mount (ordered by created_at — stable base order)
  useEffect(() => {
    async function fetchAds() {
      try {
        const data = await fetchPublicPartners();
        setRawAds(data);
      } catch {
        setRawAds([]);
      }
      setIsLoading(false);
    }

    fetchAds();
  }, []);

  // Update rotation tick every 5 minutes
  useEffect(() => {
    const msUntilNext = getMsUntilNextWindow();

    const timeout = setTimeout(() => {
      setRotationTick(get5MinSeed());
      currentIndexRef.current = 0;

      const interval = setInterval(() => {
        setRotationTick(get5MinSeed());
        currentIndexRef.current = 0;
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }, msUntilNext);

    return () => clearTimeout(timeout);
  }, []);

  // Rotate ads in queue fashion: every 5min the last ad goes to the front
  // rotationTick changes every 5min, so ads shift position each tick
  const ads = useMemo(() => {
    if (rawAds.length === 0) return [];
    // Use rotationTick to determine how many positions to shift
    return rotateArray(rawAds, rotationTick);
  }, [rawAds, rotationTick]);

  // Get next ad in round-robin fashion
  const getNextAd = useCallback((): Ad | null => {
    if (ads.length === 0) return null;

    const ad = ads[currentIndexRef.current];
    currentIndexRef.current = (currentIndexRef.current + 1) % ads.length;
    return ad;
  }, [ads]);

  // Get ad at specific position
  const getAdAtPosition = useCallback(
    (position: number): Ad | null => {
      if (ads.length === 0) return null;
      return ads[position % ads.length];
    },
    [ads]
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
