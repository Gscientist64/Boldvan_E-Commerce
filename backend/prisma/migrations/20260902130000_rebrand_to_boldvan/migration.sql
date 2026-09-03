-- Rebrand existing database rows + sync column defaults to BOLDVAN
-- (keeps the live DB consistent with the updated prisma/schema.prisma defaults)

-- marketplace_settings column defaults
ALTER TABLE "marketplace_settings" ALTER COLUMN "siteName" SET DEFAULT 'BOLDVAN';
ALTER TABLE "marketplace_settings" ALTER COLUMN "metaTitle" SET DEFAULT 'BOLDVAN - Nigeria''s Premier Solar Marketplace';

-- Existing marketplace_settings rows (only touch rows still using the old brands)
UPDATE "marketplace_settings" SET "siteName" = 'BOLDVAN'
  WHERE "siteName" IN ('SolarMart', 'OneClick Resources', 'Oneclick Resources');
UPDATE "marketplace_settings" SET "metaTitle" = 'BOLDVAN - Nigeria''s Premier Solar Marketplace'
  WHERE "metaTitle" LIKE '%SolarMart%'
     OR "metaTitle" LIKE '%OneClick Resources%'
     OR "metaTitle" LIKE '%Oneclick Resources%';

-- SellerInfo default + existing rows
ALTER TABLE "SellerInfo" ALTER COLUMN "name" SET DEFAULT 'BOLDVAN Resources';
UPDATE "SellerInfo" SET "name" = 'BOLDVAN Resources'
  WHERE "name" IN ('OneClick Resources', 'Oneclick Resources');
