# 📦 Migração do Storage - Comandos CLI

Este guia contém os comandos para migrar as imagens do Storage do Lovable Cloud para o seu Supabase externo.

## Pré-requisitos

1. **Supabase CLI instalado**
   ```bash
   npm install -g supabase
   ```

2. **Login no Supabase**
   ```bash
   supabase login
   ```

3. **Criar pasta temporária**
   ```bash
   mkdir -p ~/supabase-migration/{car-photos,ad-images,banners}
   cd ~/supabase-migration
   ```

---

## Método 1: Download via CLI (Recomendado)

### Passo 1: Linkar ao projeto ORIGEM (Lovable Cloud)

```bash
supabase link --project-ref kgtscjvgipowuvuindxt
```

### Passo 2: Baixar todos os arquivos

```bash
# Baixar car-photos
supabase storage cp -r ss:///car-photos ./car-photos/

# Baixar ad-images
supabase storage cp -r ss:///ad-images ./ad-images/

# Baixar banners
supabase storage cp -r ss:///banners ./banners/
```

### Passo 3: Linkar ao projeto DESTINO (Supabase Externo)

```bash
supabase link --project-ref vpunpbozwidlzukplfts
```

### Passo 4: Upload para o novo projeto

```bash
# Upload car-photos
supabase storage cp -r ./car-photos ss:///car-photos/

# Upload ad-images
supabase storage cp -r ./ad-images ss:///ad-images/

# Upload banners
supabase storage cp -r ./banners ss:///banners/
```

---

## Método 2: Download via curl (Alternativa)

Se preferir baixar as imagens diretamente, use os seguintes comandos.

### Criar estrutura de pastas

```bash
mkdir -p ~/supabase-migration/{car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8,car-photos/84f29ff1-f98c-410a-8fbc-0f93307a8c6e,ad-images,banners}
cd ~/supabase-migration
```

### Baixar fotos dos carros (EliteCar)

```bash
# EliteCar garage: ac12ed0b-0f6f-411a-bb73-6b5d61708ec8
cd ~/supabase-migration/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8

curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222509706-8xm6jpy77fk.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222510532-kdyb4bcdy09.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222511319-21d05rc77c4.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222512088-skpkk8dxh1q.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222512991-g4ct2ds1zyb.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222513648-yfk2cu54278.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222514339-lq9z3knljbq.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222515046-m3jpgpyu2hk.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222515740-m3xsg1re7wh.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222516434-vcmmkmzgr0q.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767222517131-d2wp5woe8.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224553122-kaoifayspks.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767224555009-w3ngebswnha.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244311339-lfbl6rff80k.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244361335-v0mlv3ljr4.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244362887-2auerg9nei8.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244364461-cnjzm4jbty6.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244366046-uy3cf1z7w4l.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244410854-l7hcrmf5bf.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244411643-3g7pra8pxd9.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244493264-lsr4wvx64df.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244495597-bjzm0z10j18.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244496391-7cfa44cxmux.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244497192-snkdekudho.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244498057-clqprzwthm7.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244498881-x1i5mjwhgl.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244499694-4592aux3891.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244500454-kdme1bouv1.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244501185-nqiybbz2q7.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244639209-ia7i9mqe1m.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244641554-shnasjmsgkb.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244643324-6gtwtbuukrv.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244644179-cwuuubmjvnf.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244644904-0sdpdibvq9l.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244645664-tqerrca17.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767244646413-j9sytu8falf.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300719695-oj6mlnj6nci.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300721152-edyjlfor0sp.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300721836-ovxdhvfrv1c.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300722450-c7z00q2boi.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300723097-lrv5amyu10r.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1767300723772-pzz58fqztd9.jpeg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/ac12ed0b-0f6f-411a-bb73-6b5d61708ec8/1770231852159-sh5h4j77kon.jpeg"
```

### Baixar fotos dos carros (G12)

```bash
# G12 garage: 84f29ff1-f98c-410a-8fbc-0f93307a8c6e
cd ~/supabase-migration/car-photos/84f29ff1-f98c-410a-8fbc-0f93307a8c6e

curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/84f29ff1-f98c-410a-8fbc-0f93307a8c6e/1767821549367-bdxvo36781p.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/car-photos/84f29ff1-f98c-410a-8fbc-0f93307a8c6e/1767821551545-jg7st43172p.png"
```

### Baixar imagens de anúncios

```bash
cd ~/supabase-migration/ad-images

curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767634270025-besyjt.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1766986557270-hve5p.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819840992-07h7k.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767819842699-85lgqu.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052600841-2qp57.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052602734-2ry2mw.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084245677-hn4lug.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084247604-8r7pe.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084123349-gmn6pt.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084128234-k06jmv.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084164001-ofk02p.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084165564-yw93eg.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052504236-3je1l4.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768052507061-mv3dch.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891748469-7qlvo8.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767891750176-su5kc.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813554188-aqyw8.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767813555507-44c1ss.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084203053-bwzkm.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768084204286-x8bt1i.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767720542329-ecq9z.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1767717869675-jn78ua.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768093449407-fzngm8.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/ad-images/1768093450580-vam1wp.png"
```

### Baixar banners

```bash
cd ~/supabase-migration/banners

curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769475316590.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478256656.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1769473612181.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478481599.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766905363265.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769478777655.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-desktop-1769477473909.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-mobile-1769477476523.png"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896343749.jpg"
curl -O "https://kgtscjvgipowuvuindxt.supabase.co/storage/v1/object/public/banners/banner-1766896361869.jpg"
```

---

## Método 3: Upload via Dashboard (Manual)

1. Acesse: https://supabase.com/dashboard/project/vpunpbozwidlzukplfts/storage/buckets
2. Selecione cada bucket (`car-photos`, `ad-images`, `banners`)
3. Faça upload manual dos arquivos baixados

---

## Após a Migração do Storage

Execute o script de atualização de URLs:

```sql
-- No SQL Editor do Supabase externo
-- Execute: supabase/migration-update-storage-urls.sql
```

Este script substitui automaticamente todas as URLs do projeto antigo (`kgtscjvgipowuvuindxt`) pelo novo (`vpunpbozwidlzukplfts`) nas tabelas:
- `cars.photos`
- `ads.image_url_home` / `ads.image_url_search`
- `banners.image_url` / `banners.image_desktop` / `banners.image_mobile`

---

## Resumo dos Arquivos a Migrar

| Bucket | Quantidade Estimada |
|--------|---------------------|
| car-photos | ~50 imagens |
| ad-images | ~24 imagens |
| banners | ~10 imagens |

---

## Verificação Final

Após migrar, execute:

```sql
-- Verificar se ainda existem URLs antigas
SELECT 'cars' as tabela, COUNT(*) as urls_antigas
FROM cars 
WHERE array_to_string(photos, ',') LIKE '%kgtscjvgipowuvuindxt%'
UNION ALL
SELECT 'ads', COUNT(*) 
FROM ads 
WHERE image_url_home LIKE '%kgtscjvgipowuvuindxt%'
UNION ALL
SELECT 'banners', COUNT(*) 
FROM banners 
WHERE image_url LIKE '%kgtscjvgipowuvuindxt%';

-- Resultado esperado: 0 para todas as tabelas
```
