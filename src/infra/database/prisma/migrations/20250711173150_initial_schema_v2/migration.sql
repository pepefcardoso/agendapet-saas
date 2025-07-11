-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PIX');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('MONETARY', 'SUBSCRIPTION_CREDIT', 'LOYALTY_CREDIT');

-- CreateTable
CREATE TABLE "PetShopUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "petShopId" TEXT NOT NULL,

    CONSTRAINT "PetShopUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetShop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "workingHours" JSONB,
    "activeSubscriptionId" TEXT,

    CONSTRAINT "PetShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetShopClient" (
    "petShopId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "PetShopClient_pkey" PRIMARY KEY ("petShopId","clientId")
);

-- CreateTable
CREATE TABLE "PetShopSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "maxClients" INTEGER NOT NULL,
    "maxAppointmentsPerMonth" INTEGER NOT NULL,
    "features" JSONB NOT NULL,

    CONSTRAINT "PetShopSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetShopSubscription" (
    "id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "PetShopSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "petShopId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" "PetSize" NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentType" "PaymentType" NOT NULL DEFAULT 'MONETARY',
    "clientId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "petShopId" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "credits" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "petShopId" TEXT NOT NULL,

    CONSTRAINT "ClientSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSubscription" (
    "id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "ClientSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSubscriptionCredit" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "remainingCredits" INTEGER NOT NULL,

    CONSTRAINT "ClientSubscriptionCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyPlan" (
    "id" TEXT NOT NULL,
    "pointsPerReal" INTEGER NOT NULL,
    "petShopId" TEXT NOT NULL,

    CONSTRAINT "LoyaltyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyPromotion" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsNeeded" INTEGER NOT NULL,
    "serviceCredits" JSONB NOT NULL,
    "loyaltyPlanId" TEXT NOT NULL,

    CONSTRAINT "LoyaltyPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientLoyaltyPoints" (
    "clientId" TEXT NOT NULL,
    "petShopId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "ClientLoyaltyPoints_pkey" PRIMARY KEY ("clientId","petShopId")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "clientId" TEXT NOT NULL,
    "petShopId" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "appointmentId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppointmentToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppointmentToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PetShopUser_email_key" ON "PetShopUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PetShop_activeSubscriptionId_key" ON "PetShop"("activeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientUser_email_key" ON "ClientUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyPlan_petShopId_key" ON "LoyaltyPlan"("petShopId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "Payment"("appointmentId");

-- CreateIndex
CREATE INDEX "_AppointmentToService_B_index" ON "_AppointmentToService"("B");

-- AddForeignKey
ALTER TABLE "PetShopUser" ADD CONSTRAINT "PetShopUser_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetShop" ADD CONSTRAINT "PetShop_activeSubscriptionId_fkey" FOREIGN KEY ("activeSubscriptionId") REFERENCES "PetShopSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetShopClient" ADD CONSTRAINT "PetShopClient_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetShopClient" ADD CONSTRAINT "PetShopClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetShopSubscription" ADD CONSTRAINT "PetShopSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PetShopSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ClientUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubscriptionPlan" ADD CONSTRAINT "ClientSubscriptionPlan_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubscription" ADD CONSTRAINT "ClientSubscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubscription" ADD CONSTRAINT "ClientSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ClientSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSubscriptionCredit" ADD CONSTRAINT "ClientSubscriptionCredit_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ClientSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPlan" ADD CONSTRAINT "LoyaltyPlan_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPromotion" ADD CONSTRAINT "LoyaltyPromotion_loyaltyPlanId_fkey" FOREIGN KEY ("loyaltyPlanId") REFERENCES "LoyaltyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLoyaltyPoints" ADD CONSTRAINT "ClientLoyaltyPoints_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_petShopId_fkey" FOREIGN KEY ("petShopId") REFERENCES "PetShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentToService" ADD CONSTRAINT "_AppointmentToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentToService" ADD CONSTRAINT "_AppointmentToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
