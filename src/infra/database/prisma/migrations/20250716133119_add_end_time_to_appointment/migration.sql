/*
  Warnings:

  - Added the required column `endTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;
