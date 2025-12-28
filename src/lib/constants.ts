// WhatsApp do Admin - FIXO E OBRIGATÓRIO
export const WHATSAPP_NUMBER = "5565998031761";
export const WHATSAPP_FORMATTED = "+55 65 99803-1761";

export const SITE_NAME = "CompreCarros";
export const SITE_DESCRIPTION = "Seu próximo carro está aqui. Encontre os melhores veículos com total segurança e transparência.";

// Fuel type labels
export const FUEL_LABELS: Record<string, string> = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  flex: "Flex",
  diesel: "Diesel",
  electric: "Elétrico",
  hybrid: "Híbrido",
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

// Motorcycle cooling type labels
export const COOLING_TYPE_LABELS: Record<string, string> = {
  air: "Ar",
  liquid: "Líquida",
  oil: "Óleo",
};

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

// Generate WhatsApp URL - SINGLE SOURCE OF TRUTH (wa.me only)
export const generateWhatsAppUrl = (phone: string, message: string): string => {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

// Build WhatsApp message for a car inquiry (URL generation must use generateWhatsAppUrl)
export const buildCarWhatsAppMessage = (car: {
  id: string;
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
  return `Olá! Tenho interesse no ${vehicleType}:\n\n${vehicleEmoji} *${car.brand_name || ""} ${car.model}*\n📅 Ano: ${car.year}\n${car.version ? `⚙️ Versão: ${car.version}\n` : ""}💰 Preço: ${formatPrice(car.price)}\n🔖 Código: ${car.code}\n🔗 Link: /carro/${car.id}\n\nPoderia me passar mais informações?`;
};