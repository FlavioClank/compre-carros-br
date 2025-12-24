-- Enum para roles do sistema
CREATE TYPE public.app_role AS ENUM ('super_admin', 'garage');

-- Enum para status de carros
CREATE TYPE public.car_status AS ENUM ('available', 'sold');

-- Enum para tipo de combustível
CREATE TYPE public.fuel_type AS ENUM ('gasoline', 'ethanol', 'flex', 'diesel', 'electric', 'hybrid');

-- Enum para tipo de câmbio
CREATE TYPE public.transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'semi_automatic');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de roles (separada conforme regras de segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabela de marcas de carros
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de garagens
CREATE TABLE public.garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de carros
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE RESTRICT,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  version TEXT,
  mileage INTEGER NOT NULL DEFAULT 0,
  transmission transmission_type NOT NULL,
  fuel fuel_type NOT NULL,
  color TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  status car_status NOT NULL DEFAULT 'available',
  sold_at TIMESTAMPTZ,
  sold_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de histórico de vendas
CREATE TABLE public.sales_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE RESTRICT,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE RESTRICT,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_reason TEXT,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ,
  is_suspicious BOOLEAN DEFAULT false,
  notes TEXT,
  car_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de logs de ações
CREATE TABLE public.action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Função para verificar se é garagem
CREATE OR REPLACE FUNCTION public.is_garage()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'garage')
$$;

-- Função para obter garage_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_garage_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.garages WHERE user_id = auth.uid()
$$;

-- Gerar código único para carro
CREATE OR REPLACE FUNCTION public.generate_car_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := 'CC-' || LPAD(nextval('car_code_seq')::TEXT, 6, '0');
  NEW.code := new_code;
  RETURN NEW;
END;
$$;

-- Sequência para código de carro
CREATE SEQUENCE IF NOT EXISTS car_code_seq START 1;

-- Trigger para gerar código
CREATE TRIGGER generate_car_code_trigger
  BEFORE INSERT ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_car_code();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_garages_updated_at
  BEFORE UPDATE ON public.garages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admin can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_super_admin());

-- Policies para user_roles
CREATE POLICY "Super admin can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policies para brands (público pode ver marcas ativas)
CREATE POLICY "Anyone can view active brands"
  ON public.brands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admin can manage brands"
  ON public.brands FOR ALL
  USING (public.is_super_admin());

-- Policies para garages
CREATE POLICY "Super admin can manage all garages"
  ON public.garages FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Garage can view own data"
  ON public.garages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Garage can update own data"
  ON public.garages FOR UPDATE
  USING (user_id = auth.uid());

-- Policies para cars (público pode ver carros disponíveis)
CREATE POLICY "Anyone can view available cars"
  ON public.cars FOR SELECT
  USING (status = 'available');

CREATE POLICY "Super admin can manage all cars"
  ON public.cars FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Garage can view own cars"
  ON public.cars FOR SELECT
  USING (garage_id = public.get_user_garage_id());

CREATE POLICY "Garage can insert own cars"
  ON public.cars FOR INSERT
  WITH CHECK (garage_id = public.get_user_garage_id());

CREATE POLICY "Garage can update own cars"
  ON public.cars FOR UPDATE
  USING (garage_id = public.get_user_garage_id());

-- Policies para sales_history
CREATE POLICY "Super admin can manage sales history"
  ON public.sales_history FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Garage can view own sales"
  ON public.sales_history FOR SELECT
  USING (garage_id = public.get_user_garage_id());

-- Policies para action_logs
CREATE POLICY "Super admin can view all logs"
  ON public.action_logs FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admin can insert logs"
  ON public.action_logs FOR INSERT
  WITH CHECK (true);

-- Inserir marcas iniciais com logos oficiais
INSERT INTO public.brands (name, logo_url, is_active) VALUES
  ('Chevrolet', 'https://www.carlogos.org/car-logos/chevrolet-logo.png', true),
  ('Volkswagen', 'https://www.carlogos.org/car-logos/volkswagen-logo.png', true),
  ('Fiat', 'https://www.carlogos.org/car-logos/fiat-logo.png', true),
  ('Ford', 'https://www.carlogos.org/car-logos/ford-logo.png', true),
  ('Honda', 'https://www.carlogos.org/car-logos/honda-logo.png', true),
  ('Toyota', 'https://www.carlogos.org/car-logos/toyota-logo.png', true),
  ('Hyundai', 'https://www.carlogos.org/car-logos/hyundai-logo.png', true),
  ('Renault', 'https://www.carlogos.org/car-logos/renault-logo.png', true),
  ('Jeep', 'https://www.carlogos.org/car-logos/jeep-logo.png', true),
  ('Nissan', 'https://www.carlogos.org/car-logos/nissan-logo.png', true),
  ('BMW', 'https://www.carlogos.org/car-logos/bmw-logo.png', true),
  ('Mercedes-Benz', 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png', true),
  ('Audi', 'https://www.carlogos.org/car-logos/audi-logo.png', true),
  ('Peugeot', 'https://www.carlogos.org/car-logos/peugeot-logo.png', true),
  ('Citroën', 'https://www.carlogos.org/car-logos/citroen-logo.png', true),
  ('Mitsubishi', 'https://www.carlogos.org/car-logos/mitsubishi-logo.png', true),
  ('Kia', 'https://www.carlogos.org/car-logos/kia-logo.png', true),
  ('Suzuki', 'https://www.carlogos.org/car-logos/suzuki-logo.png', true),
  ('Volvo', 'https://www.carlogos.org/car-logos/volvo-logo.png', true),
  ('Land Rover', 'https://www.carlogos.org/car-logos/land-rover-logo.png', true);