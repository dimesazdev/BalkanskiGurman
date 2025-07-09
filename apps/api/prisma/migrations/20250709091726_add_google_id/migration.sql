/*
  Warnings:

  - A unique constraint covering the columns `[GoogleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "GoogleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_GoogleId_key" ON "User"("GoogleId");
