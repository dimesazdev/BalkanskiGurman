/*
  Warnings:

  - A unique constraint covering the columns `[Code]` on the table `Amenity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Amenity_Code_key" ON "Amenity"("Code");
