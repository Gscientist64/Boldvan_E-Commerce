-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "actualDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryFee" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "deliveryLocationId" TEXT,
ADD COLUMN     "deliveryMethodId" TEXT,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "deliveryPhone" TEXT,
ADD COLUMN     "deliveryStatus" "DeliveryStatus" DEFAULT 'PENDING',
ADD COLUMN     "estimatedDeliveryDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DeliveryLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedDays" TEXT NOT NULL DEFAULT '1-3',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "zoneId" TEXT,

    CONSTRAINT "DeliveryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedDays" TEXT NOT NULL DEFAULT '0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLocationMethod" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "customFee" DOUBLE PRECISION,
    "customDays" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryLocationMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedDays" TEXT NOT NULL DEFAULT '1-3',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "returnPolicy" TEXT DEFAULT '30-day return policy for defective items',
    "warrantyInfo" TEXT DEFAULT '1-year warranty on all products',
    "aboutText" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "whatsappNumber" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'OneClick Resources',
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT DEFAULT '08178363424',
    "whatsapp" TEXT DEFAULT '08178363424',
    "address" TEXT DEFAULT 'Lagos, Nigeria',
    "logo" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.9,
    "totalSales" INTEGER NOT NULL DEFAULT 1500,
    "successRate" INTEGER NOT NULL DEFAULT 100,
    "memberSince" TEXT DEFAULT '2019',
    "responseTime" TEXT DEFAULT '< 1 hour',
    "badges" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(255) NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(255) NOT NULL,
    "image" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryLocation_name_key" ON "DeliveryLocation"("name");

-- CreateIndex
CREATE INDEX "DeliveryLocation_isActive_idx" ON "DeliveryLocation"("isActive");

-- CreateIndex
CREATE INDEX "DeliveryLocation_sortOrder_idx" ON "DeliveryLocation"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethod_name_key" ON "DeliveryMethod"("name");

-- CreateIndex
CREATE INDEX "DeliveryMethod_isActive_idx" ON "DeliveryMethod"("isActive");

-- CreateIndex
CREATE INDEX "DeliveryMethod_sortOrder_idx" ON "DeliveryMethod"("sortOrder");

-- CreateIndex
CREATE INDEX "DeliveryLocationMethod_isActive_idx" ON "DeliveryLocationMethod"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryLocationMethod_locationId_methodId_key" ON "DeliveryLocationMethod"("locationId", "methodId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "idx_categories_name" ON "categories"("name");

-- CreateIndex
CREATE INDEX "idx_categories_slug" ON "categories"("slug");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryLocationId_fkey" FOREIGN KEY ("deliveryLocationId") REFERENCES "DeliveryLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "DeliveryMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLocation" ADD CONSTRAINT "DeliveryLocation_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLocationMethod" ADD CONSTRAINT "DeliveryLocationMethod_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DeliveryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLocationMethod" ADD CONSTRAINT "DeliveryLocationMethod_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "DeliveryMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
