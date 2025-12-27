import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CarCard } from "@/components/public/CarCard";
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
import { Search, SlidersHorizontal, X } from "lucide-react";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";

interface Brand {
  id: string;
  name: string;
}

// Interface matching the public_active_cars VIEW
interface PublicCar {
  id: string;
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
  is_featured: boolean;
  created_at: string;
  brand_id: string;
  brand_name: string;
  brand_logo_url: string | null;
}

interface Car {
  id: string;
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
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("busca") || "");
  const [brand, setBrand] = useState(searchParams.get("marca") || "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("ano_de") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("ano_ate") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("preco") || "");
  const [transmission, setTransmission] = useState(searchParams.get("cambio") || "");
  const [fuel, setFuel] = useState(searchParams.get("combustivel") || "");
  const [color, setColor] = useState(searchParams.get("cor") || "");
  const [doors, setDoors] = useState(searchParams.get("portas") || "");
  const [condition, setCondition] = useState(searchParams.get("condicao") || "");

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setBrands(data || []);
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      
      // Use the secure public VIEW
      let query = supabase
        .from("public_active_cars")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters on VIEW columns
      if (search) {
        query = query.or(`model.ilike.%${search}%,code.ilike.%${search}%,brand_name.ilike.%${search}%`);
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

      if (transmission) {
        query = query.eq("transmission", transmission as any);
      }

      if (fuel) {
        query = query.eq("fuel", fuel as any);
      }

      if (color) {
        query = query.eq("color", color);
      }

      if (brand) {
        query = query.eq("brand_name", brand);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching cars:", error);
        setCars([]);
      } else {
        // Transform VIEW data to match component expected format
        const transformedCars: Car[] = (data as PublicCar[] || []).map((car) => ({
          id: car.id,
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
          doors: null, // VIEW doesn't include doors
          condition: null, // VIEW doesn't include condition
          brands: {
            name: car.brand_name,
            logo_url: car.brand_logo_url,
          },
        }));
        
        setCars(transformedCars);
      }
      setIsLoading(false);
    };

    fetchCars();
  }, [search, brand, yearFrom, yearTo, priceRange, transmission, fuel, color]);

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setYearFrom("");
    setYearTo("");
    setPriceRange("");
    setTransmission("");
    setFuel("");
    setColor("");
    setDoors("");
    setCondition("");
    setSearchParams({});
  };

  const hasFilters = search || brand || yearFrom || yearTo || priceRange || transmission || fuel || color || doors || condition;

  const activeFiltersCount = [brand, yearFrom, yearTo, priceRange, transmission, fuel, color, doors, condition].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Brand */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Marca
        </label>
        <Select value={brand || "all"} onValueChange={(v) => setBrand(v === "all" ? "" : v)}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.name}>
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

      {/* Transmission */}
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

      {/* Fuel */}
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
            {Object.entries(FUEL_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      {/* Doors */}
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
              Veículos Disponíveis
            </h1>
            <p className="text-muted-foreground mt-2">
              Encontre o carro perfeito para você
            </p>
          </div>

          {/* Sticky Search & Filter Bar */}
          <div className="sticky top-0 z-40 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por marca, modelo ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
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

          {/* Cars Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Nenhum veículo encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou faça uma nova busca
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
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
