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

// Generate WhatsApp URL
export const generateWhatsAppUrl = (car: {
  code: string;
  model: string;
  year: number;
  version?: string | null;
  price: number;
  brand_name?: string;
}): string => {
  const message = `Olá! Tenho interesse no veículo:

🚗 *${car.brand_name || ""} ${car.model}*
📅 Ano: ${car.year}
${car.version ? `📋 Versão: ${car.version}` : ""}
💰 Preço: ${formatPrice(car.price)}
🔖 Código: ${car.code}

Poderia me passar mais informações?`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
