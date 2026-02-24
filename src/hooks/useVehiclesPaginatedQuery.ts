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
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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

  // Count query
  let countQuery = supabase
    .from("cars")
    .select("*", { count: "exact", head: true });

  // Data query
  let dataQuery = supabase
    .from("cars")
    .select(`
      id, slug, code, brand_id, model, year, version, mileage,
      transmission, fuel, color, price, photos, doors, condition,
      category, engine_cc, cooling_type, motorcycle_category, created_at,
      brands:brand_id ( name, logo_url )
    `)
    .order("created_at", { ascending: false });

  // Apply filters to both queries
  const applyFilters = (q: typeof countQuery | typeof dataQuery) => {
    if (garageIds) q = q.in("garage_id", garageIds);
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.search) q = q.or(`model.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    if (filters.yearFrom) q = q.gte("year", parseInt(filters.yearFrom));
    if (filters.yearTo) q = q.lte("year", parseInt(filters.yearTo));
    if (filters.priceRange) q = q.gte("price", filters.priceRange.min).lte("price", filters.priceRange.max);
    if ((filters.category === "car" || !filters.category) && filters.transmission) {
      q = q.eq("transmission", filters.transmission as any);
    }
    if (filters.fuel) q = q.eq("fuel", filters.fuel as any);
    if (filters.color) q = q.eq("color", filters.color);
    if ((filters.category === "car" || !filters.category) && filters.doors) {
      q = q.eq("doors", parseInt(filters.doors));
    }
    if (filters.condition) q = q.eq("condition", filters.condition);
    if (filters.category === "motorcycle") {
      if (filters.coolingType) q = q.eq("cooling_type", filters.coolingType);
      if (filters.motorcycleCategory) q = q.eq("motorcycle_category", filters.motorcycleCategory);
    }
    if (filters.brandId) q = q.eq("brand_id", filters.brandId);
    return q;
  };

  countQuery = applyFilters(countQuery) as typeof countQuery;
  dataQuery = applyFilters(dataQuery) as typeof dataQuery;

  // Apply pagination to data query only
  dataQuery = dataQuery.range(from, to);

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  if (countResult.error) throw countResult.error;
  if (dataResult.error) throw dataResult.error;

  const totalCount = countResult.count || 0;

  const vehicles: VehicleData[] = (dataResult.data || []).map((car) => ({
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
    photos: car.photos || [],
    status: "available",
    doors: car.doors,
    condition: car.condition,
    category: car.category,
    engine_cc: car.engine_cc,
    cooling_type: car.cooling_type,
    motorcycle_category: car.motorcycle_category,
    brand_id: car.brand_id,
    brands: car.brands,
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
    placeholderData: (prev) => prev, // keep previous data while loading next page
  });
}

export { PAGE_SIZE };
