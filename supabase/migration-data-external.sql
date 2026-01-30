-- ============================================================
-- SCRIPT DE MIGRAÇÃO DE DADOS PARA SUPABASE EXTERNO
-- Gerado em: 2026-01-30
-- Projeto: Compre Carros BR
-- ============================================================
--
-- ⚠️ IMPORTANTE: Execute APÓS o script de estrutura (migration-complete-external.sql)
-- ⚠️ IMPORTANTE: Antes de executar, crie os usuários no auth.users via Admin API
--
-- Os UUIDs dos usuários auth.users DEVEM ser os mesmos listados em profiles!
-- Veja o guia em: docs/GUIA-MIGRACAO-USUARIOS-AUTH.md
--
-- ============================================================

-- ============================================================
-- PARTE 1: ATUALIZAR SEQUÊNCIA DO car_code_seq
-- ============================================================
SELECT setval('car_code_seq', 11, true);

-- ============================================================
-- PARTE 2: BRANDS (31 registros)
-- ============================================================

INSERT INTO public.brands (id, name, logo_url, category, is_active, created_at, updated_at) VALUES
  ('a823e762-3c68-4f68-b465-6f90f65c4d2a', 'Audi', 'https://www.carlogos.org/car-logos/audi-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('87f24d4f-ca95-4856-ac48-53ea0e3e241e', 'BMW', 'https://www.carlogos.org/car-logos/bmw-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('42067307-37bd-47c9-947b-162cf8af2895', 'BMW', 'https://www.carlogos.org/car-logos/bmw-logo.png', 'motorcycle', false, '2025-12-28 06:06:19.728213+00', '2025-12-28 06:46:37.918174+00'),
  ('b0b96a07-688c-4343-a222-0992d8e07c35', 'Chevrolet', 'https://www.carlogos.org/car-logos/chevrolet-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('63b7038f-14cc-40d9-8ec2-b4c05e33d11a', 'Citroën', 'https://www.carlogos.org/car-logos/citroen-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('78bb179a-5f7f-4508-a663-45e4b40086b2', 'Dafra', '/logos/dafra-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:34.678144+00'),
  ('b877b67c-cd3e-4e27-9168-ac6c9993570d', 'Ducati', 'https://www.carlogos.org/motorcycle-logos/ducati-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:33.41374+00'),
  ('19fb93b0-f85b-431f-a72d-81d24503c874', 'Fiat', 'https://www.carlogos.org/car-logos/fiat-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('12c64fa1-ef72-4cbc-a286-3dd148324422', 'Ford', 'https://www.carlogos.org/car-logos/ford-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('96dc9b75-a536-447c-8a6b-703fcb44f899', 'Harley-Davidson', 'https://www.carlogos.org/motorcycle-logos/harley-davidson-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:24.611618+00'),
  ('417babd9-13c8-4160-9d86-ec83b9cdba35', 'Honda', 'https://www.carlogos.org/car-logos/honda-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('ad27e3d9-dc98-43c8-95cb-157b6c43000c', 'Honda', 'https://www.carlogos.org/car-logos/honda-logo.png', 'motorcycle', false, '2025-12-28 06:06:19.728213+00', '2025-12-28 06:46:19.149485+00'),
  ('ec5ff594-40fe-4386-9abf-07e1390389dd', 'Hyundai', 'https://www.carlogos.org/car-logos/hyundai-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('28435b8e-64e6-4e89-bb1c-1381b4056bf8', 'Jeep', 'https://www.carlogos.org/car-logos/jeep-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-26 18:33:24.78598+00'),
  ('633e220d-d340-4007-b024-59d4c76a6f2b', 'Kawasaki', 'https://www.carlogos.org/motorcycle-logos/kawasaki-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:16.740106+00'),
  ('7fe6e636-aeef-4ac6-8844-a6af4c38db54', 'Kia', 'https://www.carlogos.org/car-logos/kia-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-27 20:35:01.221227+00'),
  ('fbf624b1-34ce-4fc2-85fd-75a5b8f9f570', 'KTM', 'https://www.carlogos.org/motorcycle-logos/ktm-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:13.448806+00'),
  ('280289b7-6cff-427c-955b-c9142610913e', 'Land Rover', 'https://www.carlogos.org/car-logos/land-rover-logo.png', 'car', false, '2025-12-24 04:58:47.396006+00', '2025-12-26 18:33:28.336412+00'),
  ('5eb4f6a2-6c8b-4f87-a827-409550fbb5bc', 'Mercedes-Benz', 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('0516333f-26a0-4049-a66b-11c5627ca9dc', 'Mitsubishi', 'https://www.carlogos.org/car-logos/mitsubishi-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('f954f225-f65d-4070-8efb-742416f6783e', 'Nissan', 'https://www.carlogos.org/car-logos/nissan-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('66baa6bf-c8e9-4a16-8b12-cd9b98f63f04', 'Peugeot', 'https://www.carlogos.org/car-logos/peugeot-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('bb879eb9-7c49-459b-82a9-15ef55f2dac9', 'Renault', 'https://www.carlogos.org/car-logos/renault-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('2d396d5a-f7d2-4a82-a2a9-9a92f4e2e7dd', 'Shineray', '/logos/shineray-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:09.878451+00'),
  ('a25d9f07-8de5-4b4c-8a0e-d2dc4d39ab3e', 'Suzuki', 'https://www.carlogos.org/car-logos/suzuki-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:07.460478+00'),
  ('d9f5f0ed-1b4a-4f9a-8c3e-2c1b3d4e5f6a', 'Toyota', 'https://www.carlogos.org/car-logos/toyota-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('e3c9d8b7-6a5f-4e3d-2c1b-0a9f8e7d6c5b', 'Triumph', 'https://www.carlogos.org/motorcycle-logos/triumph-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:04.851878+00'),
  ('4d56000c-6aca-4373-8baa-ebf31724f9e8', 'Volkswagen', 'https://www.carlogos.org/car-logos/volkswagen-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('f1e2d3c4-5b6a-7c8d-9e0f-1a2b3c4d5e6f', 'Volvo', 'https://www.carlogos.org/car-logos/volvo-logo.png', 'car', true, '2025-12-24 04:58:47.396006+00', '2025-12-24 04:58:47.396006+00'),
  ('85b3c1ae-9042-4fef-b56e-5f75bc8b3c18', 'Yamaha', 'https://www.carlogos.org/motorcycle-logos/yamaha-logo.png', 'motorcycle', false, '2025-12-28 05:35:25.405065+00', '2025-12-28 06:46:01.802203+00'),
  ('a2b3c4d5-e6f7-8901-2345-6789abcdef01', 'Haojue', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Haojue_logo.png/200px-Haojue_logo.png', 'motorcycle', false, '2025-12-28 06:10:50.523624+00', '2025-12-28 06:45:59.190541+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- PARTE 3: PROFILES (4 registros)
-- ⚠️ IMPORTANTE: Os usuários em auth.users devem existir ANTES
-- ============================================================

INSERT INTO public.profiles (id, email, name, created_at, updated_at) VALUES
  ('3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'flaviofernandesv@gmail.com', 'Super Admin', '2025-12-26 18:31:10.077864+00', '2025-12-26 18:31:10.077864+00'),
  ('c7314718-33e5-41f0-96c6-61d3c3300086', 'primeveiculos@gmail.com', 'Teste', '2025-12-26 18:47:50.946514+00', '2025-12-31 22:40:03.925042+00'),
  ('aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'elitecar@gmail.com', 'Teste2@gmail.com', '2025-12-26 23:53:59.807046+00', '2025-12-31 22:38:03.763384+00'),
  ('2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'g12@gmail.com', 'G12 Automóveis', '2025-12-31 23:02:33.91722+00', '2025-12-31 23:02:33.91722+00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- PARTE 4: USER_ROLES (4 registros)
-- ============================================================

INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
  ('03adabd5-5b14-46e0-9683-102e68557722', '3a2095d3-f1d6-41e8-9c90-5705b1536e08', 'super_admin', '2025-12-26 18:31:10.255127+00'),
  ('693796c6-7927-4bdb-844f-f2782b744312', 'c7314718-33e5-41f0-96c6-61d3c3300086', 'garage', '2025-12-26 18:47:51.148617+00'),
  ('cae90481-008f-4d17-b2d1-bd6c9e6b6c1c', 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd', 'garage', '2025-12-26 23:54:00.002599+00'),
  ('1951c69b-0d56-4182-9b81-30e1c375923e', '2a13bffa-e70b-4f74-a7d7-9643f0929c78', 'garage', '2025-12-31 23:02:34.090377+00')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role;

-- ============================================================
-- PARTE 5: GARAGES (3 registros)
-- ============================================================

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

-- ============================================================
-- PARTE 6: ADS (12 registros)
-- ⚠️ URLs de imagem apontam para o Cloud antigo - substituir depois!
-- ============================================================

INSERT INTO public.ads (id, title, category, image_url_home, image_url_search, link, click_type, click_target, whatsapp_number, slug, is_active, created_at, updated_at) VALUES
  ('b344d785-cdd3-4b5a-ab9e-e50d5271a45f', 'Negrão Auto Center', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767634270025-besyjt.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1766986557270-hve5p.png', NULL, 'whatsapp', NULL, '65981156716', 'negrao-auto-center', true, '2025-12-29 04:50:18.019812+00', '2026-01-10 22:34:08.359178+00'),
  ('daed7d4b-9fce-4e55-81b2-d6148ce1845f', 'Magrão Matic', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767720542329-ecq9z.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767717869675-jn78ua.png', NULL, 'whatsapp', NULL, '65998161550', 'magrao-matic', true, '2026-01-05 21:44:06.13176+00', '2026-01-10 22:32:51.09058+00'),
  ('2cfc16fa-938b-461a-a255-456bf79f5705', 'Armazém Auto Latas', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084245677-hn4lug.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084247604-8r7pe.png', NULL, 'whatsapp', NULL, '6599067306', 'armazem-auto-latas', true, '2026-01-07 18:39:01.547619+00', '2026-01-10 22:51:23.640821+00'),
  ('6aa38edc-de3a-4b47-bfa9-e29d17219085', 'Exame Veicular', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813554188-aqyw8.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813555507-44c1ss.png', NULL, 'whatsapp', NULL, '65996100077', 'exame-veicular', true, '2026-01-07 19:19:17.041428+00', '2026-01-10 22:57:11.505264+00'),
  ('8092e9bc-f382-4c67-af0b-c0a97931f5d3', 'Rafa Diesel', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084203053-bwzkm.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084204286-x8bt1i.png', NULL, 'whatsapp', NULL, '556532241630', 'rafa-diesel', true, '2026-01-07 20:33:08.071285+00', '2026-01-10 22:30:07.055233+00'),
  ('b20a8f96-25d2-4bcf-a82b-78fe998aafc7', 'Mecânica do Valdir', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819840992-07h7k.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819842699-85lgqu.png', NULL, 'whatsapp', NULL, '65998097236', 'mecanica-do-valdir', true, '2026-01-07 21:04:03.758054+00', '2026-01-10 22:34:53.436242+00'),
  ('66321f57-1eaf-443b-8f0a-077855b1aa38', 'Borracharia Radial', 'borracharia', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084164001-ofk02p.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084165564-yw93eg.png', NULL, 'whatsapp', NULL, '65999002981', 'borracharia-radial', true, '2026-01-07 21:55:47.095771+00', '2026-01-10 22:29:27.681762+00'),
  ('793dc469-bfde-40bc-81c9-132269ca46fd', 'Retífica Power', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084123349-gmn6pt.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084128234-k06jmv.png', NULL, 'whatsapp', NULL, '65996137559', 'retifica-power', true, '2026-01-07 22:27:16.45243+00', '2026-01-10 22:29:04.663326+00'),
  ('98ecb93a-1bce-45bb-97ba-3a561d953b33', '8bus', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891748469-7qlvo8.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891750176-su5kc.jpg', NULL, 'whatsapp', NULL, '65999888812', '8bus', true, '2026-01-08 17:02:32.802778+00', '2026-01-10 22:53:10.832455+00'),
  ('22a88163-f606-402e-8372-3109fe6fdc3c', 'RF Motos', 'mecanica', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052504236-3je1l4.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052506091-h39p0d.jpg', NULL, 'whatsapp', NULL, '65999231426', 'rf-motos', true, '2026-01-10 13:41:48.99209+00', '2026-01-10 22:28:15.612063+00'),
  ('dc8539d3-9a3e-4f99-981f-ef573c2cf27d', 'Borracharia Bandeirantes', 'borracharia', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768083971671-hs1m5q.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768083973356-91zcp.png', NULL, 'whatsapp', NULL, '65999891046', 'borracharia-bandeirantes', true, '2026-01-10 22:26:15.667878+00', '2026-01-10 22:26:15.667878+00'),
  ('1e8d9c7b-6a5f-4e3d-2c1b-0a9f8e7d6c5a', 'Estacionamento Pantanal', 'outros', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768113693614-l1oqf.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768113695201-g69a4.png', NULL, 'whatsapp', NULL, '65999614400', 'estacionamento-pantanal', true, '2026-01-11 06:41:37.009817+00', '2026-01-11 06:41:37.009817+00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  image_url_home = EXCLUDED.image_url_home,
  image_url_search = EXCLUDED.image_url_search,
  link = EXCLUDED.link,
  click_type = EXCLUDED.click_type,
  click_target = EXCLUDED.click_target,
  whatsapp_number = EXCLUDED.whatsapp_number,
  slug = EXCLUDED.slug,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- PARTE 7: AD_BILLING (4 registros)
-- ============================================================

INSERT INTO public.ad_billing (id, ad_id, company_name, whatsapp_number, monthly_fee, billing_day, metrics_reset_at, created_at, updated_at) VALUES
  ('ed430e1d-7c36-4c70-a634-69fc99f03408', '98ecb93a-1bce-45bb-97ba-3a561d953b33', '8bus', '6599999999999', 250, 25, '2026-01-25 04:45:25.870579+00', '2026-01-25 04:45:06.707+00', '2026-01-25 04:45:25.870579+00'),
  ('ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', '66321f57-1eaf-443b-8f0a-077855b1aa38', 'Borracharia Radial', '65999002981', 250, 5, '2026-01-11 00:15:38.412+00', '2026-02-05 03:00:00+00', '2026-01-11 00:15:39.140511+00'),
  ('8d859dd2-a551-48df-b3b7-b9743c2da986', 'dc8539d3-9a3e-4f99-981f-ef573c2cf27d', 'Borracharia Bandeirantes', '65999891046', 250, 5, '2026-01-11 00:16:31.888+00', '2026-02-05 03:00:00+00', '2026-01-11 00:16:32.609036+00'),
  ('53722f04-eaff-470a-904c-1e162f34b1d3', '793dc469-bfde-40bc-81c9-132269ca46fd', 'Retifica Power', '65996137559', 250, 5, '2026-01-11 00:17:09.454+00', '2026-02-05 03:00:00+00', '2026-01-11 00:17:10.177817+00')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  whatsapp_number = EXCLUDED.whatsapp_number,
  monthly_fee = EXCLUDED.monthly_fee,
  billing_day = EXCLUDED.billing_day,
  metrics_reset_at = EXCLUDED.metrics_reset_at,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- PARTE 8: AD_BILLING_PAYMENTS (7 registros)
-- ============================================================

INSERT INTO public.ad_billing_payments (id, billing_id, reference_month, reference_year, paid_at, notes, created_at) VALUES
  ('34496937-ba4b-4359-ae4d-fafee79a1f5d', 'ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', 2, 2026, '2026-02-05 03:00:00+00', NULL, '2026-01-11 00:15:34.650684+00'),
  ('e349e999-dac1-42e1-86ba-ffd9b62a0cc6', 'ddbb4f87-9cf9-4bae-bc5c-ce9dfa341c07', 1, 2026, '2026-01-11 00:15:38.858472+00', NULL, '2026-01-11 00:15:38.858472+00'),
  ('4008246e-9cac-4548-b2af-a821086af750', '8d859dd2-a551-48df-b3b7-b9743c2da986', 2, 2026, '2026-02-05 03:00:00+00', NULL, '2026-01-11 00:16:29.633383+00'),
  ('53d4239a-1a6b-42b2-97a6-e84e97047e4a', '8d859dd2-a551-48df-b3b7-b9743c2da986', 1, 2026, '2026-01-11 00:16:32.332429+00', NULL, '2026-01-11 00:16:32.332429+00'),
  ('5254dacc-b2d9-47b8-bfe3-7f8a9d1fa8c7', '53722f04-eaff-470a-904c-1e162f34b1d3', 2, 2026, '2026-02-05 03:00:00+00', NULL, '2026-01-11 00:17:07.596953+00'),
  ('660cde8b-407d-4e1f-89b3-2f8121ac7bb1', '53722f04-eaff-470a-904c-1e162f34b1d3', 1, 2026, '2026-01-11 00:17:09.89684+00', NULL, '2026-01-11 00:17:09.89684+00'),
  ('34f654cc-bc50-49bc-8b6a-eb9b8b547ffa', 'ed430e1d-7c36-4c70-a634-69fc99f03408', 1, 2026, '2026-01-25 04:45:06.707+00', NULL, '2026-01-25 04:45:26.197547+00')
ON CONFLICT (id) DO UPDATE SET
  paid_at = EXCLUDED.paid_at,
  notes = EXCLUDED.notes;

-- ============================================================
-- PARTE 9: BANNERS (6 registros)
-- ⚠️ URLs de imagem apontam para o Cloud antigo - substituir depois!
-- ============================================================

INSERT INTO public.banners (id, image_url, image_desktop, image_mobile, click_type, click_target, whatsapp_number, position, is_active, created_at) VALUES
  ('e26bad14-6533-4149-999e-d7336ae79bf9', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769477476523.png', 'link', 'https://www.disbravaford.com.br/', NULL, 0, true, '2026-01-27 01:31:19.975845+00'),
  ('ecfc890f-54a1-4571-a6ee-d9a2254905ad', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478481599.png', 'link', 'https://www.cometavolkswagen.com.br/', NULL, 1, true, '2026-01-27 00:26:56.323418+00'),
  ('3033e602-7a0d-44b9-a8de-df3f09ff3a1f', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg', 'none', NULL, NULL, 1, false, '2025-12-28 04:32:27.531166+00'),
  ('7ad933e3-e4c9-425a-85e5-cf1ec0956f9c', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478777655.png', 'link', 'https://www.sagabyd.com.br/saga-byd-caceres?utm_source=google&utm_medium=search&utm_campaign=institucional&gad_source=1&gad_campaignid=22795327621&gbraid=0AAAAAo_TfHrB-1LRacjfiJAOnXGfZflbm&gclid=Cj0KCQiAvtzLBhCPARIsALwhxdpfxugyhGZt-J-80uqUHIQHTFqxAHqlAsfVs2DKIY1mYL6yLltW6y4aAs0eEALw_wcB', NULL, 2, true, '2025-12-28 07:02:47.484279+00'),
  ('2ae4eeda-815f-4a83-b447-b7f549e2c760', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg', 'none', NULL, NULL, 2, false, '2025-12-28 04:32:45.678573+00'),
  ('1c614a78-0293-4aa8-b14b-3821665686b2', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png', 'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478256656.png', 'link', 'https://www.jeep.sunauto.com.br/', NULL, 3, true, '2026-01-27 00:34:04.68074+00')
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  image_desktop = EXCLUDED.image_desktop,
  image_mobile = EXCLUDED.image_mobile,
  click_type = EXCLUDED.click_type,
  click_target = EXCLUDED.click_target,
  whatsapp_number = EXCLUDED.whatsapp_number,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active;

-- ============================================================
-- PARTE 10: INTERNAL_EXPENSES (1 registro)
-- ============================================================

INSERT INTO public.internal_expenses (id, name, description, category, amount, expense_date, status, notes, created_at, updated_at) VALUES
  ('3d0fdd39-ec6a-47eb-b484-59bb81bfd4c0', 'Posto gasolina', 'Gasto', 'combustivel', 120, '2026-01-05', 'paid', NULL, '2026-01-05 23:49:04.883852+00', '2026-01-29 17:47:15.239243+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  amount = EXCLUDED.amount,
  expense_date = EXCLUDED.expense_date,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  updated_at = EXCLUDED.updated_at;

-- ============================================================
-- FIM DO SCRIPT DE DADOS
-- ============================================================
-- 
-- ⚠️ PRÓXIMOS PASSOS:
-- 1. Execute o script de carros separado (contém dados grandes)
-- 2. Migre os action_logs (601 registros - script separado)
-- 3. Migre os arquivos do Storage bucket por bucket
-- 4. Execute o script de atualização de URLs
--
-- ============================================================
