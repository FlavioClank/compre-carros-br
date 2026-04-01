import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { VehicleFilters, VehicleData } from "@/hooks/useVehiclesInfiniteQuery";

const PAGE_SIZE = 32;

interface PaginatedResult {
  vehicles: VehicleData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  warning?: string | null;
}

const FALLBACK_WARNING = "A busca avançada ficou indisponível no backend. Exibindo os veículos com fallback automático.";

const FALLBACK_SELECT = `
  id,
  slug,
  code,
  brand_id,
  model,
  year,
  model_year,
  version,
  mileage,
  transmission,
  fuel,
  color,
  price,
  photos,
  doors,
  condition,
  category,
  engine_cc,
  cooling_type,
  motorcycle_category,
  created_at,
  is_featured,
  brands:brand_id (
    name,
    logo_url
  )
`;

function mapRpcRow(row: any): VehicleData {
  return {
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
  };
}

function mapFallbackRow(row: any): VehicleData {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    model: row.model,
    year: row.year,
    model_year: row.model_year,
    version: row.version,
    mileage: row.mileage,
    transmission: row.transmission,
    fuel: row.fuel,
    color: row.color,
    price: row.price,
    photos: row.photos || [],
    status: "available",
    doors: row.doors,
    condition: row.condition,
    category: row.category,
    engine_cc: row.engine_cc,
    cooling_type: row.cooling_type,
    motorcycle_category: row.motorcycle_category,
    brand_id: row.brand_id,
    brands: row.brands,
  };
}

async function resolveGarageIds(filters: VehicleFilters): Promise<string[] | null> {
  if (!filters.garageCity && !filters.garageState) {
    return null;
  }

  const { data: ids, error } = await supabase.rpc("get_garage_ids_by_location", {
    p_city: filters.garageCity || null,
    p_state: filters.garageState || null,
  });

  if (error) {
    throw error;
  }

  return (ids as string[]) || [];
}

async function fetchVehiclesFallback({
  page,
  filters,
  garageIds,
}: {
  page: number;
  filters: VehicleFilters;
  garageIds: string[] | null;
}): Promise<PaginatedResult> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("cars")
    .select(FALLBACK_SELECT, { count: "exact" })
    .eq("status", "available")
    .eq("garage_is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    query = query.or(`model.ilike.%${filters.search}%,code.ilike.%${filters.search}%,version.ilike.%${filters.search}%`);
  }

  if (filters.yearFrom) {
    query = query.gte("year", parseInt(filters.yearFrom));
  }

  if (filters.yearTo) {
    query = query.lte("year", parseInt(filters.yearTo));
  }

  if (filters.priceRange) {
    query = query.gte("price", filters.priceRange.min).lte("price", filters.priceRange.max);
  }

  if ((filters.category === "car" || !filters.category) && filters.transmission) {
    query = query.eq("transmission", filters.transmission as "manual" | "automatic" | "cvt" | "semi_automatic");
  }

  if (filters.fuel) {
    query = query.eq("fuel", filters.fuel as "gasoline" | "ethanol" | "flex" | "diesel" | "electric" | "hybrid");
  }

  if (filters.color) {
    query = query.ilike("color", `${filters.color}%`);
  }

  if ((filters.category === "car" || !filters.category) && filters.doors) {
    query = query.eq("doors", parseInt(filters.doors));
  }

  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }

  if (filters.category === "motorcycle") {
    if (filters.coolingType) {
      query = query.eq("cooling_type", filters.coolingType);
    }

    if (filters.motorcycleCategory) {
      query = query.eq("motorcycle_category", filters.motorcycleCategory);
    }
  }

  if (garageIds && garageIds.length > 0) {
    query = query.in("garage_id", garageIds);
  }

  if (filters.version) {
    query = query.ilike("version", `%${filters.version}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  const vehicles = (data || []).map(mapFallbackRow);
  const totalCount = count ?? vehicles.length;

  return {
    vehicles,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
    warning: FALLBACK_WARNING,
  };
}

async function fetchVehiclesPage({
  page,
  filters,
}: {
  page: number;
  filters: VehicleFilters;
}): Promise<PaginatedResult> {
  const offset = page * PAGE_SIZE;
  const garageIds = await resolveGarageIds(filters);

  if (garageIds && garageIds.length === 0) {
    return { vehicles: [], totalCount: 0, totalPages: 1, currentPage: page };
  }

  const rpcParams: Record<string, any> = {
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
  };

  const { data, error } = await supabase.rpc("search_cars_ranked", rpcParams as any);

  if (error) {
    console.error("search_cars_ranked failed, using fallback query", error, rpcParams);
    return fetchVehiclesFallback({ page, filters, garageIds });
  }

  const rows = (data || []) as any[];
  const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;

  return {
    vehicles: rows.map(mapRpcRow),
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
    warning: null,
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
