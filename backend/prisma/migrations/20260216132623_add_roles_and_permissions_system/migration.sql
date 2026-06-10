/*
  Warnings:

  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW_USERS', 'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'MANAGE_USER_ROLES', 'VIEW_PRODUCTS', 'CREATE_PRODUCT', 'EDIT_PRODUCT', 'DELETE_PRODUCT', 'MANAGE_PRODUCT_CATEGORIES', 'VIEW_ORDERS', 'EDIT_ORDER_STATUS', 'CANCEL_ORDER', 'REFUND_ORDER', 'VIEW_ORDER_REPORTS', 'VIEW_DELIVERY_LOCATIONS', 'MANAGE_DELIVERY_LOCATIONS', 'VIEW_DELIVERY_METHODS', 'MANAGE_DELIVERY_METHODS', 'CONFIGURE_DELIVERY_PRICING', 'VIEW_SERVICES', 'MANAGE_SERVICES', 'VIEW_BOOKINGS', 'MANAGE_BOOKINGS', 'VIEW_REVIEWS', 'MODERATE_REVIEWS', 'DELETE_REVIEWS', 'VIEW_SETTINGS', 'EDIT_GENERAL_SETTINGS', 'EDIT_PAYMENT_SETTINGS', 'EDIT_EMAIL_SETTINGS', 'VIEW_ACTIVITY_LOGS', 'VIEW_DASHBOARD', 'VIEW_SALES_REPORTS', 'VIEW_USER_REPORTS', 'EXPORT_REPORTS', 'MANAGE_ADMINS', 'MANAGE_ROLES', 'VIEW_AUDIT_LOGS');

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_adminId_fkey";

-- DropTable
DROP TABLE "activity_logs";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" "Permission"[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_assignments_userId_roleId_key" ON "user_role_assignments"("userId", "roleId");

-- CreateIndex
CREATE INDEX "admin_logs_adminId_idx" ON "admin_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_logs_action_idx" ON "admin_logs"("action");

-- CreateIndex
CREATE INDEX "admin_logs_entityType_idx" ON "admin_logs"("entityType");

-- CreateIndex
CREATE INDEX "admin_logs_createdAt_idx" ON "admin_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
