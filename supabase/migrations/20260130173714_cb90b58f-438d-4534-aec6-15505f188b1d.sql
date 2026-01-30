-- =====================================================
-- PERFORMANCE OPTIMIZATION: Add missing indexes
-- These indexes will significantly improve query 
-- performance under high load (4000+ concurrent users)
-- =====================================================

-- 1. CRITICAL: Composite index for public queries (used in ALL public car listings)
-- This is the most impactful index as it covers the RLS policy conditions
CREATE INDEX IF NOT EXISTS idx_cars_public_listing 
ON public.cars (status, garage_is_active) 
WHERE status = 'available' AND garage_is_active = true;

-- 2. HIGH IMPACT: brand_id for JOIN operations
CREATE INDEX IF NOT EXISTS idx_cars_brand_id 
ON public.cars (brand_id);

-- 3. HIGH IMPACT: year for range filters (ano de/até)
CREATE INDEX IF NOT EXISTS idx_cars_year 
ON public.cars (year);

-- 4. HIGH IMPACT: price for range filters (faixa de preço)
CREATE INDEX IF NOT EXISTS idx_cars_price 
ON public.cars (price);

-- 5. MEDIUM: transmission for filter
CREATE INDEX IF NOT EXISTS idx_cars_transmission 
ON public.cars (transmission);

-- 6. MEDIUM: fuel for filter
CREATE INDEX IF NOT EXISTS idx_cars_fuel 
ON public.cars (fuel);

-- 7. MEDIUM: created_at for ORDER BY (most queries order by this)
CREATE INDEX IF NOT EXISTS idx_cars_created_at 
ON public.cars (created_at DESC);

-- 8. Composite index for the most common query pattern:
-- public listings ordered by featured first, then created_at
CREATE INDEX IF NOT EXISTS idx_cars_featured_listing 
ON public.cars (is_featured DESC, created_at DESC) 
WHERE status = 'available' AND garage_is_active = true;

-- 9. Index for banners query (is_active + position)
CREATE INDEX IF NOT EXISTS idx_banners_active_position 
ON public.banners (is_active, position) 
WHERE is_active = true;

-- 10. Index for ads query (is_active)
CREATE INDEX IF NOT EXISTS idx_ads_active 
ON public.ads (is_active, created_at) 
WHERE is_active = true;

-- 11. Index for brands query (is_active + category)
CREATE INDEX IF NOT EXISTS idx_brands_active_category 
ON public.brands (is_active, category, name) 
WHERE is_active = true;