/*
  Warnings:

  - You are about to drop the column `CountryCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "CountryCode",
ADD COLUMN     "CountryIso" TEXT;
