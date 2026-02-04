-- ============================================================
-- MIGRAÇÃO DE CARROS - DADOS COMPLETOS
-- Execute APÓS o script principal MIGRATION-FINAL-EXTERNAL.sql
-- ============================================================

-- Desabilitar trigger temporariamente para inserir com código já definido
ALTER TABLE public.cars DISABLE TRIGGER set_car_code;

-- CARRO 1: VW Tera
INSERT INTO public.cars (id, garage_id, brand_id, code, model, version, year, color, mileage, transmission, fuel, price, description, photos, status, is_featured, doors, condition, category, slug, garage_is_active, created_at, updated_at)
VALUES (
  'e2f48be6-1b6f-40e4-9c9c-20f2af63ceb3',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  '4d56000c-6aca-4373-8baa-ebf31724f9e8',
  'CC-000004',
  'Tera',
  '1.0 MPI Mecânico Flex 12V 5p',
  2025,
  'Branco',
  2999,
  'automatic',
  'flex',
  108000,
  E'Volkswagen Tera 170 TSI Automático (2025/2026)\n1. Motorização e Performance\n\nMotor: 1.0 Turbo Flex (3 cilindros).\n\nPotência: Até 116 cv (Etanol) / 109 cv (Gasolina).\n\nTorque: 16,8 kgfm (165 Nm) — disponível já em baixas rotações, o que deixa o carro muito esperto na cidade.\n\nCâmbio: Automático de 6 marchas com opção de trocas manuais (Paddle Shifts no volante em versões superiores).\n\nAceleração: 0 a 100 km/h em aprox. 10,5 segundos.\n\n2. Design e Estilo\n\nVisual: É um SUV compacto moderno, com teto que pode ser bicolor (Preto Ninja) e faróis em Full LED com assinatura marcante.\n\nPorte: Mais ágil e fácil de estacionar que o T-Cross, mas com a posição de dirigir elevada que todo dono de SUV gosta.\n\nInterior: Painel digital (Active Info Display) e central multimídia VW Play de 10,1 polegadas com conexão sem fio para Android Auto e Apple CarPlay.\n\n3. Tecnologia e Segurança (Destaques)\n\nFrenagem Autônoma de Emergência (AEB): O carro freia sozinho se detectar risco de colisão.\n\nACC: Piloto automático adaptativo (mantém a distância do carro da frente).\n\nPraticidade: Carregador de celular por indução (sem fio) e ar-condicionado digital Climatronic Touch.\n\n4. Consumo (Estimado)\n\nUm dos pontos mais fortes do Tera é a eficiência, fazendo médias próximas a 12 km/l na cidade e 14 km/l na estrada com gasolina, dependendo do modo de condução.\n\n"Novo SUV da Volkswagen" 🛫',
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
  'available',
  false,
  4,
  'used',
  'car',
  'volkswagen-tera-10-mpi-mecanico-flex-12v-5p-2025',
  true,
  '2025-12-31T23:08:41.717661+00:00',
  '2025-12-31T23:42:39.575143+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  description = EXCLUDED.description,
  photos = EXCLUDED.photos,
  updated_at = EXCLUDED.updated_at;

-- CARRO 2: Hyundai HB20
INSERT INTO public.cars (id, garage_id, brand_id, code, model, version, year, color, mileage, transmission, fuel, price, description, photos, status, is_featured, doors, condition, category, slug, garage_is_active, created_at, updated_at)
VALUES (
  '2b6a43ae-d192-4553-b044-ddec2606ea55',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  'ec5ff594-40fe-4386-9abf-07e1390389dd',
  'CC-000006',
  'Hb20',
  'HB20 Comfort 1.0 Flex',
  2023,
  'Cinza Silk',
  66800,
  'manual',
  'flex',
  65000,
  E'1. Motorização e Eficiência\n\nMotor: Kappa 1.0 de 3 cilindros 12V.\n\nPotência: Até 80 cv com etanol e 75 cv com gasolina.\n\nTorque: 10,2 kgfm (E) / 9,4 kgfm (G).\n\nCâmbio: Manual de 5 marchas (esta versão das fotos, com calotas e retrovisores sem pintura, costuma ser a de entrada, como a Sense ou Comfort).\n\n2. Design Externo (Fotos enviadas)\n\nCor: Cinza Silk (ou Cinza Metálico).\n\nFrente: Nova grelha em preto brilhante com design em cascata e luzes de seta integradas no para-choque.\n\nTraseira: Lanterna em LED (assinatura visual "H") que atravessa toda a tampa do porta-malas.\n\n3. Itens de Série Comuns nesta Versão\n\nSegurança: 6 airbags (frontais, laterais e de cortina), controlo de estabilidade (ESP) e assistente de partida em rampa (HAC).\n\nConforto: Ar-condicionado, direção elétrica, vidros elétricos dianteiros e computador de bordo.\n\n"Design de última geração com economia que cabe no seu bolso. Este HB20 não vai esquentar lugar no estoque — chame agora e garanta a sua proposta!"',
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244639209-ia7i9mqe1m.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244641554-shnasjmsgkb.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244643324-6gtwtbuukrv.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244644179-cwuuubmjvnf.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244644904-0sdpdibvq9l.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244645664-tqerrca17.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244646413-j9sytu8falf.jpeg'
  ],
  'available',
  false,
  4,
  'used',
  'car',
  'hyundai-hb20-hb20-comfort-10-flex-2023',
  true,
  '2026-01-01T00:01:40.387952+00:00',
  '2026-01-13T13:22:40.052203+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  description = EXCLUDED.description,
  photos = EXCLUDED.photos,
  updated_at = EXCLUDED.updated_at;

-- CARRO 3: Chevrolet S10
INSERT INTO public.cars (id, garage_id, brand_id, code, model, version, year, color, mileage, transmission, fuel, price, description, photos, status, is_featured, doors, condition, category, slug, garage_is_active, created_at, updated_at)
VALUES (
  'fd3f0938-bdef-45cd-926f-b32e4757479b',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  'b0b96a07-688c-4343-a222-0992d8e07c35',
  'CC-000007',
  'S10',
  '2.8 LT (Cabine Dupla) 4x2',
  2016,
  'Prata Switchblade',
  178000,
  'automatic',
  'diesel',
  98900,
  E'Este modelo é conhecido por ser o "pau para toda obra" da Chevrolet, unindo a força do motor diesel com o conforto de um carro automático.\n\nMotor: 2.8 Turbo Diesel CTDI.\n\nTração: 4x4 com seletor eletrônico.\n\nCâmbio: Automático de 6 marchas.\n\nDiferenciais Visuais (das suas fotos): * Equipada com pneus All-Terrain T/A com letras brancas (Sunset Tires), o que dá um visual muito mais robusto e off-road.\n\nEstribos laterais instalados.\n\nSanto Antônio e capota marítima.\n\nInterior: Bancos em tecido com padronagem resistente, central multimídia original e volante com comandos integrados.\n\nEstado: Veículo muito bem conservado e limpo.\n\n"A força que o seu trabalho exige com o conforto que a sua família merece. Não perca tempo com promessas, venha levar quem realmente entende de estrada. Chame agora e faça o melhor negócio da sua vida!"',
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244493264-lsr4wvx64df.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244495597-bjzm0z10j18.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244496391-7cfa44cxmux.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244497192-snkdekudho.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244498057-clqprzwthm7.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244498881-x1i5mjwhgl.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244499694-4592aux3891.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244500454-kdme1bouv1.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244501185-nqiybbz2q7.jpeg'
  ],
  'available',
  false,
  4,
  'used',
  'car',
  'chevrolet-s10-28-lt-cabine-dupla-4x2-2016',
  true,
  '2026-01-01T00:12:13.51469+00:00',
  '2026-01-13T13:16:14.94969+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  description = EXCLUDED.description,
  photos = EXCLUDED.photos,
  updated_at = EXCLUDED.updated_at;

-- CARRO 4: Fiat Strada Freedom
INSERT INTO public.cars (id, garage_id, brand_id, code, model, version, year, color, mileage, transmission, fuel, price, description, photos, status, is_featured, doors, condition, category, slug, garage_is_active, created_at, updated_at)
VALUES (
  '7d705911-5cea-4b65-8804-2947ea3d19f6',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  '19fb93b0-f85b-431f-a72d-81d24503c874',
  'CC-000008',
  'Strada',
  'Freedom 1.3 Firefly',
  2024,
  'Cinza Silverstone',
  37400,
  'automatic',
  'flex',
  128000,
  E'Ficha Técnica: Fiat Strada Freedom 1.3 Firefly (Cabine Dupla)\nMotor: 1.3 Firefly Flex.\n\nPotência: Até 107 cv com etanol e 98 cv com gasolina.\n\nTorque: 13,7 kgfm (E) / 13,2 kgfm (G).\n\nCâmbio: Manual de 5 marchas (robusto para carga).\n\nCor: Branco Banchisa (Sólido).\n\nDestaques Visuais (das suas fotos):\n\nFaróis: Máscara negra e design moderno da nova geração.\n\nRodas: Rodas de liga leve exclusivas da versão Freedom.\n\nPraticidade: Já vem com capota marítima instalada e protetor de caçamba.\n\nCapacidade: 4 portas e homologada para 5 passageiros, sendo a única da categoria com essa facilidade de acesso.',
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244311339-lfbl6rff80k.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244361335-v0mlv3ljr4.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244362887-2auerg9nei8.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244364461-cnjzm4jbty6.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244366046-uy3cf1z7w4l.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244410854-l7hcrmf5bf.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244411643-3g7pra8pxd9.jpeg'
  ],
  'available',
  false,
  4,
  'used',
  'car',
  'fiat-strada-freedom-13-firefly-2024',
  true,
  '2026-01-01T00:22:08.605746+00:00',
  '2026-01-13T13:23:09.480539+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  description = EXCLUDED.description,
  photos = EXCLUDED.photos,
  updated_at = EXCLUDED.updated_at;

-- CARRO 5: Fiat Strada Hard Working
INSERT INTO public.cars (id, garage_id, brand_id, code, model, version, year, color, mileage, transmission, fuel, price, description, photos, status, is_featured, doors, condition, category, slug, garage_is_active, created_at, updated_at)
VALUES (
  '082d1af5-99a4-4a08-8444-6d48aede2a3c',
  'ac12ed0b-0f6f-411a-bb73-6b5d61708ec8',
  '19fb93b0-f85b-431f-a72d-81d24503c874',
  'CC-000010',
  'Strada',
  'Hard Working 1.4 (Flex)',
  2020,
  'Branca',
  140000,
  'manual',
  'flex',
  59900,
  E'A parceira ideal para o seu trabalho! 🛠️\n\nPickup robusta, econômica e com o melhor valor de revenda da categoria. Versão Hard Working, preparada para enfrentar qualquer desafio com baixo custo de manutenção.\n\nMotor: 1.4 Fire Flex (Potência e economia)\n\nPneus: Novos (Roadcruza com escrita branca)\n\nInterior: Higienizado, com rádio e ar-condicionado\n\nDiferencial: Cabine conservada e protetor de caçamba intacto\n\n"Robusta, confiável e pronta para faturar. Não perca essa oportunidade!"',
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300719695-oj6mlnj6nci.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300721152-edyjlfor0sp.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300721836-ovxdhvfrv1c.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300722450-c7z00q2boi.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300723097-lrv5amyu10r.jpeg',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300723772-pzz58fqztd9.jpeg'
  ],
  'available',
  false,
  4,
  'used',
  'car',
  'fiat-strada-hard-working-14-flex-2020',
  true,
  '2026-01-01T20:52:08.242474+00:00',
  '2026-01-13T13:15:05.178718+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  description = EXCLUDED.description,
  photos = EXCLUDED.photos,
  updated_at = EXCLUDED.updated_at;

-- CARRO 6: VW Virtus
INSERT INTO public.cars (id, garage_id, brand_id, code, model, version, year, color, mileage, transmission, fuel, price, description, photos, status, is_featured, doors, condition, category, slug, garage_is_active, created_at, updated_at)
VALUES (
  '3117e39e-d6f8-4634-914d-a28dd3d78dc5',
  '84f29ff1-f98c-410a-8fbc-0f93307a8c6e',
  '4d56000c-6aca-4373-8baa-ebf31724f9e8',
  'CC-000011',
  'Virtus',
  '1.6 MSI Automático Flex',
  2021,
  'Prata',
  119000,
  'automatic',
  'flex',
  79900,
  'Ar Condicionado, Alarme, Trava Elétrica, Vidro Elétrico, Freio ABS, Espelhos Elétricos, Air Bag Duplo, ContaGiro, Computador de Bordo, Desembaçador Traseiro, Direção Elétrica, Air Bag, Sensor de Estacionamento Traseiro, Limpador Traseiro, Chave Canivete, Kit Multimídia, Bluetooth, Ar Quente, USB, Controle de Estabilidade, Câmbio Automático',
  ARRAY[
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/84f29ff1-f98c-410a-8fbc-0f93307a8c6e/1767821549367-bdxvo36781p.png',
    'https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/84f29ff1-f98c-410a-8fbc-0f93307a8c6e/1767821551545-jg7st43172p.png'
  ],
  'available',
  false,
  4,
  'used',
  'car',
  'volkswagen-virtus-16-msi-automatico-flex-2021',
  true,
  '2026-01-07T21:32:32.146785+00:00',
  '2026-01-09T19:09:04.354904+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  model = EXCLUDED.model,
  version = EXCLUDED.version,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  description = EXCLUDED.description,
  photos = EXCLUDED.photos,
  updated_at = EXCLUDED.updated_at;

-- Reabilitar trigger
ALTER TABLE public.cars ENABLE TRIGGER set_car_code;

-- Verificação
SELECT 
  'Carros migrados: ' || COUNT(*)::TEXT as resultado
FROM public.cars;
