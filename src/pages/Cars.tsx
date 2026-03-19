import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { parseSearchQuery, applyCorrections } from "@/lib/search-utils";
import { shuffleSeeded, getHalfHourSeed } from "@/lib/shuffle";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useParams } from "react-router-dom";
import { citySlugToName, getStateAbbr } from "@/lib/geo-utils";
import { supabase } from "@/lib/supabase";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CarCard } from "@/components/public/CarCard";
import { PartnerCard } from "@/components/public/PartnerCard";
import { usePartnersRotation } from "@/hooks/usePartnersRotation";
import { useVehiclesPaginatedQuery } from "@/hooks/useVehiclesPaginatedQuery";
import { interleaveVehiclesWithPartners } from "@/lib/interleave-partners";
import { PaginationControls } from "@/components/public/PaginationControls";
import { VehicleFilters, VehicleData } from "@/hooks/useVehiclesInfiniteQuery";
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
import { Search, SlidersHorizontal, X, Car, Bike, Loader2, Mic, MicOff } from "lucide-react";
import { 
  FUEL_LABELS, 
  TRANSMISSION_LABELS, 
  CAR_FUEL_LABELS, 
  MOTORCYCLE_FUEL_LABELS,
  COOLING_TYPE_LABELS,
  MOTORCYCLE_CATEGORY_LABELS 
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { canonicalUrl } from "@/lib/seo";

interface Brand {
  id: string;
  name: string;
  category?: string;
}

interface BrandDisplay {
  id: string;
  name: string;
  displayName: string;
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
  | { type: "car"; data: VehicleData }
  | { type: "ad"; data: Ad };

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

// Color normalization map - maps variations to main color
const COLOR_NORMALIZE_MAP: Record<string, string> = {
  branco: "Branco",
  branca: "Branco",
  preto: "Preto",
  preta: "Preto",
  cinza: "Cinza",
  "cinza grafite": "Cinza",
  "cinza escuro": "Cinza",
  "cinza claro": "Cinza",
  prata: "Prata",
  vermelho: "Vermelho",
  vermelha: "Vermelho",
  azul: "Azul",
  verde: "Verde",
  amarelo: "Amarelo",
  amarela: "Amarelo",
  laranja: "Laranja",
  marrom: "Marrom",
  bege: "Bege",
  dourado: "Dourado",
  dourada: "Dourado",
  vinho: "Vinho",
  bordô: "Vinho",
  bordo: "Vinho",
};

function normalizeColor(color: string): string {
  const lower = color.toLowerCase().trim();
  return COLOR_NORMALIZE_MAP[lower] || color;
}

const MAIN_COLORS = [
  "Branco",
  "Preto",
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

// Memoized card wrapper
const CardItem = memo(function CardItem({ item }: { item: ListItem }) {
  if (item.type === "car") {
    return <CarCard car={item.data} />;
  }
  return <PartnerCard item={item.data} />;
});

// Voice search support
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!isSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
};

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { estado, cidade } = useParams<{ estado?: string; cidade?: string }>();
  
  // Geo context from URL params
  const geoCity = cidade ? citySlugToName(cidade) : "";
  const geoStateAbbr = estado ? getStateAbbr(estado) : "";
  
  const [carBrands, setCarBrands] = useState<Brand[]>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<Brand[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("pagina") || "0");
    return isNaN(p) ? 0 : p;
  });
  const listRef = useRef<HTMLDivElement>(null);
  const { ads, hasAds } = usePartnersRotation();
  const seed = getHalfHourSeed();
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition();

  // Filters state — initialize from URL params
  const [search, setSearch] = useState(searchParams.get("busca") || "");
  const [brandId, setBrandId] = useState(searchParams.get("brandId") || "");
  const [modelFilter, setModelFilter] = useState(searchParams.get("modelo") || "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("ano_de") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("ano_ate") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("preco") || "");
  const [transmission, setTransmission] = useState(searchParams.get("cambio") || "");
  const [fuel, setFuel] = useState(searchParams.get("combustivel") || "");
  const [color, setColor] = useState(searchParams.get("cor") || "");
  const [category, setCategory] = useState(searchParams.get("type") || searchParams.get("categoria") || "");
  const [coolingType, setCoolingType] = useState(searchParams.get("refrigeracao") || "");
  const [motorcycleCategory, setMotorcycleCategory] = useState(searchParams.get("categoria_moto") || "");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // All brands combined for smart search matching
  const allBrands = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    carBrands.forEach((b) => map.set(b.id, { id: b.id, name: b.name }));
    motorcycleBrands.forEach((b) => map.set(b.id, { id: b.id, name: b.name }));
    return Array.from(map.values());
  }, [carBrands, motorcycleBrands]);

  // Parse search text into structured filters
  const parsedSearch = useMemo(() => {
    if (!search) return null;
    return parseSearchQuery(search, allBrands);
  }, [search, allBrands]);

  // Build filters object for query — merge manual filters with smart-parsed ones
  const filters = useMemo((): VehicleFilters => {
    const priceRangeObj = priceRange 
      ? priceRanges.find((r) => r.label === priceRange) 
      : undefined;

    // Smart search: use parsed values only when user hasn't manually set filter
    const effectiveBrandId = brandId || parsedSearch?.detectedBrandId || undefined;
    const effectiveYearFrom = yearFrom || parsedSearch?.detectedYear || undefined;
    const effectiveYearTo = yearTo || parsedSearch?.detectedYear || undefined;
    const effectiveFuel = fuel || parsedSearch?.detectedFuel || undefined;
    const effectiveTransmission = transmission || parsedSearch?.detectedTransmission || undefined;
    const effectiveSearch = modelFilter 
      ? modelFilter 
      : (parsedSearch?.searchText || (search && !parsedSearch ? search : undefined));
    
    return {
      search: effectiveSearch || undefined,
      brandId: effectiveBrandId,
      yearFrom: effectiveYearFrom,
      yearTo: effectiveYearTo,
      priceRange: priceRangeObj ? { min: priceRangeObj.min, max: priceRangeObj.max } : undefined,
      transmission: effectiveTransmission,
      fuel: effectiveFuel,
      color: color || undefined,
      category: category || undefined,
      coolingType: coolingType || undefined,
      motorcycleCategory: motorcycleCategory || undefined,
      garageCity: geoCity || undefined,
      garageState: geoStateAbbr || undefined,
    };
  }, [search, parsedSearch, brandId, modelFilter, yearFrom, yearTo, priceRange, transmission, fuel, color, category, coolingType, motorcycleCategory, geoCity, geoStateAbbr]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Reset to page 0 when logo is clicked while on search page
  useEffect(() => {
    const handleReset = () => setPage(0);
    window.addEventListener("reset-search", handleReset);
    return () => window.removeEventListener("reset-search", handleReset);
  }, []);

  // Paginated query for vehicles
  const { data, isLoading, isError, isFetching } = useVehiclesPaginatedQuery(page, filters);

  const vehicles = data?.vehicles ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Shuffle vehicles deterministically to mix garages
  const shuffledVehicles = useMemo(() => {
    if (vehicles.length === 0) return [];
    return shuffleSeeded(vehicles, seed + page);
  }, [vehicles, seed, page]);

  // Build list items with intercalated ads — continuous rotation across pages
  const ADS_PER_PAGE = 6;
  const adStartIndex = useMemo(() => {
    if (ads.length === 0) return 0;
    return (page * ADS_PER_PAGE) % ads.length;
  }, [page, ads.length]);

  const listItems = useMemo((): ListItem[] => {
    if (shuffledVehicles.length === 0) return [];
    return interleaveVehiclesWithPartners(shuffledVehicles, ads, ADS_PER_PAGE, adStartIndex);
  }, [shuffledVehicles, ads, adStartIndex]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  // Get brands based on selected category
  const filteredBrands = useMemo((): BrandDisplay[] => {
    if (category === 'motorcycle') {
      return motorcycleBrands.map(b => ({ id: b.id, name: b.name, displayName: b.name }));
    }
    if (category === 'car') {
      return carBrands.map(b => ({ id: b.id, name: b.name, displayName: b.name }));
    }
    // "Todos" - combine both arrays
    const carBrandNames = new Set(carBrands.map(b => b.name.toLowerCase()));
    const motorcycleBrandNames = new Set(motorcycleBrands.map(b => b.name.toLowerCase()));
    const duplicateNames = new Set(
      [...carBrandNames].filter(name => motorcycleBrandNames.has(name))
    );
    
    const allBrands: BrandDisplay[] = [];
    
    carBrands.forEach(b => {
      allBrands.push({ id: b.id, name: b.name, displayName: b.name });
    });
    
    motorcycleBrands.forEach(b => {
      const isDuplicate = duplicateNames.has(b.name.toLowerCase());
      allBrands.push({
        id: b.id,
        name: b.name,
        displayName: isDuplicate ? `${b.name} Motos` : b.name
      });
    });
    
    return allBrands.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [category, carBrands, motorcycleBrands]);

  // Sync category and brandId from URL on mount
  useEffect(() => {
    const urlType = searchParams.get("type") || searchParams.get("categoria") || "";
    const urlBrandId = searchParams.get("brandId") || "";
    
    if (urlType !== category) {
      setCategory(urlType);
      if (!urlBrandId) {
        setBrandId("");
        setModelFilter("");
        setTransmission("");
        setFuel("");
        setCoolingType("");
        setMotorcycleCategory("");
      }
    }
    
    if (urlBrandId !== brandId) {
      setBrandId(urlBrandId);
    }
  }, [searchParams]);

  // Fetch brands
  useEffect(() => {
    const fetchBrandsData = async () => {
      const { data: carBrandsData } = await supabase
        .from("brands")
        .select("id, name, category")
        .eq("is_active", true)
        .eq("category", "car")
        .order("name");
      
      const { data: motorcycleBrandsData } = await supabase
        .from("brands")
        .select("id, name, category")
        .eq("is_active", true)
        .eq("category", "motorcycle")
        .order("name");

      setCarBrands(carBrandsData || []);
      setMotorcycleBrands(motorcycleBrandsData || []);
    };
    fetchBrandsData();
  }, []);

  // Fetch available models based on brand
  useEffect(() => {
    const fetchModels = async () => {
      let query = supabase
        .from("cars")
        .select("model")
        .eq("status", "available")
        .eq("garage_is_active", true);
      if (brandId) query = query.eq("brand_id", brandId);
      if (category) query = query.eq("category", category);
      const { data } = await query;
      if (data) {
        const unique = [...new Set(data.map((d) => d.model))].sort();
        setAvailableModels(unique);
      }
    };
    fetchModels();
  }, [brandId, category]);

  // Fetch available colors from DB
  useEffect(() => {
    const fetchColors = async () => {
      let query = supabase
        .from("cars")
        .select("color")
        .eq("status", "available")
        .eq("garage_is_active", true);
      if (category) query = query.eq("category", category);
      const { data } = await query;
      if (data) {
        const normalized = new Map<string, string>();
        data.forEach((d) => {
          const norm = normalizeColor(d.color);
          if (!normalized.has(norm)) normalized.set(norm, norm);
        });
        const sorted = [...normalized.values()].sort();
        setAvailableColors(sorted);
      }
    };
    fetchColors();
  }, [category]);

  // Sync filters to URL params for persistence
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.busca = search;
    if (brandId) params.brandId = brandId;
    if (modelFilter) params.modelo = modelFilter;
    if (yearFrom) params.ano_de = yearFrom;
    if (yearTo) params.ano_ate = yearTo;
    if (priceRange) params.preco = priceRange;
    if (transmission) params.cambio = transmission;
    if (fuel) params.combustivel = fuel;
    if (color) params.cor = color;
    if (category) params.type = category;
    if (coolingType) params.refrigeracao = coolingType;
    if (motorcycleCategory) params.categoria_moto = motorcycleCategory;
    if (page > 0) params.pagina = String(page);
    setSearchParams(params, { replace: true });
  }, [search, brandId, modelFilter, yearFrom, yearTo, priceRange, transmission, fuel, color, category, coolingType, motorcycleCategory, page]);

  const handleCategoryChange = (newCategory: string) => {
    setBrandId("");
    setModelFilter("");
    setTransmission("");
    setFuel("");
    setCoolingType("");
    setMotorcycleCategory("");
    setCategory(newCategory);
  };

  const clearFilters = () => {
    setSearch("");
    setBrandId("");
    setModelFilter("");
    setYearFrom("");
    setYearTo("");
    setPriceRange("");
    setTransmission("");
    setFuel("");
    setColor("");
    setCategory("");
    setCoolingType("");
    setMotorcycleCategory("");
    setPage(0);
  };

  const hasFilters = search || brandId || modelFilter || yearFrom || yearTo || priceRange || transmission || fuel || color || category || coolingType || motorcycleCategory;
  const activeFiltersCount = [brandId, modelFilter, yearFrom, yearTo, priceRange, transmission, fuel, color, coolingType, motorcycleCategory].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Category Selector */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
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

      {/* Brand */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
          Marca
        </label>
        <Select value={brandId || "all"} onValueChange={(v) => { setBrandId(v === "all" ? "" : v); setModelFilter(""); }}>
          <SelectTrigger className="bg-background font-bold">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border font-bold">
            <SelectItem value="all">Todas</SelectItem>
            {filteredBrands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
          Modelo
        </label>
        <Select value={modelFilter || "all"} onValueChange={(v) => setModelFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border max-h-[300px]">
            <SelectItem value="all">Todos</SelectItem>
            {availableModels.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year From */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
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
        <label className="text-sm font-bold text-foreground mb-2 block">
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
        <label className="text-sm font-bold text-foreground mb-2 block">
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
          {/* Transmission */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
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

        </>
      )}

      {/* Fuel */}
      <div>
        <label className="text-sm font-bold text-foreground mb-2 block">
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
          {/* Cooling Type */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
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

          {/* Motorcycle Category */}
          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">
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
        <label className="text-sm font-bold text-foreground mb-2 block">
          Cor
        </label>
        <Select value={color || "all"} onValueChange={(v) => setColor(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Qualquer</SelectItem>
            {availableColors.length > 0
              ? availableColors.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))
              : MAIN_COLORS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="pt-4 border-t border-border space-y-2">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full gap-2">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
          <Button
            size="sm"
            onClick={() => setIsFilterOpen(false)}
            className="w-full lg:hidden bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Aplicar Filtro
          </Button>
        </div>
      )}
      {!hasFilters && (
        <div className="pt-4 lg:hidden">
          <Button
            size="sm"
            onClick={() => setIsFilterOpen(false)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Aplicar Filtro
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <PublicLayout>
      <Helmet>
        <title>
          {geoCity
            ? `Carros Usados em ${geoCity} - ${geoStateAbbr} | CompreCarrosBR`
            : category === "motorcycle" ? "Motos Disponíveis | CompreCarrosBr"
            : category === "car" ? "Carros Disponíveis | CompreCarrosBr"
            : "Veículos Disponíveis | CompreCarrosBr"}
        </title>
        <meta
          name="description"
          content={
            geoCity
              ? `Confira as melhores ofertas de veículos seminovos em ${geoCity}. Acesse e encontre seu próximo carro!`
              : "Encontre veículos seminovos verificados com preços acessíveis. Carros e motos de garagens confiáveis na CompreCarrosBr."
          }
        />
        <link rel="canonical" href={canonicalUrl(geoCity && estado ? `/carros/${estado}/${cidade}` : "/carros")} />
        <meta property="og:url" content={canonicalUrl(geoCity && estado ? `/carros/${estado}/${cidade}` : "/carros")} />
        <meta property="og:title" content={geoCity ? `Carros Usados em ${geoCity} - ${geoStateAbbr}` : "Veículos Disponíveis | CompreCarrosBr"} />
      </Helmet>
      <section className="py-8 md:py-12 bg-muted/30 min-h-screen">
        <div className="container">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {geoCity
                ? `Carros Usados em ${geoCity}, ${geoStateAbbr}`
                : category === "motorcycle" ? "Motos Disponíveis"
                : category === "car" ? "Carros Disponíveis"
                : "Veículos Disponíveis"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {geoCity
                ? `Encontre os melhores veículos seminovos em ${geoCity}, ${geoStateAbbr}`
                : category === "motorcycle" ? "Encontre a moto perfeita para você"
                : category === "car" ? "Encontre o carro perfeito para você"
                : "Encontre o veículo perfeito para você"}
            </p>
          </div>

          {/* Search + Category Bar (not sticky) */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar marca, modelo, ano..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-12 h-12 bg-card border-border"
              />
              {isSupported && (
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening((text) => {
                        const corrected = applyCorrections(text);
                        setSearch(corrected);
                      });
                    }
                  }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                    isListening 
                      ? "bg-destructive/10 text-destructive animate-pulse" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  title={isListening ? "Parar gravação" : "Buscar por voz"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
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
          </div>

          {/* Mobile-only sticky filter button - sticks below header */}
          <div className="lg:hidden sticky top-[64px] z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm mb-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full h-12 gap-2 justify-center text-base">
                  <SlidersHorizontal className="h-5 w-5" />
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

          {/* Results count (not sticky) */}
          <p className="text-sm text-muted-foreground mb-4 lg:hidden text-center">
            {isLoading ? "Carregando..." : (
              <span className="font-medium">
                {totalCount} veículo{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>

          {/* Desktop: sidebar filters + grid | Mobile: grid only */}
          <div className="flex gap-6">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-4">Filtros</h3>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Desktop results count */}
              <div className="hidden lg:block mb-4">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Carregando..." : (
                    <span className="font-medium">
                      {totalCount} veículo{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              </div>

              {/* Cars Grid */}
              <div ref={listRef} />
              {isLoading ? (
                <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5] rounded-xl bg-card" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-16 bg-card/50 rounded-xl border border-border/50">
                  <p className="text-muted-foreground text-lg font-medium">
                    Erro ao carregar veículos
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente novamente mais tarde
                  </p>
                </div>
              ) : listItems.length > 0 ? (
                <>
                  <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {listItems.map((item) => (
                      <CardItem
                        key={item.type === 'car' ? `car-${item.data.id}` : `promo-${item.data.id}`}
                        item={item}
                      />
                    ))}
                  </div>
                  <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isFetching}
                  />
                </>
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
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
