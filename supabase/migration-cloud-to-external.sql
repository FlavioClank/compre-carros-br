-- =====================================================
-- MIGRAÇÃO COMPLETA: Lovable Cloud → Supabase Externo
-- Projeto de origem: kgtscjvgipowuvuindxt (Lovable Cloud)
-- Projeto destino: vpunpbozwidlzukplfts (Supabase Externo)
-- Data de exportação: 30/01/2026
-- =====================================================
-- 
-- IMPORTANTE: Execute este script no SQL Editor do Supabase externo
-- https://supabase.com/dashboard/project/vpunpbozwidlzukplfts/sql
--
-- ATENÇÃO: As imagens nos buckets de storage precisam ser migradas
-- manualmente (car-photos, ad-images, banners)
-- =====================================================

-- =====================================================
-- 1. PROFILES (4 registros)
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
-- 2. USER_ROLES (4 registros)
-- =====================================================
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
  ('03adabd5-5b14-46e0-9683-102e68557722', '3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'super_admin', '2025-12-26 18:31:10.255127+00'),
  ('693796c6-7927-4bdb-844f-f2782b744312', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'garage', '2025-12-26 18:47:51.148617+00'),
  ('cae90481-008f-4d17-b2d1-bd6c9e6b6c1c', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'garage', '2025-12-26 23:54:00.002599+00'),
  ('1951c69b-0d56-4182-9b81-30e1c375923e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'garage', '2025-12-31 23:02:34.090377+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. GARAGES (3 registros)
-- =====================================================
INSERT INTO public.garages (id, user_id, name, phone, address, city, state, is_active, can_add_vehicles, created_at, updated_at) VALUES
  ('f0da0aeb-e1d6-4e9c-a127-7e0457dfb8bc', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'Prime Veiculos', '(65) 99961-4400', 'R. Padre Cassemiro, 376 - Jardim Marajoara', 'Cáceres', 'MT', true, true, '2025-12-26 18:47:51.338504+00', '2025-12-31 22:39:17.192724+00'),
  ('ac12ed0b-0f6f-411a-bb73-6b5d61708ec8', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'EliteCar', '(65) 99610-0077', 'Av. Getúlio Vargas, 971 - Monte Verde', 'Cáceres', 'MT', true, true, '2025-12-26 23:54:00.194124+00', '2025-12-31 21:01:01.046659+00'),
  ('84f29ff1-f98c-410a-8fbc-0f93307a8c6e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'G12 Automóveis', '65999999999', 'Rua Padre Cassemiro, 239, Cep 78205365', 'Cáceres', 'MT', true, true, '2025-12-31 23:02:34.294671+00', '2026-01-09 19:09:04.354904+00')
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
-- 4. BRANDS (30 registros) - Atualiza existentes ou insere novos
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
-- 5. ADS (12 registros)
-- ATENÇÃO: As URLs de imagem apontam para o Cloud antigo
-- Você precisará migrar as imagens e atualizar as URLs
-- =====================================================
INSERT INTO public.ads (id, title, category, image_url_home, image_url_search, link, click_type, click_target, whatsapp_number, is_active, slug, created_at, updated_at) VALUES
  ('b344d785-cdd3-4b5a-ab9e-e50d5271a45f', 'Negrão Auto Center', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767634270025-besyjt.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1766986557270-hve5p.png', NULL, 'whatsapp', NULL, '65981156716', true, 'negrao-auto-center', '2025-12-29 04:50:18.019812+00', '2026-01-10 22:34:08.359178+00'),
  ('daed7d4b-9fce-4e55-81b2-d6148ce1845f', 'Magrão Matic', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767720542329-ecq9z.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767717869675-jn78ua.png', NULL, 'whatsapp', NULL, '65998161550', true, 'magrao-matic', '2026-01-05 21:44:06.13176+00', '2026-01-10 22:32:51.09058+00'),
  ('2cfc16fa-938b-461a-a255-456bf79f5705', 'Armazém Auto Latas', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084245677-hn4lug.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084247604-8r7pe.png', NULL, 'whatsapp', NULL, '6599067306', true, 'armazem-auto-latas', '2026-01-07 18:39:01.547619+00', '2026-01-10 22:51:23.640821+00'),
  ('6aa38edc-de3a-4b47-bfa9-e29d17219085', 'Exame Veicular', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813554188-aqyw8.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813555507-44c1ss.png', NULL, 'whatsapp', NULL, '65996100077', true, 'exame-veicular', '2026-01-07 19:19:17.041428+00', '2026-01-10 22:57:11.505264+00'),
  ('8092e9bc-f382-4c67-af0b-c0a97931f5d3', 'Rafa Diesel', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084203053-bwzkm.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084204286-x8bt1i.png', NULL, 'whatsapp', NULL, '556532241630', true, 'rafa-diesel', '2026-01-07 20:33:08.071285+00', '2026-01-10 22:30:07.055233+00'),
  ('b20a8f96-25d2-4bcf-a82b-78fe998aafc7', 'Mecânica do Valdir', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819840992-07h7k.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819842699-85lgqu.png', NULL, 'whatsapp', NULL, '65998097236', true, 'mecanica-do-valdir', '2026-01-07 21:04:03.758054+00', '2026-01-10 22:34:53.436242+00'),
  ('66321f57-1eaf-443b-8f0a-077855b1aa38', 'Borracharia Radial', 'borracharia', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084164001-ofk02p.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084165564-yw93eg.png', NULL, 'whatsapp', NULL, '65999002981', true, 'borracharia-radial', '2026-01-07 21:55:47.095771+00', '2026-01-10 22:29:27.681762+00'),
  ('793dc469-bfde-40bc-81c9-132269ca46fd', 'Retífica Power', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084123349-gmn6pt.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084128234-k06jmv.png', NULL, 'whatsapp', NULL, '65996137559', true, 'retifica-power', '2026-01-07 22:27:16.45243+00', '2026-01-10 22:29:04.663326+00'),
  ('98ecb93a-1bce-45bb-97ba-3a561d953b33', '8bus', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891748469-7qlvo8.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891750176-su5kc.jpg', NULL, 'whatsapp', NULL, '65999888812', true, '8bus', '2026-01-08 17:02:32.802778+00', '2026-01-10 22:53:10.832455+00'),
  ('22a88163-f606-402e-8372-3109fe6fdc3c', 'Via Car', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052504236-3je1l4.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052505942-ew2y7.jpg', NULL, 'whatsapp', NULL, '65999203050', true, 'via-car', '2026-01-10 13:41:48.99209+00', '2026-01-10 22:28:28.197851+00'),
  ('dc8539d3-9a3e-4f99-981f-ef573c2cf27d', 'Borracharia Bandeirantes', 'borracharia', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084083428-pmlyi.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084088009-gwsfxj.png', NULL, 'whatsapp', NULL, '65999891046', true, 'borracharia-bandeirantes', '2026-01-10 22:17:36.379628+00', '2026-01-10 22:28:11.150609+00'),
  ('cf8b22cd-8307-4cdc-be72-3e1944d97fa0', 'Status Tapeçaria', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084040101-efxmu.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084041671-a1ey3c.png', NULL, 'whatsapp', NULL, '65999361820', true, 'status-tapecaria', '2026-01-10 22:27:24.06076+00', '2026-01-10 22:27:37.968422+00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  image_url_home = EXCLUDED.image_url_home,
  image_url_search = EXCLUDED.image_url_search,
  click_type = EXCLUDED.click_type,
  whatsapp_number = EXCLUDED.whatsapp_number,
  is_active = EXCLUDED.is_active,
  slug = EXCLUDED.slug,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 6. BANNERS (6 registros)
-- ATENÇÃO: As URLs de imagem apontam para o Cloud antigo
-- =====================================================
INSERT INTO public.banners (id, image_url, image_desktop, image_mobile, position, click_type, click_target, whatsapp_number, is_active, created_at) VALUES
  ('3033e602-7a0d-44b9-a8de-df3f09ff3a1f', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 1, 'none', NULL, NULL, false, '2025-12-28 04:32:27.531166+00'),
  ('2ae4eeda-815f-4a83-b447-b7f549e2c760', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 2, 'none', NULL, NULL, false, '2025-12-28 04:32:45.678573+00'),
  ('7ad933e3-e4c9-425a-85e5-cf1ec0956f9c', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478777655.png', 2, 'link', 'https://www.sagabyd.com.br/saga-byd-caceres', NULL, true, '2025-12-28 07:02:47.484279+00'),
  ('ecfc890f-54a1-4571-a6ee-d9a2254905ad', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478481599.png', 1, 'link', 'https://www.cometavolkswagen.com.br/', NULL, true, '2026-01-27 00:26:56.323418+00'),
  ('1c614a78-0293-4aa8-b14b-3821665686b2', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478256656.png', 3, 'link', 'https://www.jeep.sunauto.com.br/', NULL, true, '2026-01-27 00:34:04.68074+00'),
  ('e26bad14-6533-4149-999e-d7336ae79bf9', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769477476523.png', 0, 'link', 'https://www.disbravaford.com.br/', NULL, true, '2026-01-27 01:31:19.975845+00')
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  image_desktop = EXCLUDED.image_desktop,
  image_mobile = EXCLUDED.image_mobile,
  position = EXCLUDED.position,
  click_type = EXCLUDED.click_type,
  click_target = EXCLUDED.click_target,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- 7. AD_BILLING (4 registros)
-- =====================================================
INSERT INTO public.ad_billing (id, ad_id, company_name, monthly_fee, billing_day, whatsapp_number, metrics_reset_at, created_at, updated_at) VALUES
  ('ed430e1d-7c36-4c70-a634-69fc99f03408', '98ecb93a-1bce-45bb-97ba-3a561d953b33', '8bus', 250, 25, '6599999999999', '2026-01-25 04:45:25.870579+00', '2026-01-25 04:45:06.707+00', '2026-01-25 04:45:25.870579+00'),
  ('ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', '66321f57-1eaf-443b-8f0a-077855b1aa38', 'Borracharia Radial', 250, 5, '65999002981', '2026-01-11 00:15:38.412+00', '2026-02-05 03:00:00+00', '2026-01-11 00:15:39.140511+00'),
  ('8d859dd2-a551-48df-b3b7-b9743c2da986', 'dc8539d3-9a3e-4f99-981f-ef573c2cf27d', 'Borracharia Bandeirantes', 250, 5, '65999891046', '2026-01-11 00:16:31.888+00', '2026-02-05 03:00:00+00', '2026-01-11 00:16:32.609036+00'),
  ('53722f04-eaff-470a-904c-1e162f34b1d3', '793dc469-bfde-40bc-81c9-132269ca46fd', 'Retifica Power', 250, 5, '65996137559', '2026-01-11 00:17:09.454+00', '2026-02-05 03:00:00+00', '2026-01-11 00:17:10.177817+00')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  monthly_fee = EXCLUDED.monthly_fee,
  billing_day = EXCLUDED.billing_day,
  whatsapp_number = EXCLUDED.whatsapp_number,
  metrics_reset_at = EXCLUDED.metrics_reset_at,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 8. AD_BILLING_PAYMENTS (7 registros)
-- =====================================================
INSERT INTO public.ad_billing_payments (id, billing_id, reference_month, reference_year, paid_at, notes, created_at) VALUES
  ('34496937-ba4b-4359-ae4d-fafee79a1f5d', 'ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', 2, 2026, '2026-02-05 03:00:00+00', NULL, '2026-01-11 00:15:34.650684+00'),
  ('e349e999-dac1-42e1-86ba-ffd9b62a0cc6', 'ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', 1, 2026, '2026-01-11 00:15:38.858472+00', NULL, '2026-01-11 00:15:38.858472+00'),
  ('4008246e-9cac-4548-b2af-a821086af750', '8d859dd2-a551-48df-b3b7-b9743c2da986', 2, 2026, '2026-02-05 03:00:00+00', NULL, '2026-01-11 00:16:29.633383+00'),
  ('53d4239a-1a6b-42b2-97a6-e84e97047e4a', '8d859dd2-a551-48df-b3b7-b9743c2da986', 1, 2026, '2026-01-11 00:16:32.332429+00', NULL, '2026-01-11 00:16:32.332429+00'),
  ('5254dacc-b2d9-47b8-bfe3-7f8a9d1fa8c7', '53722f04-eaff-470a-904c-1e162f34b1d3', 2, 2026, '2026-02-05 03:00:00+00', NULL, '2026-01-11 00:17:07.596953+00'),
  ('660cde8b-407d-4e1f-89b3-2f8121ac7bb1', '53722f04-eaff-470a-904c-1e162f34b1d3', 1, 2026, '2026-01-11 00:17:09.89684+00', NULL, '2026-01-11 00:17:09.89684+00'),
  ('34f654cc-bc50-49bc-8b6a-eb9b8b547ffa', 'ed430e1d-7c36-4c70-a634-69fc99f03408', 1, 2026, '2026-01-25 04:45:06.707+00', NULL, '2026-01-25 04:45:26.197547+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. INTERNAL_EXPENSES (1 registro)
-- =====================================================
INSERT INTO public.internal_expenses (id, name, description, category, expense_date, amount, status, notes, created_at, updated_at) VALUES
  ('3d0fdd39-ec6a-47eb-b484-59bb81bfd4c0', 'Posto gasolina', 'Gasto', 'combustivel', '2026-01-05', 120, 'paid', NULL, '2026-01-05 23:49:04.883852+00', '2026-01-29 17:47:15.239243+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 10. Resetar sequência de códigos de carros
-- Execute após migrar os carros para evitar conflitos
-- =====================================================
-- SELECT setval('car_code_seq', (SELECT MAX(CAST(REPLACE(code, 'CC-', '') AS INTEGER)) FROM cars), true);

-- =====================================================
-- NOTA SOBRE CARROS:
-- Os carros NÃO foram incluídos neste script porque as
-- fotos precisam ser migradas primeiro do storage.
-- Após migrar as imagens, execute o script de carros
-- separadamente atualizando as URLs das fotos.
-- =====================================================

-- =====================================================
-- NOTA SOBRE AUTENTICAÇÃO:
-- Os usuários no auth.users NÃO podem ser migrados via SQL.
-- Os usuários precisarão:
-- 1. Criar novas contas no Supabase externo, OU
-- 2. Usar a API Admin do Supabase para criar usuários
-- =====================================================
