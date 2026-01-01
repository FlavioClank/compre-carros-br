-- =====================================================
-- MIGRAÇÃO COMPLETA DE DADOS - CAR CONNECT
-- Execute este script no SQL Editor do seu Supabase
-- =====================================================

-- IMPORTANTE: Execute na ordem correta devido às foreign keys
-- 1. profiles (não tem dependências)
-- 2. user_roles (depende de profiles via user_id)
-- 3. brands (não tem dependências)
-- 4. garages (depende de profiles via user_id)
-- 5. cars (depende de brands e garages)
-- 6. ads (não tem dependências)
-- 7. banners (não tem dependências)

-- =====================================================
-- 1. PROFILES
-- =====================================================
INSERT INTO public.profiles (id, email, name, created_at, updated_at) VALUES
  ('3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'flaviofernandesv@gmail.com', 'Super Admin', '2025-12-26 18:31:10.077864+00', '2025-12-26 18:31:10.077864+00'),
  ('c7314718-33e5-41f0-96c6-61d3c3300086', 'primeveiculos@gmail.com', 'Teste', '2025-12-26 18:47:50.946514+00', '2025-12-31 22:40:03.925042+00'),
  ('aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'elitecar@gmail.com', 'Teste2@gmail.com', '2025-12-26 23:53:59.807046+00', '2025-12-31 22:38:03.763384+00'),
  ('2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'g12@gmail.com', 'G12 Automóveis', '2025-12-31 23:02:33.91722+00', '2025-12-31 23:02:33.91722+00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 2. USER_ROLES
-- =====================================================
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
  ('03adabd5-5b14-46e0-9683-102e68557722', '3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'super_admin', '2025-12-26 18:31:10.255127+00'),
  ('693796c6-7927-4bdb-844f-f2782b744312', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'garage', '2025-12-26 18:47:51.148617+00'),
  ('cae90481-008f-4d17-b2d1-bd6c9e6b6c1c', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'garage', '2025-12-26 23:54:00.002599+00'),
  ('1951c69b-0d56-4182-9b81-30e1c375923e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'garage', '2025-12-31 23:02:34.090377+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. BRANDS (Marcas)
-- =====================================================
INSERT INTO public.brands (id, name, logo_url, category, is_active, created_at, updated_at) VALUES
  ('b0b96a07-688c-4343-a222-0992d8e07c35', 'Chevrolet', 'https://www.carlogos.org/car-logos/chevrolet-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('4d56000c-6aca-4373-8baa-ebf31724f9e8', 'Volkswagen', 'https://www.carlogos.org/car-logos/volkswagen-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('19fb93b0-f85b-431f-a72d-81d24503c874', 'Fiat', 'https://www.carlogos.org/car-logos/fiat-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('12c64fa1-ef72-4cbc-a286-3dd148324422', 'Ford', 'https://www.carlogos.org/car-logos/ford-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('417babd9-13c8-4160-9d86-ec83b9cdba35', 'Honda', 'https://www.carlogos.org/car-logos/honda-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('c4d5ff54-a18e-4716-a8df-dc103c662245', 'Toyota', 'https://www.carlogos.org/car-logos/toyota-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('ec5ff594-40fe-4386-9abf-07e1390389dd', 'Hyundai', 'https://www.carlogos.org/car-logos/hyundai-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('11a4a16c-00a1-4eef-978e-253ad66b42b4', 'Renault', 'https://www.carlogos.org/car-logos/renault-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('f954f225-f65d-4070-8efb-742416f6783e', 'Nissan', 'https://www.carlogos.org/car-logos/nissan-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('87f24d4f-ca95-4856-ac48-53ea0e3e241e', 'BMW', 'https://www.carlogos.org/car-logos/bmw-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('5eb4f6a2-6c8b-4f87-a827-409550fbb5bc', 'Mercedes-Benz', 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('a823e762-3c68-4f68-b465-6f90f65c4d2a', 'Audi', 'https://www.carlogos.org/car-logos/audi-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('279a1026-40f9-412c-93aa-0ea1278b7b36', 'Peugeot', 'https://www.carlogos.org/car-logos/peugeot-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('63b7038f-14cc-40d9-8ec2-b4c05e33d11a', 'Citroën', 'https://www.carlogos.org/car-logos/citroen-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('0516333f-26a0-4049-a66b-11c5627ca9dc', 'Mitsubishi', 'https://www.carlogos.org/car-logos/mitsubishi-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('28435b8e-64e6-4e89-bb1c-1381b4056bf8', 'Jeep', 'https://www.carlogos.org/car-logos/jeep-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-26 18:33:24.78598+00'),
  ('280289b7-6cff-427c-955b-c9142610913e', 'Land Rover', 'https://www.carlogos.org/car-logos/land-rover-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-26 18:33:28.336412+00'),
  ('a43caab4-13e2-412c-adac-210213a40c28', 'Suzuki', 'https://www.carlogos.org/car-logos/suzuki-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-26 18:33:33.266644+00'),
  ('ecd4e186-f2c1-4365-be34-8852db513b33', 'Volvo', 'https://www.carlogos.org/car-logos/volvo-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-27 02:27:01.132908+00'),
  ('7fe6e636-aeef-4ac6-8844-a6af4c38db54', 'Kia', 'https://www.carlogos.org/car-logos/kia-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-27 20:35:01.221227+00'),
  ('78bb179a-5f7f-4508-a663-45e4b40086b2', 'Dafra', '/logos/dafra-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('7ecb127b-8384-4103-acff-458a8338a667', 'Shineray', '/logos/shineray-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('e5c7e8a1-3f4d-4b2c-9a1e-8d7f6c5b4a3e', 'Yamaha', 'https://www.carlogos.org/car-logos/yamaha-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('d4b6c7a0-2e3f-4a1b-8c0d-7e6f5d4c3b2a', 'Kawasaki', 'https://www.carlogos.org/car-logos/kawasaki-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('c3a5b690-1d2e-3f0a-7b9c-6d5e4c3b2a19', 'Triumph', 'https://www.carlogos.org/car-logos/triumph-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('b2948a58-0c1d-2e9f-6a8b-5c4d3b2a1908', 'Harley-Davidson', 'https://www.carlogos.org/car-logos/harley-davidson-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('a1837947-fb0c-1d8e-59a7-4b3c2a190807', 'BMW Motorrad', 'https://www.carlogos.org/car-logos/bmw-motorrad-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('90726836-ea0b-0c7d-4896-3a2b19080706', 'Ducati', 'https://www.carlogos.org/car-logos/ducati-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('8f615725-d90a-fb6c-3785-291a08070605', 'Suzuki Motos', 'https://www.carlogos.org/car-logos/suzuki-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('7e504614-c809-ea5b-2674-180907060504', 'Honda Motos', 'https://www.carlogos.org/car-logos/honda-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 4. GARAGES (Garagens/Lojas)
-- =====================================================
INSERT INTO public.garages (id, user_id, name, phone, address, city, state, is_active, can_add_vehicles, created_at, updated_at) VALUES
  ('f0da0aeb-e1d6-4e9c-a127-7e0457dfb8bc', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'Prime Veiculos', '(65) 99961-4400', 'R. Padre Cassemiro, 376 - Jardim Marajoara', 'Cáceres', 'MT', true, true, '2025-12-26 18:47:51.338504+00', '2025-12-31 22:39:17.192724+00'),
  ('ac12ed0b-0f6f-411a-bb73-6b5d61708ec8', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'EliteCar', '(65) 99610-0077', 'Av. Getúlio Vargas, 971 - Monte Verde', 'Cáceres', 'MT', true, true, '2025-12-26 23:54:00.194124+00', '2025-12-31 21:01:01.046659+00'),
  ('84f29ff1-f98c-410a-8fbc-0f93307a8c6e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'G12 Automóveis', '65999999999', 'Rua Padre Cassemiro, 239, Cep 78205365', 'Cáceres', 'MT', true, true, '2025-12-31 23:02:34.294671+00', '2025-12-31 23:02:34.294671+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  is_active = EXCLUDED.is_active,
  can_add_vehicles = EXCLUDED.can_add_vehicles,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 5. ADS (Anúncios)
-- =====================================================
INSERT INTO public.ads (id, title, category, image_url_home, image_url_search, link, click_type, click_target, whatsapp_number, is_active, created_at, updated_at) VALUES
  ('b344d785-cdd3-4b5a-ab9e-e50d5271a45f', 'Negrão Auto Center', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1766987324796-78zjea.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1766986557270-hve5p.png', 'https://www.instagram.com/negraoautocenter/', 'link', 'https://www.instagram.com/negraoautocenter/', NULL, true, '2025-12-29 04:50:18.019812+00', '2025-12-31 23:20:49.089597+00'),
  ('55122d43-065d-4d85-9928-5285d7e7c501', 'Localiza', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767229853992-qvagz.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767229854621-96t7n.webp', 'https://www.localiza.com/brasil/pt-br', 'link', 'https://www.localiza.com/brasil/pt-br', NULL, true, '2026-01-01 01:10:58.654939+00', '2026-01-01 01:11:13.070245+00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  image_url_home = EXCLUDED.image_url_home,
  image_url_search = EXCLUDED.image_url_search,
  link = EXCLUDED.link,
  click_type = EXCLUDED.click_type,
  click_target = EXCLUDED.click_target,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 6. BANNERS
-- =====================================================
INSERT INTO public.banners (id, image_url, position, click_type, click_target, whatsapp_number, is_active, created_at) VALUES
  ('3033e602-7a0d-44b9-a8de-df3f09ff3a1f', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 1, 'none', NULL, NULL, true, '2025-12-28 04:32:27.531166+00'),
  ('2ae4eeda-815f-4a83-b447-b7f549e2c760', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 2, 'none', NULL, NULL, true, '2025-12-28 04:32:45.678573+00'),
  ('7ad933e3-e4c9-425a-85e5-cf1ec0956f9c', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 3, 'none', NULL, NULL, true, '2025-12-28 07:02:47.484279+00')
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  position = EXCLUDED.position,
  click_type = EXCLUDED.click_type,
  click_target = EXCLUDED.click_target;

-- =====================================================
-- 7. Resetar a sequência de códigos de carros
-- =====================================================
SELECT setval('car_code_seq', 10, true);
