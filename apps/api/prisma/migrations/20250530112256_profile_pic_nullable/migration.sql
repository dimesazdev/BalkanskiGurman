/*
  Warnings:

  - You are about to drop the column `PhoneNumberConfirmed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "PhoneNumberConfirmed",
ALTER COLUMN "PhoneNumber" DROP NOT NULL,
ALTER COLUMN "ProfilePictureUrl" DROP NOT NULL;
