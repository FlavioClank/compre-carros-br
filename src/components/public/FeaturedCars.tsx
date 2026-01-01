import { useState, useEffect, useRef, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { supabase } from "@/integrations/supabase/client";
import { CarCardSingle } from "@/components/public/CarCardSingle";
import { AdCardSingle } from "@/components/public/AdCardSingle";
import { useAdsRotation } from "@/hooks/useAdsRotation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Fixed card heights for stable virtualization
const CARD_HEIGHT_MOBILE = 120; // h-28 + padding
const CARD_HEIGHT_DESKTOP = 176; // h-40 + padding
const GAP = 16;

// Car interface for component
interface Car {
  id: string;
  slug?: string | null;
  code: string;
  model: string;
  year: number;
  version: string | null;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  price: number;
  photos: string[] | null;
  status: string;
  is_featured: boolean;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface Ad {
  id: string;
  title: string;
  category: string;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
  click_type?: string | null;
  click_target?: string | null;
  whatsapp_number?: string | null;
}

type ListItem = 
  | { type: "car"; data: Car }
  | { type: "ad"; data: Ad };

// Memoized row component to prevent re-renders
const VirtualRow = memo(function VirtualRow({ 
  item, 
  style 
}: { 
  item: ListItem; 
  style: React.CSSProperties;
}) {
  return (
    <div style={style} className="px-0">
      {item.type === "car" ? (
        <CarCardSingle car={item.data} />
      ) : (
        <AdCardSingle ad={item.data} />
      )}
    </div>
  );
});

export function FeaturedCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCars, setTotalCars] = useState(0);
  const { ads, hasAds } = useAdsRotation();
  
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Detect if mobile for proper row height
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { data, error } = await supabase
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
            is_featured,
            created_at,
            description,
            brands:brand_id (
              name,
              logo_url
            )
          `)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;

        const transformedCars: Car[] = (data || []).map((car) => ({
          id: car.id,
          slug: car.slug,
          code: car.code,
          model: car.model,
          year: car.year,
          version: car.version,
          mileage: car.mileage,
          transmission: car.transmission,
          fuel: car.fuel,
          color: car.color,
          price: car.price,
          photos: car.photos,
          status: "available",
          is_featured: car.is_featured,
          brands: car.brands,
        }));

        setCars(transformedCars);

        const { count } = await supabase
          .from("cars")
          .select("*", { count: "exact", head: true });

        setTotalCars(count || 0);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Build list items with intercalated ads
  const listItems = useMemo((): ListItem[] => {
    if (cars.length === 0 && hasAds) {
      return ads.map((ad) => ({ type: "ad" as const, data: ad }));
    }

    const items: ListItem[] = [];
    let adIndex = 0;

    cars.forEach((car, index) => {
      items.push({ type: "car" as const, data: car });

      // Insert ad after every 5 cars
      if (hasAds && (index + 1) % 5 === 0 && adIndex < ads.length) {
        items.push({ type: "ad" as const, data: ads[adIndex] });
        adIndex++;
      }
    });

    // Append remaining ads at the end
    while (adIndex < ads.length) {
      items.push({ type: "ad" as const, data: ads[adIndex] });
      adIndex++;
    }

    return items;
  }, [cars, ads, hasAds]);

  const rowHeight = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;

  const virtualizer = useVirtualizer({
    count: listItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + GAP,
    overscan: 3,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <section className="py-4 md:py-12 bg-background">
      <div className="container">
        {/* Header - Larger on mobile */}
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Destaques</span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Veículos <span className="text-gradient">disponíveis</span>
            </h2>
          </div>
          <Link to="/carros">
            <Button variant="outline" size="sm" className="gap-1 text-xs md:text-sm">
              Ver todos ({totalCars})
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </Link>
        </div>

        {/* Virtualized Cards */}
        {isLoading ? (
          <div className="space-y-3 md:space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 md:h-40 w-full rounded-xl bg-card" />
            ))}
          </div>
        ) : listItems.length > 0 ? (
          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ 
              height: Math.min(listItems.length * (rowHeight + GAP), 600),
              contain: 'strict'
            }}
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualRow) => {
                const item = listItems[virtualRow.index];
                return (
                  <VirtualRow
                    key={item.type === 'car' ? `car-${item.data.id}` : `ad-${item.data.id}`}
                    item={item}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: virtualRow.size - GAP,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-card/50 rounded-xl border border-border/50">
            <p className="text-muted-foreground text-sm">Nenhum veículo disponível</p>
            <p className="text-xs text-muted-foreground mt-1">Volte em breve</p>
          </div>
        )}

        {cars.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/carros">
              <Button size="sm" className="btn-hero gap-1.5">
                Ver todos os {totalCars} veículos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
