/**
 * Smart search utilities for automotive term correction and search parsing.
 *
 * Handles:
 * - Voice recognition typo correction (e.g. "estrada" → "strada")
 * - Extraction of structured filters from free-text (brand, year, fuel, transmission)
 * - Normalization of accents and casing
 */

// ── Automotive corrections dictionary ──────────────────────────────
// Maps common voice-recognition mistakes and typos to correct terms.
const CORRECTIONS: Record<string, string> = {
  // Models
  estrada: "strada",
  "hb vinte": "hb20",
  "hb-20": "hb20",
  "hb 20": "hb20",
  corola: "corolla",
  hiluxe: "hilux",
  hylux: "hilux",
  hiluz: "hilux",
  hilucks: "hilux",
  cívic: "civic",
  cívico: "civic",
  civico: "civic",
  civick: "civic",
  gol: "gol",
  "golf": "golf",
  onics: "onix",
  ônix: "onix",
  oniz: "onix",
  "compasso": "compass",
  renegad: "renegade",
  renegaid: "renegade",
  toro: "toro",
  "kicks": "kicks",
  "cruze": "cruze",
  tracker: "tracker",
  traker: "tracker",
  "t-cross": "t-cross",
  tcross: "t-cross",
  "t cross": "t-cross",
  "polo": "polo",
  yaris: "yaris",
  "etios": "etios",
  "sw4": "sw4",
  "sw 4": "sw4",
  "s w 4": "sw4",
  "fortuner": "sw4",
  "tucson": "tucson",
  tuckson: "tucson",
  "creta": "creta",
  "cretta": "creta",
  nivus: "nivus",
  "saveiro": "saveiro",
  "amarok": "amarok",
  amarock: "amarok",
  "ranger": "ranger",
  "s10": "s10",
  "s 10": "s10",
  "pajero": "pajero",
  "l200": "l200",
  "l 200": "l200",
  "uno": "uno",
  "argo": "argo",
  "cronos": "cronos",
  "mobi": "mobi",
  "kwid": "kwid",
  "duster": "duster",
  "logan": "logan",
  "sandero": "sandero",
  "captur": "captur",
  "oroch": "oroch",
  // Motorcycle models
  "cg": "cg",
  "cg160": "cg 160",
  "cb300": "cb 300",
  "cb 300": "cb 300",
  "factor": "factor",
  "fazer": "fazer",
  "biz": "biz",
  "bizz": "biz",
  "pcx": "pcx",
  "nmax": "nmax",
  "n max": "nmax",
  "xre": "xre",
  "tenere": "ténéré",
  "tenéré": "ténéré",
  "lander": "lander",
  "bros": "bros",
  // Brands
  "fiate": "fiat",
  "toyotta": "toyota",
  "toyoda": "toyota",
  "hiundai": "hyundai",
  "hundai": "hyundai",
  "hundái": "hyundai",
  "hyundái": "hyundai",
  "xevrolet": "chevrolet",
  "chevrolete": "chevrolet",
  "volks": "volkswagen",
  "volks wagen": "volkswagen",
  "folkswagen": "volkswagen",
  "wolks": "volkswagen",
  "wolkswagen": "volkswagen",
  "volksvaagen": "volkswagen",
  "reno": "renault",
  "renol": "renault",
  "renalt": "renault",
  "renout": "renault",
  "peugeot": "peugeot",
  "peujo": "peugeot",
  "peugeô": "peugeot",
  "citroen": "citroën",
  "citroem": "citroën",
  "jipe": "jeep",
  "gipe": "jeep",
  "mitsubish": "mitsubishi",
  "mitsubish": "mitsubishi",
  "yamaha": "yamaha",
  "iamaha": "yamaha",
  "honda": "honda",
  "suzuky": "suzuki",
  "susuki": "suzuki",
  "kawazaki": "kawasaki",
  "kavasaki": "kawasaki",
  "cavasaki": "kawasaki",
  "dafra": "dafra",
  "shineray": "shineray",
};

// ── Fuel keyword mapping ───────────────────────────────────────────
const FUEL_KEYWORDS: Record<string, string> = {
  gasolina: "gasoline",
  etanol: "ethanol",
  "álcool": "ethanol",
  alcool: "ethanol",
  flex: "flex",
  diesel: "diesel",
  "elétrico": "electric",
  eletrico: "electric",
  "híbrido": "hybrid",
  hibrido: "hybrid",
};

// ── Transmission keyword mapping ───────────────────────────────────
const TRANSMISSION_KEYWORDS: Record<string, string> = {
  manual: "manual",
  "automático": "automatic",
  automatico: "automatic",
  "automática": "automatic",
  automatica: "automatic",
  auto: "automatic",
  cvt: "cvt",
  "semi-automático": "semi_automatic",
  "semi automático": "semi_automatic",
  "semiautomático": "semi_automatic",
  semiautomatico: "semi_automatic",
};

// ── Helpers ────────────────────────────────────────────────────────

/** Remove accents and lowercase */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Apply automotive corrections to raw text.
 * Handles multi-word corrections first, then single-word.
 */
export function applyCorrections(rawText: string): string {
  let text = rawText.toLowerCase().trim();

  // Sort corrections by key length desc so multi-word matches are tried first
  const sortedKeys = Object.keys(CORRECTIONS).sort(
    (a, b) => b.length - a.length,
  );

  for (const key of sortedKeys) {
    const normalizedKey = normalize(key);
    const regex = new RegExp(`\\b${normalizedKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    text = text.replace(regex, CORRECTIONS[key]);
  }

  return text;
}

// ── Parsed search result ───────────────────────────────────────────
export interface ParsedSearch {
  /** Remaining search terms for model/version/code matching */
  searchText: string;
  /** Detected brand ID (if a brand name was found in the text) */
  detectedBrandId?: string;
  /** Detected year (4-digit number in valid range) */
  detectedYear?: string;
  /** Detected fuel type key */
  detectedFuel?: string;
  /** Detected transmission type key */
  detectedTransmission?: string;
}

/**
 * Parse free-text search into structured filters.
 *
 * @param rawInput The text from the search box (already corrected or raw)
 * @param brands   List of brands with id and name to match against
 */
export function parseSearchQuery(
  rawInput: string,
  brands: { id: string; name: string }[],
): ParsedSearch {
  const corrected = applyCorrections(rawInput);
  const result: ParsedSearch = { searchText: "" };

  // Tokenize
  let tokens = corrected.split(/\s+/).filter(Boolean);

  // ── Detect brand (try two-word combo first, then single word) ────
  const normalizedBrands = brands.map((b) => ({
    ...b,
    normalized: normalize(b.name),
  }));

  // Try two-word brand match (e.g. "land rover")
  for (let i = 0; i < tokens.length - 1; i++) {
    const twoWord = normalize(`${tokens[i]} ${tokens[i + 1]}`);
    const match = normalizedBrands.find((b) => b.normalized === twoWord);
    if (match) {
      result.detectedBrandId = match.id;
      tokens.splice(i, 2);
      break;
    }
  }

  // Try single-word brand match if no two-word found
  if (!result.detectedBrandId) {
    for (let i = 0; i < tokens.length; i++) {
      const tok = normalize(tokens[i]);
      const match = normalizedBrands.find((b) => b.normalized === tok);
      if (match) {
        result.detectedBrandId = match.id;
        tokens.splice(i, 1);
        break;
      }
    }
  }

  // ── Detect year ──────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < tokens.length; i++) {
    const num = parseInt(tokens[i], 10);
    if (!isNaN(num) && num >= 1980 && num <= currentYear + 2) {
      result.detectedYear = String(num);
      tokens.splice(i, 1);
      break;
    }
  }

  // ── Detect fuel ──────────────────────────────────────────────────
  for (let i = 0; i < tokens.length; i++) {
    const tok = normalize(tokens[i]);
    if (FUEL_KEYWORDS[tok]) {
      result.detectedFuel = FUEL_KEYWORDS[tok];
      tokens.splice(i, 1);
      break;
    }
  }

  // ── Detect transmission ──────────────────────────────────────────
  // Try two-word combos first
  for (let i = 0; i < tokens.length - 1; i++) {
    const twoWord = normalize(`${tokens[i]} ${tokens[i + 1]}`);
    if (TRANSMISSION_KEYWORDS[twoWord]) {
      result.detectedTransmission = TRANSMISSION_KEYWORDS[twoWord];
      tokens.splice(i, 2);
      break;
    }
  }
  if (!result.detectedTransmission) {
    for (let i = 0; i < tokens.length; i++) {
      const tok = normalize(tokens[i]);
      if (TRANSMISSION_KEYWORDS[tok]) {
        result.detectedTransmission = TRANSMISSION_KEYWORDS[tok];
        tokens.splice(i, 1);
        break;
      }
    }
  }

  // ── Remaining tokens are the free-text search ────────────────────
  result.searchText = tokens.join(" ").trim();

  return result;
}
