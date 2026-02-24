/**
 * Geo/SEO utilities for city/state URL slugs.
 */

const BRAZILIAN_STATES: Record<string, string> = {
  ac: "Acre", al: "Alagoas", ap: "Amapá", am: "Amazonas",
  ba: "Bahia", ce: "Ceará", df: "Distrito Federal", es: "Espírito Santo",
  go: "Goiás", ma: "Maranhão", mt: "Mato Grosso", ms: "Mato Grosso do Sul",
  mg: "Minas Gerais", pa: "Pará", pb: "Paraíba", pr: "Paraná",
  pe: "Pernambuco", pi: "Piauí", rj: "Rio de Janeiro", rn: "Rio Grande do Norte",
  rs: "Rio Grande do Sul", ro: "Rondônia", rr: "Roraima", sc: "Santa Catarina",
  sp: "São Paulo", se: "Sergipe", to: "Tocantins",
};

/** Normalize text to URL-safe slug: lowercase, no accents, hyphens */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Get full state name from 2-letter code (lowercase) */
export function getStateName(stateSlug: string): string {
  return BRAZILIAN_STATES[stateSlug.toLowerCase()] || stateSlug.toUpperCase();
}

/** Get state abbreviation (uppercase) from slug */
export function getStateAbbr(stateSlug: string): string {
  return stateSlug.toUpperCase();
}

/** Convert city slug back to display name (capitalize words) */
export function citySlugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
