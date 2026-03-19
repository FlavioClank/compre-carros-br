import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 18;

export interface VehicleFilters {
  search?: string;
  brandId?: string;
  yearFrom?: string;
  yearTo?: string;
  priceRange?: { min: number; max: number };
  transmission?: string;
  fuel?: string;
  color?: string;
  doors?: string;
  condition?: string;
  category?: string;
  coolingType?: string;
  motorcycleCategory?: string;
  garageCity?: string;
  garageState?: string;
  version?: string;
}

export interface VehicleData {
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
  photos: string[];
  status: string;
  doors: number | null;
  condition: string | null;
  category: string;
  engine_cc: number | null;
  cooling_type: string | null;
  motorcycle_category: string | null;
  brand_id: string;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

async function fetchVehicles({ 
  pageParam = 0, 
  filters 
}: { 
  pageParam?: number; 
  filters: VehicleFilters;
}) {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("cars")
    .select(`
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
      brands:brand_id (
        name,
        logo_url
      )
    `)
    .order("created_at", { ascending: false });

  // Apply category filter
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  // Apply search filter
  if (filters.search) {
    query = query.or(`model.ilike.%${filters.search}%,code.ilike.%${filters.search}%,version.ilike.%${filters.search}%`);
  }

  // Apply year filters
  if (filters.yearFrom) {
    const yf = parseInt(filters.yearFrom);
    query = query.or(`year.gte.${yf},model_year.gte.${yf}`);
  }
  if (filters.yearTo) {
    query = query.lte("year", parseInt(filters.yearTo));
  }

  // Apply price filter
  if (filters.priceRange) {
    query = query.gte("price", filters.priceRange.min).lte("price", filters.priceRange.max);
  }

  // Apply car-specific filters
  if ((filters.category === "car" || !filters.category) && filters.transmission) {
    query = query.eq("transmission", filters.transmission as "manual" | "automatic" | "cvt" | "semi_automatic");
  }

  if (filters.fuel) {
    query = query.eq("fuel", filters.fuel as "gasoline" | "ethanol" | "flex" | "diesel" | "electric" | "hybrid");
  }

  if (filters.color) {
    query = query.eq("color", filters.color);
  }

  if ((filters.category === "car" || !filters.category) && filters.doors) {
    query = query.eq("doors", parseInt(filters.doors));
  }

  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }

  // Apply motorcycle-specific filters
  if (filters.category === "motorcycle") {
    if (filters.coolingType) {
      query = query.eq("cooling_type", filters.coolingType);
    }
    if (filters.motorcycleCategory) {
      query = query.eq("motorcycle_category", filters.motorcycleCategory);
    }
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) throw error;

  // Filter by brandId client-side if needed
  let filteredData = data || [];
  if (filters.brandId) {
    filteredData = filteredData.filter((car) => car.brand_id === filters.brandId);
  }

  const vehicles: VehicleData[] = filteredData.map((car) => ({
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
    nextPage: vehicles.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
}

export function useVehiclesInfiniteQuery(filters: VehicleFilters) {
  return useInfiniteQuery({
    queryKey: ["vehicles-search", filters],
    queryFn: ({ pageParam }) => fetchVehicles({ pageParam, filters }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
