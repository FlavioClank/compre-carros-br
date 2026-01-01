-- =====================================================
-- MIGRAÇÃO DE CARROS - CAR CONNECT
-- Execute APÓS migration-data.sql
-- =====================================================

-- =====================================================
-- CARS (Veículos)
-- IMPORTANTE: As imagens ainda apontam para o Supabase antigo
-- Você precisará baixar e fazer re-upload no novo Storage
-- =====================================================

INSERT INTO public.cars (
  id, garage_id, brand_id, code, model, version, year, mileage, 
  transmission, fuel, color, price, photos, description, 
  category, condition, doors, slug, status, is_featured,
  garage_is_active, created_at, updated_at
) VALUES
-- CC-000004: Volkswagen Tera 2025
(
  'e2f48be6-1b6f-40e4-9c9c-20f2af63ceb3',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  '4d56000c-6aca-4373-8baa-ebf31724f9e8',
  'CC-000004',
  'Tera',
  '1.0 MPI Mecânico Flex 12V 5p',
  2025,
  2999,
  'automatic',
  'flex',
  'Branco',
  108000.00,
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222509706-8xm6jpy77fk.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222510532-kdyb4bcdy09.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222511319-21d05rc77c4.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222512088-skpkk8dxh1q.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222512991-g4ct2ds1zyb.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222513648-yfk2cu54278.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222514339-lq9z3knljbq.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222515046-m3jpgpyu2hk.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222515740-m3xsg1re7wh.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222516434-vcmmkmzgr0q.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222517131-d2wp5woe8.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224553122-kaoifayspks.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224555009-w3ngebswnha.jpeg'
  ],
  'Volkswagen Tera 170 TSI Automático (2025/2026)
1. Motorização e Performance
Motor: 1.0 Turbo Flex (3 cilindros).
Potência: Até 116 cv (Etanol) / 109 cv (Gasolina).
Torque: 16,8 kgfm (165 Nm) — disponível já em baixas rotações.
Câmbio: Automático de 6 marchas com opção de trocas manuais.
Aceleração: 0 a 100 km/h em aprox. 10,5 segundos.

2. Design e Estilo
Visual: SUV compacto moderno, com teto que pode ser bicolor e faróis em Full LED.
Interior: Painel digital e central multimídia VW Play de 10,1 polegadas.

3. Tecnologia e Segurança
Frenagem Autônoma de Emergência (AEB)
ACC: Piloto automático adaptativo
Carregador de celular por indução

"Novo SUV da Volkswagen"',
  'car',
  'used',
  4,
  'volkswagen-tera-10-mpi-mecanico-flex-12v-5p-2025',
  'available',
  false,
  true,
  '2025-12-31 23:08:41.717661+00',
  '2025-12-31 23:42:39.575143+00'
),

-- CC-000005: Volkswagen T-Cross 2025
(
  '67670da4-f2c1-4a67-b620-addb9336023f',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  '4d56000c-6aca-4373-8baa-ebf31724f9e8',
  'CC-000005',
  'T-Cross',
  '200 TSI 1.0 Turbo',
  2025,
  8999,
  'automatic',
  'flex',
  'Cinza Ascot',
  86900.00,
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224185137-37j88ci8imy.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224186899-b6g7u0eso8e.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224192342-wqs75zucez.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224195031-s1aold5qnta.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224197701-qt1m5aczi2j.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224198382-ecgtk5jkjef.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224199030-35ff5v8torm.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224200125-s5bm59t984.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224200767-mvzfqlahge.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224201436-y69f88hu3og.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224202108-gt7dob488ui.jpeg'
  ],
  'Modelo e Motorização
Versão de Entrada (200 TSI): Equipada com motor 1.0 Turbo Flex de três cilindros.
Potência: Entrega até 128 cv com etanol e 116 cv com gasolina.
Torque: 20,4 kgfm, garantindo boa agilidade no uso urbano.
Câmbio: Automático de 6 marchas.

O que mudou na linha 2025
Design Externo: Novos faróis 100% LED de série.
Interior: Painel redesenhado com materiais soft-touch.
Segurança: ACC e Frenagem Autônoma de Emergência (AEB).

Especificações Gerais
Porta-malas: Capacidade entre 373 e 420 litros.
Consumo: 11,7 km/l cidade e 16,9 km/l estrada (gasolina).',
  'car',
  'used',
  4,
  'volkswagen-t-cross-200-tsi-10-turbo-2025',
  'available',
  false,
  true,
  '2025-12-31 23:36:46.486809+00',
  '2025-12-31 23:36:46.486809+00'
),

-- CC-000006: Hyundai HB20 2025
(
  '2b6a43ae-d192-4553-b044-ddec2606ea55',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  'ec5ff594-40fe-4386-9abf-07e1390389dd',
  'CC-000006',
  'Hb20',
  'HB20 Comfort 1.0 Flex',
  2025,
  66754,
  'manual',
  'flex',
  'Cinza Silk',
  45900.00,
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225634260-oqfxf5o9w0k.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225638124-9icybzqjyro.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225641550-jagadomnjc.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225644718-rv504k4ia8.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225646623-oc73xtfr1fi.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225661966-aoojbpz8fcc.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225664206-ef7h8oc86x6.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767225693340-xnky5lbnr8k.jpg'
  ],
  '1. Motorização e Eficiência
Motor: Kappa 1.0 de 3 cilindros 12V.
Potência: Até 80 cv com etanol e 75 cv com gasolina.
Torque: 10,2 kgfm (E) / 9,4 kgfm (G).
Câmbio: Manual de 5 marchas.

2. Design Externo
Cor: Cinza Silk (Cinza Metálico).
Frente: Nova grelha em preto brilhante com design em cascata.
Traseira: Lanterna em LED (assinatura visual "H").

3. Itens de Série
Segurança: 6 airbags, controle de estabilidade (ESP) e HAC.
Conforto: Ar-condicionado, direção elétrica, vidros elétricos.

"Design de última geração com economia que cabe no seu bolso."',
  'car',
  'used',
  4,
  'hyundai-hb20-hb20-comfort-10-flex-2025',
  'available',
  false,
  true,
  '2026-01-01 00:01:40.387952+00',
  '2026-01-01 00:01:40.387952+00'
),

-- CC-000007: Chevrolet S10 2016
(
  'fd3f0938-bdef-45cd-926f-b32e4757479b',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  'b0b96a07-688c-4343-a222-0992d8e07c35',
  'CC-000007',
  'S10',
  '2.8 CTDI LT (Cabine Dupla) 4x4',
  2016,
  178000,
  'automatic',
  'diesel',
  'Prata Switchblade',
  98900.00,
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226302746-7fuy339iaek.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226306173-qbp1jrk67sg.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226308996-fxn1wl9alcr.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226311779-pumg0lyeswk.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226314419-8f3i1ko369x.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226316652-dbmfudddhis.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226320640-0zyqnbtc1tp.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226323498-hu84zo8wkl9.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226327347-3kw7hfylu9a.jpg'
  ],
  'Este modelo é conhecido por ser o "pau para toda obra" da Chevrolet.

Motor: 2.8 Turbo Diesel CTDI.
Tração: 4x4 com seletor eletrônico.
Câmbio: Automático de 6 marchas.

Diferenciais Visuais:
- Pneus All-Terrain T/A com letras brancas
- Estribos laterais instalados
- Santo Antônio e capota marítima

Interior: Bancos em tecido resistente, central multimídia original.
Estado: Veículo muito bem conservado e limpo.

"A força que o seu trabalho exige com o conforto que a sua família merece."',
  'car',
  'used',
  4,
  'chevrolet-s10-28-ctdi-lt-cabine-dupla-4x4-2016',
  'available',
  false,
  true,
  '2026-01-01 00:12:13.51469+00',
  '2026-01-01 00:12:13.51469+00'
),

-- CC-000008: Fiat Strada 2024
(
  '7d705911-5cea-4b65-8804-2947ea3d19f6',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  '19fb93b0-f85b-431f-a72d-81d24503c874',
  'CC-000008',
  'Fiat Strada',
  'Freedom 1.3 Firefly',
  2024,
  14530,
  'manual',
  'flex',
  'Cinza Silverstone',
  89900.00,
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226908404-qxlg3guyb.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226912139-ngsail0h5ae.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226913793-gitok11hab8.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226915598-ygbg8kw0477.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226918185-80yepwtcgx2.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226920281-ertubgquib.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767226923078-nctx24a48el.jpg'
  ],
  'Ficha Técnica: Fiat Strada Freedom 1.3 Firefly (Cabine Dupla)
Motor: 1.3 Firefly Flex.
Potência: Até 107 cv com etanol e 98 cv com gasolina.
Torque: 13,7 kgfm (E) / 13,2 kgfm (G).
Câmbio: Manual de 5 marchas.
Cor: Cinza Silverstone.

Destaques Visuais:
Faróis: Máscara negra e design moderno.
Rodas: Rodas de liga leve exclusivas da versão Freedom.
Praticidade: Capota marítima e protetor de caçamba.
Capacidade: 4 portas e homologada para 5 passageiros.',
  'car',
  'used',
  4,
  'fiat-fiat-strada-freedom-13-firefly-2024',
  'available',
  false,
  true,
  '2026-01-01 00:22:08.605746+00',
  '2026-01-01 00:22:08.605746+00'
),

-- CC-000009: Toyota Hilux 2015
(
  '1a98abba-be37-4246-a378-53d0b24e4a3c',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  'c4d5ff54-a18e-4716-a8df-dc103c662245',
  'CC-000009',
  'Toyota Hilux',
  'SRV 3.0 Diesel 4x4',
  2015,
  210500,
  'automatic',
  'flex',
  'Cinza Grafite',
  96000.00,
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233004406-4yfisridh7r.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233008324-ibf6344zwte.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233011391-x5x2fy3rtdj.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233013285-x87lfufn2ls.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233015427-1dqpbivl2cl.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233017380-3bnrhzr792y.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233019455-qmbhxhj913p.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233022140-zr594gl7qgd.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233024069-liwpvk6fpqd.jpg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767233026118-7lo3hs11jif.jpg'
  ],
  'Ficha Técnica: Toyota Hilux SRV 3.0 Turbo Diesel 4x4
Ano: 2014/2015 (Modelo com a grade cromada clássica).

Motor: 3.0 D-4D Turbo Diesel com 171 cv.
Torque: 36,7 kgfm.
Câmbio: Automático de 5 marchas.
Cor: Cinza Grafite (tom escuro metálico).
Tração: 4x4 com alavanca de seleção mecânica.

"Onde as outras param, a Hilux 3.0 passa. Leve para casa a picape que não desvaloriza e encara qualquer desafio com a alma de uma Toyota legítima."',
  'car',
  'used',
  4,
  'toyota-toyota-hilux-srv-30-diesel-4x4-2015',
  'available',
  false,
  true,
  '2026-01-01 00:31:12.235978+00',
  '2026-01-01 02:03:51.737365+00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  photos = EXCLUDED.photos,
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- Resetar sequência de códigos
-- =====================================================
SELECT setval('car_code_seq', 10, true);
