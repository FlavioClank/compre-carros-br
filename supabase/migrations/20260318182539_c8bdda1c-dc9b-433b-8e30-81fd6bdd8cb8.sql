
CREATE OR REPLACE FUNCTION public.search_cars_ranked(p_search text DEFAULT NULL::text, p_brand_id uuid DEFAULT NULL::uuid, p_category text DEFAULT NULL::text, p_year_from integer DEFAULT NULL::integer, p_year_to integer DEFAULT NULL::integer, p_price_min numeric DEFAULT NULL::numeric, p_price_max numeric DEFAULT NULL::numeric, p_transmission text DEFAULT NULL::text, p_fuel text DEFAULT NULL::text, p_color text DEFAULT NULL::text, p_doors integer DEFAULT NULL::integer, p_condition text DEFAULT NULL::text, p_cooling_type text DEFAULT NULL::text, p_motorcycle_category text DEFAULT NULL::text, p_garage_ids uuid[] DEFAULT NULL::uuid[], p_limit integer DEFAULT 30, p_offset integer DEFAULT 0)
 RETURNS TABLE(car_id uuid, car_slug text, car_code text, car_brand_id uuid, car_model text, car_year integer, car_model_year integer, car_version text, car_mileage integer, car_transmission text, car_fuel text, car_color text, car_price numeric, car_photos text[], car_doors integer, car_condition text, car_category text, car_engine_cc integer, car_cooling_type text, car_motorcycle_category text, car_created_at timestamp with time zone, car_is_featured boolean, brand_name text, brand_logo_url text, relevance_score integer, total_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH filtered AS (
    SELECT c.*,
      CASE
        WHEN p_search IS NOT NULL AND lower(c.model) = lower(p_search) THEN 100
        WHEN p_search IS NOT NULL AND lower(c.model) LIKE lower(p_search) || '%' THEN 80
        WHEN p_search IS NOT NULL AND lower(c.model) LIKE '%' || lower(p_search) || '%' THEN 60
        WHEN p_search IS NOT NULL AND c.version IS NOT NULL AND lower(c.version) LIKE '%' || lower(p_search) || '%' THEN 40
        WHEN p_search IS NOT NULL AND lower(c.code) LIKE '%' || lower(p_search) || '%' THEN 20
        ELSE 0
      END AS rel_score
    FROM public.cars c
    WHERE c.status = 'available'
      AND c.garage_is_active = true
      AND (p_search IS NULL OR (
        c.model ILIKE '%' || p_search || '%'
        OR c.code ILIKE '%' || p_search || '%'
        OR (c.version IS NOT NULL AND c.version ILIKE '%' || p_search || '%')
      ))
      AND (p_brand_id IS NULL OR c.brand_id = p_brand_id)
      AND (p_category IS NULL OR c.category = p_category)
      AND (p_year_from IS NULL OR c.year >= p_year_from OR c.model_year >= p_year_from)
      AND (p_year_to IS NULL OR c.year <= p_year_to)
      AND (p_price_min IS NULL OR c.price >= p_price_min)
      AND (p_price_max IS NULL OR c.price <= p_price_max)
      AND (p_transmission IS NULL OR c.transmission::text = p_transmission)
      AND (p_fuel IS NULL OR c.fuel::text = p_fuel)
      AND (p_color IS NULL OR lower(c.color) LIKE lower(p_color) || '%')
      AND (p_doors IS NULL OR c.doors = p_doors)
      AND (p_condition IS NULL OR c.condition = p_condition)
      AND (p_cooling_type IS NULL OR c.cooling_type = p_cooling_type)
      AND (p_motorcycle_category IS NULL OR c.motorcycle_category = p_motorcycle_category)
      AND (p_garage_ids IS NULL OR c.garage_id = ANY(p_garage_ids))
  ),
  counted AS (
    SELECT count(*) AS cnt FROM filtered
  )
  SELECT 
    f.id,
    f.slug,
    f.code,
    f.brand_id,
    f.model,
    f.year,
    f.model_year,
    f.version,
    f.mileage,
    f.transmission::text,
    f.fuel::text,
    f.color,
    f.price,
    f.photos,
    f.doors,
    f.condition,
    f.category,
    f.engine_cc,
    f.cooling_type,
    f.motorcycle_category,
    f.created_at,
    f.is_featured,
    b.name,
    b.logo_url,
    f.rel_score,
    c.cnt
  FROM filtered f
  LEFT JOIN public.brands b ON b.id = f.brand_id
  CROSS JOIN counted c
  ORDER BY 
    CASE WHEN p_search IS NOT NULL THEN f.rel_score ELSE 0 END DESC,
    f.is_featured DESC, 
    f.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$function$;
