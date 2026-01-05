import { useMemo, memo, forwardRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CarCardSingle } from "@/components/public/CarCardSingle";
import { HomeAdCard } from "@/components/public/HomeAdCard";
import { useAdsRotation } from "@/hooks/useAdsRotation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const PAGE_SIZE = 12;

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

// Memoized card wrapper
const CardItem = memo(function CardItem({ item }: { item: ListItem }) {
  if (item.type === "car") {
    return <CarCardSingle car={item.data} />;
  }
  return <HomeAdCard ad={item.data} />;
});

// Load more trigger component with forwardRef
function LoadMoreTrigger({ 
  onVisible, 
  hasNextPage,
  isFetchingNextPage,
}: { 
  onVisible: () => void; 
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: false,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      onVisible();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, onVisible]);

  if (!hasNextPage) return null;

  return (
    <div ref={ref as (el: HTMLDivElement | null) => void} className="flex justify-center py-6">
      {isFetchingNextPage && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando mais veículos...</span>
        </div>
      )}
    </div>
  );
}

// Fetch cars function for infinite query
async function fetchCars({ pageParam = 0 }: { pageParam?: number }) {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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
      brands:brand_id (
        name,
        logo_url
      )
    `)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const cars: Car[] = (data || []).map((car) => ({
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

  return {
    cars,
    nextPage: cars.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
}

export function FeaturedCars() {
  const { ads, hasAds } = useAdsRotation();

  // Infinite query for cars
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["featured-cars"],
    queryFn: fetchCars,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Get total count
  const { data: totalCars = 0 } = useQuery({
    queryKey: ["cars-total-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("cars")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Flatten all pages into a single array
  const allCars = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.cars);
  }, [data?.pages]);

  // Build list items with intercalated ads - 1 ad every 5 cars
  const listItems = useMemo((): ListItem[] => {
    if (allCars.length === 0 && hasAds) {
      return ads.map((ad) => ({ type: "ad" as const, data: ad }));
    }

    const items: ListItem[] = [];
    let adIndex = 0;

    allCars.forEach((car, index) => {
      items.push({ type: "car" as const, data: car });

      // Insert ad after every 5 cars (positions 5, 10, 15, etc.)
      if (hasAds && (index + 1) % 5 === 0 && adIndex < ads.length) {
        items.push({ type: "ad" as const, data: ads[adIndex] });
        adIndex++;
      }
    });

    // If there are remaining ads and we have cars that didn't complete a group of 5,
    // add remaining ads at the end
    if (hasAds && adIndex < ads.length && allCars.length > 0) {
      // Only add if we have leftover cars after last ad position
      const remainingCars = allCars.length % 5;
      if (remainingCars > 0) {
        while (adIndex < ads.length) {
          items.push({ type: "ad" as const, data: ads[adIndex] });
          adIndex++;
        }
      }
    }

    return items;
  }, [allCars, ads, hasAds]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="py-4 md:py-12 bg-background">
      <div className="container">
        {/* Header */}
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

        {/* Cards List - Natural scroll, no fixed height container */}
        {isLoading ? (
          <div className="space-y-3 md:space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 md:h-40 w-full rounded-xl bg-card" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 bg-card/50 rounded-xl border border-border/50">
            <p className="text-muted-foreground text-sm">Erro ao carregar veículos</p>
            <p className="text-xs text-muted-foreground mt-1">Tente novamente mais tarde</p>
          </div>
        ) : listItems.length > 0 ? (
          <div className="space-y-3 md:space-y-4 [&>*:first-child]:mt-0">
            {listItems.map((item) => (
              <CardItem
                key={item.type === 'car' ? `car-${item.data.id}` : `ad-${item.data.id}`}
                item={item}
              />
            ))}
            
            {/* Load more trigger - automatically loads when visible */}
            <LoadMoreTrigger
              onVisible={handleLoadMore}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>
        ) : (
          <div className="text-center py-10 bg-card/50 rounded-xl border border-border/50">
            <p className="text-muted-foreground text-sm">Nenhum veículo disponível</p>
            <p className="text-xs text-muted-foreground mt-1">Volte em breve</p>
          </div>
        )}

        {allCars.length > 0 && !hasNextPage && (
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
