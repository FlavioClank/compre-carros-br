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
import { Search, SlidersHorizontal, X } from "lucide-react";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";

interface Brand {
  id: string;
  name: string;
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

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("busca") || "");
  const [brand, setBrand] = useState(searchParams.get("marca") || "");
  const [yearFrom, setYearFrom] = useState(searchParams.get("ano_de") || "");
  const [yearTo, setYearTo] = useState(searchParams.get("ano_ate") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("preco") || "");
  const [transmission, setTransmission] = useState(searchParams.get("cambio") || "");
  const [fuel, setFuel] = useState(searchParams.get("combustivel") || "");

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
      let query = supabase
        .from("cars")
        .select(`
          id, code, model, year, version, mileage, transmission, fuel, color, price, photos, status,
          brands (name, logo_url)
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false });

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

      if (transmission && ["manual", "automatic", "cvt", "semi_automatic"].includes(transmission)) {
        query = query.eq("transmission", transmission as "manual" | "automatic" | "cvt" | "semi_automatic");
      }

      if (fuel && ["gasoline", "ethanol", "flex", "diesel", "electric", "hybrid"].includes(fuel)) {
        query = query.eq("fuel", fuel as "gasoline" | "ethanol" | "flex" | "diesel" | "electric" | "hybrid");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching cars:", error);
      } else {
        let filteredCars = data || [];
        
        // Filter by brand name (since it's a relation)
        if (brand) {
          filteredCars = filteredCars.filter(
            (car) => car.brands?.name === brand
          );
        }

        // Filter by search in brand name
        if (search) {
          filteredCars = filteredCars.filter(
            (car) =>
              car.model.toLowerCase().includes(search.toLowerCase()) ||
              car.code.toLowerCase().includes(search.toLowerCase()) ||
              car.brands?.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        setCars(filteredCars);
      }
      setIsLoading(false);
    };

    fetchCars();
  }, [search, brand, yearFrom, yearTo, priceRange, transmission, fuel]);

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setYearFrom("");
    setYearTo("");
    setPriceRange("");
    setTransmission("");
    setFuel("");
    setSearchParams({});
  };

  const hasFilters = search || brand || yearFrom || yearTo || priceRange || transmission || fuel;

  return (
    <PublicLayout>
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Veículos Disponíveis
            </h1>
            <p className="text-muted-foreground mt-2">
              Encontre o carro perfeito para você
            </p>
          </div>

          {/* Search & Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasFilters && (
                <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* Brand */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Marca
                  </label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
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
                  <Select value={yearFrom} onValueChange={setYearFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer</SelectItem>
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
                  <Select value={yearTo} onValueChange={setYearTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer</SelectItem>
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
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer</SelectItem>
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
                  <Select value={transmission} onValueChange={setTransmission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer</SelectItem>
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
                  <Select value={fuel} onValueChange={setFuel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer</SelectItem>
                      {Object.entries(FUEL_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasFilters && (
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            {isLoading ? "Carregando..." : `${cars.length} veículo(s) encontrado(s)`}
          </p>

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
