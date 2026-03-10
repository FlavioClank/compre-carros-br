// WhatsApp do Admin - FIXO E OBRIGATÓRIO
export const WHATSAPP_NUMBER = "556592230000";
export const WHATSAPP_FORMATTED = "+55 65 9223-0000";

export const SITE_NAME = "CompreCarrosBr";
export const SITE_DESCRIPTION = "Seu próximo carro está aqui. Encontre os melhores veículos com total segurança e transparência.";

// Fuel type labels - ALL
export const FUEL_LABELS: Record<string, string> = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  flex: "Flex",
  diesel: "Diesel",
  electric: "Elétrico",
  hybrid: "Híbrido",
};

// Fuel type labels - CAR ONLY (all options)
export const CAR_FUEL_LABELS: Record<string, string> = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  flex: "Flex",
  diesel: "Diesel",
  electric: "Elétrico",
  hybrid: "Híbrido",
};

// Fuel type labels - MOTORCYCLE ONLY (gasolina, elétrico)
export const MOTORCYCLE_FUEL_LABELS: Record<string, string> = {
  gasoline: "Gasolina",
  electric: "Elétrico",
};

// Transmission labels
export const TRANSMISSION_LABELS: Record<string, string> = {
  manual: "Manual",
  automatic: "Automático",
  cvt: "CVT",
  semi_automatic: "Semi-automático",
};

// Status labels
export const STATUS_LABELS: Record<string, string> = {
  available: "Disponível",
  sold: "Vendido",
};

// Vehicle category labels
export const CATEGORY_LABELS: Record<string, string> = {
  car: "Carro",
  motorcycle: "Moto",
};

// Motorcycle cooling type labels (ar, líquida - NOT óleo for motorcycles)
export const COOLING_TYPE_LABELS: Record<string, string> = {
  air: "Ar",
  liquid: "Líquida",
};

// Car cooling type (óleo)
export const CAR_COOLING_TYPE: string = "oil";

// Motorcycle category labels
export const MOTORCYCLE_CATEGORY_LABELS: Record<string, string> = {
  sport: "Esportiva",
  touring: "Estrada",
  offroad: "Fora-de-estrada",
  leisure: "Lazer",
  urban: "Urbana",
};

// Format price to BRL
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format mileage
export const formatMileage = (mileage: number): string => {
  return new Intl.NumberFormat("pt-BR").format(mileage) + " km";
};

// Format engine cc
export const formatEngineCC = (cc: number): string => {
  return `${cc}cc`;
};

// Format year display (e.g. "2022/2023" or just "2022")
export const formatYearDisplay = (year: number, modelYear?: number | null): string => {
  if (modelYear && modelYear !== year) {
    return `${year}/${modelYear}`;
  }
  return `${year}`;
};

// Generate WhatsApp URL - SINGLE SOURCE OF TRUTH (wa.me only)
export const generateWhatsAppUrl = (phone: string, message: string): string => {
  return `https://wa.me/${phone}/?text=${encodeURIComponent(message)}`;
};

// Build WhatsApp message for a car inquiry (URL generation must use generateWhatsAppUrl)
export const buildCarWhatsAppMessage = (car: {
  slug?: string | null;
  code: string;
  model: string;
  year: number;
  version?: string | null;
  price: number;
  brand_name?: string;
  category?: string;
}): string => {
  const vehicleEmoji = car.category === 'motorcycle' ? '🏍️' : '🚗';
  const vehicleType = car.category === 'motorcycle' ? 'moto' : 'veículo';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const vehicleUrl = car.slug ? `${origin}/carro/${car.slug}` : '';
  return `Olá! Tenho interesse no ${vehicleType}:\n\n${vehicleEmoji} *${car.brand_name || ""} ${car.model}*\n📅 Ano: ${car.year}\n${car.version ? `⚙️ Versão: ${car.version}\n` : ""}💰 Preço: ${formatPrice(car.price)}\n🔖 Código: ${car.code}${vehicleUrl ? `\n🔗 Link: ${vehicleUrl}` : ''}\n\nPoderia me passar mais informações?`;
};