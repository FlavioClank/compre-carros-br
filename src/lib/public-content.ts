import { supabase } from "@/lib/supabase";
import { isProductionEnvironment } from "@/lib/supabase-config";

export interface PublicShowcase {
  id: string;
  image_url: string;
  image_desktop: string | null;
  image_mobile: string | null;
  position: number;
  click_type: string | null;
  click_target: string | null;
}

export interface PublicPartner {
  id: string;
  slug: string | null;
  title: string;
  category: string;
  image_url_home: string | null;
  image_url_search: string | null;
  link: string | null;
  click_type?: string | null;
  click_target?: string | null;
}

export interface PublicCity {
  city: string;
  state: string;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchPublicShowcases(): Promise<PublicShowcase[]> {
  if (isProductionEnvironment()) {
    try {
      const data = await fetchJson<{ showcases?: PublicShowcase[] }>("/api/public-promos");
      return data.showcases || [];
    } catch (error) {
      console.error("public showcases API failed; trying direct public view", error);
    }
  }

  const { data, error } = await (supabase as any)
    .from("banners_public")
    .select("id, image_url, image_desktop, image_mobile, position, click_type, click_target")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("public showcases query failed", error);
    return [];
  }

  return data || [];
}

export async function fetchPublicPartners(): Promise<PublicPartner[]> {
  if (isProductionEnvironment()) {
    try {
      const data = await fetchJson<{ partners?: PublicPartner[] }>("/api/public-promos");
      return data.partners || [];
    } catch (error) {
      console.error("public partners API failed; trying direct public view", error);
    }
  }

  const { data, error } = await (supabase as any)
    .from("ads_public")
    .select("id, slug, title, category, image_url_home, image_url_search, link, click_type, click_target")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("public partners query failed", error);
    return [];
  }

  return data || [];
}

export async function fetchPublicCities(): Promise<PublicCity[]> {
  if (isProductionEnvironment()) {
    try {
      const data = await fetchJson<{ cities?: PublicCity[] }>("/api/active-cities");
      return data.cities || [];
    } catch (error) {
      console.error("public cities API failed; trying direct RPC", error);
    }
  }

  const { data, error } = await supabase.rpc("get_active_cities");
  if (error) {
    console.error("public cities query failed", error);
    return [];
  }

  return (data || []) as PublicCity[];
}