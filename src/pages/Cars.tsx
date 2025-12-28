import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CarCard } from "@/components/public/CarCard";
import { AdCard } from "@/components/public/AdCard";
import { useAdsRotation } from "@/hooks/useAdsRotation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Car, Bike } from "lucide-react";
import { 
  FUEL_LABELS, 
  TRANSMISSION_LABELS, 
  CAR_FUEL_LABELS, 
  MOTORCYCLE_FUEL_LABELS,
  COOLING_TYPE_LABELS,
  MOTORCYCLE_CATEGORY_LABELS 
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface Brand {
  id: string;
  name: string;
}

interface CarData {
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
  photos: string[];
  status: string;
  doors: number | null;
  condition: string | null;
  category: string;
  engine_cc: number | null;
  cooling_type: string | null;
  motorcycle_category: string | null;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

const priceRanges = [
  { label: "Até R$ 30.000", min: 0, max: 30000 },
  { label: "R$ 30.000 - R$ 50.000", min: 30000, max: 50000 },
  { label: "R$ 50.000 - R$ 80.000", min: 50000, max: 80000 },
  { label: "R$ 80.000 - R$ 120.000", min: 80000, max: 120000 },
  { label: "R$ 120.000 - R$ 200.000", min: 120000, max: 200000 },
  { label: "Acima de R$ 200.000", min: 200000, max: 99999999 },
];

const COLORS = [
  "Preto",
  "Branco",
  "Prata",
  "Cinza",
  "Vermelho",
  "Azul",
  "Verde",
  "Amarelo",
  "Laranja",
  "Marrom",
  "Bege",
  "Dourado",
  "Vinho",
];

const DOORS_OPTIONS = [
  { value: "2", label: "2 Portas" },
  { value: "4", label: "4 Portas" },
];

const CONDITION_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "used", label: "Usado" },
];

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<CarData[]>([]);
  const [carBrands, setCarBrands] = useState<Brand[]>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { hasAds, getNextAd } = useAdsRotation();

  // Filters - brandId is the brand UUID, not the name
  const [search, setSearch] = useState(searchParams.get("busca") || "");
  const [brandId, setBrandId] = useState(searchParams.get("brandId") || "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("ano_de") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("ano_ate") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("preco") || "");
  const [transmission, setTransmission] = useState(searchParams.get("cambio") || "");
  const [fuel, setFuel] = useState(searchParams.get("combustivel") || "");
  const [color, setColor] = useState(searchParams.get("cor") || "");
  const [doors, setDoors] = useState(searchParams.get("portas") || "");
  const [condition, setCondition] = useState(searchParams.get("condicao") || "");
  const [category, setCategory] = useState(searchParams.get("type") || searchParams.get("categoria") || "");
  const [coolingType, setCoolingType] = useState(searchParams.get("refrigeracao") || "");
  const [motorcycleCategory, setMotorcycleCategory] = useState(searchParams.get("categoria_moto") || "");

  // Get brands based on selected category - COMPLETE SEPARATION
  const filteredBrands = useMemo(() => {
    if (category === 'motorcycle') {
      return motorcycleBrands;
    }
    if (category === 'car') {
      return carBrands;
    }
    // "Todos" - combine both arrays, dedupe by id
    const allBrandsMap = new Map<string, Brand>();
    carBrands.forEach(b => allBrandsMap.set(b.id, b));
    motorcycleBrands.forEach(b => allBrandsMap.set(b.id, b));
    return Array.from(allBrandsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [category, carBrands, motorcycleBrands]);

  // Sync category and brandId from URL on mount and URL changes
  useEffect(() => {
    const urlType = searchParams.get("type") || searchParams.get("categoria") || "";
    const urlBrandId = searchParams.get("brandId") || "";
    
    // Update category if different
    if (urlType !== category) {
      setCategory(urlType);
      // Only clear filters if changing category without brandId (manual category change)
      if (!urlBrandId) {
        setBrandId("");
        setTransmission("");
        setFuel("");
        setDoors("");
        setCoolingType("");
        setMotorcycleCategory("");
      }
    }
    
    // Update brandId if different
    if (urlBrandId !== brandId) {
      setBrandId(urlBrandId);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBrandsData = async () => {
      // Fetch car brands (category = 'car') - SEPARATE ARRAY
      const { data: carBrandsData } = await supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .eq("category", "car")
        .order("name");
      
      // Fetch motorcycle brands (category = 'motorcycle') - SEPARATE ARRAY
      const { data: motorcycleBrandsData } = await supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .eq("category", "motorcycle")
        .order("name");

      setCarBrands(carBrandsData || []);
      setMotorcycleBrands(motorcycleBrandsData || []);
    };
    fetchBrandsData();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      
      let query = supabase
        .from("cars")
        .select(`
          id,
          slug,
          code,
          brand_id,
          model,
          year,
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

      // Apply category filter first (car or motorcycle)
      if (category) {
        query = query.eq("category", category);
      }

      // Apply filters
      if (search) {
        query = query.or(`model.ilike.%${search}%,code.ilike.%${search}%`);
      }

      if (yearFrom) {
        query = query.gte("year", parseInt(yearFrom));
      }

      if (yearTo) {
        query = query.lte("year", parseInt(yearTo));
      }

      if (priceRange) {
        const range = priceRanges.find((r) => r.label === priceRange);
        if (range) {
          query = query.gte("price", range.min).lte("price", range.max);
        }
      }

      // CAR-SPECIFIC FILTERS
      if (category === "car" || !category) {
        if (transmission) {
          query = query.eq("transmission", transmission as "manual" | "automatic" | "cvt" | "semi_automatic");
        }
      }

      if (fuel) {
        query = query.eq("fuel", fuel as "gasoline" | "ethanol" | "flex" | "diesel" | "electric" | "hybrid");
      }

      if (color) {
        query = query.eq("color", color);
      }

      // CAR-SPECIFIC: doors filter
      if ((category === "car" || !category) && doors) {
        query = query.eq("doors", parseInt(doors));
      }

      if (condition) {
        query = query.eq("condition", condition);
      }

      // MOTORCYCLE-SPECIFIC FILTERS
      if (category === "motorcycle") {
        if (coolingType) {
          query = query.eq("cooling_type", coolingType);
        }
        if (motorcycleCategory) {
          query = query.eq("motorcycle_category", motorcycleCategory);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching cars:", error);
        setCars([]);
      } else {
        // Filter by brand_id if selected
        let filteredData = data || [];
        if (brandId) {
          // brandId is the UUID, match against the brand relationship
          filteredData = filteredData.filter((car) => {
            // Get brand_id from the car (it's in the query as brand_id)
            const carBrandId = (car as any).brand_id;
            return carBrandId === brandId;
          });
        }

        // Transform data to match component expected format
        const transformedCars: CarData[] = filteredData.map((car) => ({
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
          brands: car.brands,
        }));
        
        // When no category filter (all vehicles), randomize the order
        if (!category) {
          for (let i = transformedCars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [transformedCars[i], transformedCars[j]] = [transformedCars[j], transformedCars[i]];
          }
        }
        
        setCars(transformedCars);
      }
      setIsLoading(false);
    };

    fetchCars();
  }, [search, brandId, yearFrom, yearTo, priceRange, transmission, fuel, color, doors, condition, category, coolingType, motorcycleCategory]);

  const handleCategoryChange = (newCategory: string) => {
    // Clear category-specific filters when changing
    setBrandId("");
    setTransmission("");
    setFuel("");
    setDoors("");
    setCoolingType("");
    setMotorcycleCategory("");
    setCategory(newCategory);
    
    // Update URL with type param
    if (newCategory) {
      setSearchParams({ type: newCategory });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearch("");
    setBrandId("");
    setYearFrom("");
    setYearTo("");
    setPriceRange("");
    setTransmission("");
    setFuel("");
    setColor("");
    setDoors("");
    setCondition("");
    setCategory("");
    setCoolingType("");
    setMotorcycleCategory("");
    setSearchParams({});
  };

  const hasFilters = search || brandId || yearFrom || yearTo || priceRange || transmission || fuel || color || doors || condition || category || coolingType || motorcycleCategory;

  const activeFiltersCount = [brandId, yearFrom, yearTo, priceRange, transmission, fuel, color, doors, condition, coolingType, motorcycleCategory].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Category Selector - TOP OF FILTERS */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Tipo de Veículo
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange("")}
            className={`flex items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all text-sm ${
              !category
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="font-medium">Todos</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("car")}
            className={`flex items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all text-sm ${
              category === 'car'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Car className="h-4 w-4" />
            <span className="font-medium">Carros</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("motorcycle")}
            className={`flex items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all text-sm ${
              category === 'motorcycle'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Bike className="h-4 w-4" />
            <span className="font-medium">Motos</span>
          </button>
        </div>
      </div>

      {/* Brand - Filtered by category, using brandId */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Marca
        </label>
        <Select value={brandId || "all"} onValueChange={(v) => setBrandId(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Todas</SelectItem>
            {filteredBrands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year From */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Ano de
        </label>
        <Select value={yearFrom || "all"} onValueChange={(v) => setYearFrom(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year To */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Ano até
        </label>
        <Select value={yearTo || "all"} onValueChange={(v) => setYearTo(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Faixa de Preço
        </label>
        <Select value={priceRange || "all"} onValueChange={(v) => setPriceRange(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {priceRanges.map((r) => (
              <SelectItem key={r.label} value={r.label}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CAR-SPECIFIC FILTERS */}
      {(category === "car" || !category) && (
        <>
          {/* Transmission - Only for cars */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Câmbio
            </label>
            <Select value={transmission || "all"} onValueChange={(v) => setTransmission(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Qualquer</SelectItem>
                {Object.entries(TRANSMISSION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doors - Only for cars */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Portas
            </label>
            <Select value={doors || "all"} onValueChange={(v) => setDoors(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Qualquer</SelectItem>
                {DOORS_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Fuel - Different options based on category */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Combustível
        </label>
        <Select value={fuel || "all"} onValueChange={(v) => setFuel(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {Object.entries(category === "motorcycle" ? MOTORCYCLE_FUEL_LABELS : (category === "car" ? CAR_FUEL_LABELS : FUEL_LABELS)).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* MOTORCYCLE-SPECIFIC FILTERS */}
      {category === "motorcycle" && (
        <>
          {/* Cooling Type - Only for motorcycles */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Refrigeração
            </label>
            <Select value={coolingType || "all"} onValueChange={(v) => setCoolingType(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Qualquer</SelectItem>
                {Object.entries(COOLING_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motorcycle Category - Only for motorcycles */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Categoria da Moto
            </label>
            <Select value={motorcycleCategory || "all"} onValueChange={(v) => setMotorcycleCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Qualquer</SelectItem>
                {Object.entries(MOTORCYCLE_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Color */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Cor
        </label>
        <Select value={color || "all"} onValueChange={(v) => setColor(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {COLORS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Condição
        </label>
        <Select value={condition || "all"} onValueChange={(v) => setCondition(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {CONDITION_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full gap-2">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <section className="py-8 md:py-12 bg-muted/30 min-h-screen">
        <div className="container">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {category === "motorcycle" ? "Motos Disponíveis" : category === "car" ? "Carros Disponíveis" : "Veículos Disponíveis"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {category === "motorcycle" ? "Encontre a moto perfeita para você" : category === "car" ? "Encontre o carro perfeito para você" : "Encontre o veículo perfeito para você"}
            </p>
          </div>

          {/* Sticky Search & Filter Bar */}
          <div className="sticky top-0 z-40 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por modelo ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
              </div>
              
              {/* Category Quick Selector */}
              <div className="flex gap-2">
                <Button
                  variant={category === "car" ? "default" : "outline"}
                  className="gap-2 h-12"
                  onClick={() => handleCategoryChange(category === "car" ? "" : "car")}
                >
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Carros</span>
                </Button>
                <Button
                  variant={category === "motorcycle" ? "default" : "outline"}
                  className="gap-2 h-12"
                  onClick={() => handleCategoryChange(category === "motorcycle" ? "" : "motorcycle")}
                >
                  <Bike className="h-4 w-4" />
                  <span className="hidden sm:inline">Motos</span>
                </Button>
              </div>
              
              {/* Filter Button with Sheet for Mobile/All */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 gap-2 shrink-0"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-left">Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mt-3">
              {isLoading ? "Carregando..." : (
                <span className="font-medium">
                  Resultados encontrados ({cars.length})
                </span>
              )}
            </p>
          </div>

          {/* Cars Grid with Ads Intercalation */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-xl bg-card" />
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const items: React.ReactNode[] = [];

                cars.forEach((car, index) => {
                  items.push(<CarCard key={car.id} car={car} />);

                  // Insert ad after every 5 cars, but never as the first item
                  if (
                    hasAds &&
                    cars.length >= 5 &&
                    (index + 1) % 5 === 0 &&
                    index + 1 < cars.length
                  ) {
                    const ad = getNextAd();
                    if (ad) {
                      items.push(
                        <AdCard key={`cars-ad-${ad.id}-${index}`} ad={ad} />
                      );
                    }
                  }
                });

                // Always ensure a final ad at the end of the list
                if (hasAds) {
                  const finalAd = getNextAd();
                  if (finalAd) {
                    items.push(
                      <AdCard
                        key={`cars-ad-final-${finalAd.id}`}
                        ad={finalAd}
                      />
                    );
                  }
                }

                return items;
              })()}
            </div>
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-xl border border-border/50">
              <div className="flex justify-center mb-4">
                {category === "motorcycle" ? (
                  <Bike className="h-16 w-16 text-muted-foreground/50" />
                ) : category === "car" ? (
                  <Car className="h-16 w-16 text-muted-foreground/50" />
                ) : (
                  <Search className="h-16 w-16 text-muted-foreground/50" />
                )}
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                {category === "motorcycle" 
                  ? "Nenhuma moto cadastrada no momento" 
                  : category === "car" 
                    ? "Nenhum carro cadastrado nesta categoria"
                    : "Nenhum veículo encontrado"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {category ? "Não há veículos disponíveis no momento" : "Tente ajustar os filtros de busca"}
              </p>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 gap-2">
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
