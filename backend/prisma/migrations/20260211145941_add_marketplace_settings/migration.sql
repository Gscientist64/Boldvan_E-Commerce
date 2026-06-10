-- CreateTable
CREATE TABLE "marketplace_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'SolarMart',
    "siteDescription" TEXT DEFAULT 'Your trusted solar energy marketplace',
    "siteLogo" TEXT,
    "favicon" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "currencySymbol" TEXT NOT NULL DEFAULT '₦',
    "currencyPosition" TEXT NOT NULL DEFAULT 'before',
    "taxEnabled" BOOLEAN NOT NULL DEFAULT true,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "defaultShippingFee" DOUBLE PRECISION NOT NULL DEFAULT 2500,
    "autoConfirmOrders" BOOLEAN NOT NULL DEFAULT false,
    "orderPrefix" TEXT NOT NULL DEFAULT 'ORD',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "paystackPublicKey" TEXT,
    "paystackSecretKey" TEXT,
    "flutterwavePublicKey" TEXT,
    "flutterwaveSecretKey" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpFromEmail" TEXT,
    "smtpFromName" TEXT,
    "metaTitle" TEXT DEFAULT 'SolarMart - Nigeria''s Premier Solar Marketplace',
    "metaDescription" TEXT DEFAULT 'Shop premium solar panels, inverters, batteries and accessories in Nigeria',
    "metaKeywords" TEXT,
    "googleAnalyticsId" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT DEFAULT 'We are currently undergoing maintenance. Please check back soon.',
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutTime" INTEGER NOT NULL DEFAULT 15,
    "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "fixedFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minFee" DOUBLE PRECISION,
    "maxFee" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_adminId_idx" ON "activity_logs"("adminId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_idx" ON "activity_logs"("entityType");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
