-- Atualizar RLS de brands para permitir visualização de todas as marcas (ativas e inativas)
-- A flag is_active serve apenas para controlar exibição em filtros/selects, não para ocultar dados

-- Remover política restritiva atual
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;

-- Criar nova política que permite visualização de TODAS as marcas
-- Isso garante que carros com marcas desativadas ainda mostrem o nome da marca
CREATE POLICY "Anyone can view all brands"
  ON public.brands FOR SELECT
  USING (true);