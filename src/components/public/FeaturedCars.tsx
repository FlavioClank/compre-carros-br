import { useMemo, memo, useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CarCardSingle } from "@/components/public/CarCardSingle";
import { HomePartnerCard } from "@/components/public/HomePartnerCard";
import { usePartnersRotation } from "@/hooks/usePartnersRotation";
import { useVehiclesPaginatedQuery } from "@/hooks/useVehiclesPaginatedQuery";
import { interleaveVehiclesWithPartners } from "@/lib/interleave-partners";
import { PaginationControls } from "@/components/public/PaginationControls";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { shuffleSeeded, getHalfHourSeed } from "@/lib/shuffle";

interface Car {
  id: string;
  slug?: string | null;
  code: string;
  model: string;
  year: number;
  model_year?: number | null;
  version: string | null;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  price: number;
  photos: string[] | null;
  status: string;
  is_featured: boolean;
  brands: { name: string; logo_url: string | null } | null;
}

interface Ad {
  id: string;
  slug: string | null;
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

const CardItem = memo(function CardItem({ item }: { item: ListItem }) {
  if (item.type === "car") {
    return <CarCardSingle car={item.data} />;
  }
  return <HomePartnerCard item={item.data} />;
});

const PAGE_SIZE = 30;

async function fetchHomeCars(page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [countResult, dataResult] = await Promise.all([
    supabase.from("cars").select("*", { count: "exact", head: true }),
    supabase
      .from("cars")
      .select(`
        id, slug, code, model, year, model_year, version, mileage, transmission,
        fuel, color, price, photos, is_featured, created_at,
        brands:brand_id ( name, logo_url )
      `)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  if (dataResult.error) throw dataResult.error;

  const totalCount = countResult.count || 0;
  const cars: Car[] = (dataResult.data || []).map((car) => ({
    id: car.id,
    slug: car.slug,
    code: car.code,
    model: car.model,
    year: car.year,
    model_year: car.model_year,
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
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}

export function FeaturedCars() {
  const [page, setPage] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { ads, hasAds } = usePartnersRotation();
  const seed = getHalfHourSeed();

  // Reset to page 0 when logo/home is clicked
  useEffect(() => {
    const handleReset = () => setPage(0);
    window.addEventListener("reset-home", handleReset);
    return () => window.removeEventListener("reset-home", handleReset);
  }, []);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-cars-paginated", page],
    queryFn: () => fetchHomeCars(page),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const totalCars = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Shuffle cars deterministically, keeping featured first
  const shuffledCars = useMemo(() => {
    if (!data?.cars) return [];
    const featured = data.cars.filter(c => c.is_featured);
    const regular = data.cars.filter(c => !c.is_featured);
    return [
      ...shuffleSeeded(featured, seed + page),
      ...shuffleSeeded(regular, seed + page),
    ];
  }, [data?.cars, seed, page]);

  // Interleave 6 ads per page
  const listItems = useMemo((): ListItem[] => {
    if (shuffledCars.length === 0 && hasAds) {
      return ads.slice(0, 6).map((ad) => ({ type: "ad" as const, data: ad }));
    }
    return interleaveVehiclesWithPartners(shuffledCars, ads, 6);
  }, [shuffledCars, ads, hasAds]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  return (
    <section ref={sectionRef} className="py-4 md:py-12 bg-background">
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

        {/* Cards List */}
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
          <>
            <div className="space-y-3 md:space-y-4">
              {listItems.map((item) => (
                <CardItem
                  key={item.type === "car" ? `car-${item.data.id}` : `promo-${item.data.id}`}
                  item={item}
                />
              ))}
            </div>

            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-10 bg-card/50 rounded-xl border border-border/50">
            <p className="text-muted-foreground text-sm">Nenhum veículo disponível</p>
            <p className="text-xs text-muted-foreground mt-1">Volte em breve</p>
          </div>
        )}
      </div>
    </section>
  );
}
