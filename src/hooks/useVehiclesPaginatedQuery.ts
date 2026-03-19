import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { VehicleFilters, VehicleData } from "@/hooks/useVehiclesInfiniteQuery";

const PAGE_SIZE = 30;

interface PaginatedResult {
  vehicles: VehicleData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

async function fetchVehiclesPage({
  page,
  filters,
}: {
  page: number;
  filters: VehicleFilters;
}): Promise<PaginatedResult> {
  const offset = page * PAGE_SIZE;

  // If filtering by garage location, resolve matching garage IDs via RPC
  let garageIds: string[] | null = null;
  if (filters.garageCity || filters.garageState) {
    const { data: ids } = await supabase.rpc("get_garage_ids_by_location", {
      p_city: filters.garageCity || null,
      p_state: filters.garageState || null,
    });
    garageIds = (ids as string[]) || [];
    if (garageIds.length === 0) {
      return { vehicles: [], totalCount: 0, totalPages: 1, currentPage: page };
    }
  }

  // Use the ranked search RPC for relevance-ordered results
  const { data, error } = await supabase.rpc("search_cars_ranked", {
    p_search: filters.search || null,
    p_brand_id: filters.brandId || null,
    p_category: filters.category || null,
    p_year_from: filters.yearFrom ? parseInt(filters.yearFrom) : null,
    p_year_to: filters.yearTo ? parseInt(filters.yearTo) : null,
    p_price_min: filters.priceRange?.min ?? null,
    p_price_max: filters.priceRange?.max ?? null,
    p_transmission: (filters.category === "car" || !filters.category) ? (filters.transmission || null) : null,
    p_fuel: filters.fuel || null,
    p_color: filters.color || null,
    p_doors: (filters.category === "car" || !filters.category) && filters.doors ? parseInt(filters.doors) : null,
    p_condition: filters.condition || null,
    p_cooling_type: filters.category === "motorcycle" ? (filters.coolingType || null) : null,
    p_motorcycle_category: filters.category === "motorcycle" ? (filters.motorcycleCategory || null) : null,
    p_garage_ids: garageIds,
    p_limit: PAGE_SIZE,
    p_offset: offset,
    p_version: filters.version || null,
  });

  if (error) throw error;

  const rows = (data || []) as any[];
  const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

  const vehicles: VehicleData[] = rows.map((row) => ({
    id: row.car_id,
    slug: row.car_slug,
    code: row.car_code,
    model: row.car_model,
    year: row.car_year,
    model_year: row.car_model_year,
    version: row.car_version,
    mileage: row.car_mileage,
    transmission: row.car_transmission,
    fuel: row.car_fuel,
    color: row.car_color,
    price: row.car_price,
    photos: row.car_photos || [],
    status: "available",
    doors: row.car_doors,
    condition: row.car_condition,
    category: row.car_category,
    engine_cc: row.car_engine_cc,
    cooling_type: row.car_cooling_type,
    motorcycle_category: row.car_motorcycle_category,
    brand_id: row.car_brand_id,
    brands: row.brand_name ? { name: row.brand_name, logo_url: row.brand_logo_url } : null,
  }));

  return {
    vehicles,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}

export function useVehiclesPaginatedQuery(page: number, filters: VehicleFilters) {
  return useQuery({
    queryKey: ["vehicles-paginated", page, filters],
    queryFn: () => fetchVehiclesPage({ page, filters }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export { PAGE_SIZE };
