-- CreateTable
CREATE TABLE "User" (
    "UserId" TEXT NOT NULL,
    "UserName" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "EmailConfirmed" BOOLEAN NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "PhoneNumber" TEXT NOT NULL,
    "PhoneNumberConfirmed" BOOLEAN NOT NULL,
    "Name" TEXT NOT NULL,
    "Surname" TEXT NOT NULL,
    "City" TEXT NOT NULL,
    "Country" TEXT NOT NULL,
    "ProfilePictureUrl" TEXT NOT NULL,
    "StatusId" INTEGER NOT NULL,
    "BadgeLevel" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "SuspendedUntil" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Role" (
    "RoleId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "NormalizedName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("RoleId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "UserId" TEXT NOT NULL,
    "RoleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("UserId","RoleId")
);

-- CreateTable
CREATE TABLE "Issue" (
    "IssueId" SERIAL NOT NULL,
    "UserId" TEXT NOT NULL,
    "IssueType" TEXT NOT NULL,
    "Explanation" TEXT NOT NULL,
    "PhotoUrl1" TEXT NOT NULL,
    "PhotoUrl2" TEXT NOT NULL,
    "PhotoUrl3" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "StatusId" INTEGER NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("IssueId")
);

-- CreateTable
CREATE TABLE "Status" (
    "StatusId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("StatusId")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "RestaurantId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "PriceRange" INTEGER NOT NULL,
    "Details" TEXT NOT NULL,
    "PhoneNumber" TEXT NOT NULL,
    "Website" TEXT NOT NULL,
    "MenuUrl" TEXT NOT NULL,
    "AddressId" INTEGER NOT NULL,
    "AverageRating" DOUBLE PRECISION NOT NULL,
    "IsClaimed" BOOLEAN NOT NULL,
    "ClaimedByUserId" TEXT,
    "ClaimedAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("RestaurantId")
);

-- CreateTable
CREATE TABLE "Address" (
    "AddressId" SERIAL NOT NULL,
    "Street" TEXT NOT NULL,
    "PostalCode" TEXT NOT NULL,
    "City" TEXT NOT NULL,
    "Country" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("AddressId")
);

-- CreateTable
CREATE TABLE "Cuisine" (
    "CuisineId" SERIAL NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Cuisine_pkey" PRIMARY KEY ("CuisineId")
);

-- CreateTable
CREATE TABLE "RestaurantCuisine" (
    "RestaurantId" INTEGER NOT NULL,
    "CuisineId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantCuisine_pkey" PRIMARY KEY ("RestaurantId","CuisineId")
);

-- CreateTable
CREATE TABLE "Image" (
    "ImageId" SERIAL NOT NULL,
    "RestaurantId" INTEGER NOT NULL,
    "Url" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("ImageId")
);

-- CreateTable
CREATE TABLE "WorkingHours" (
    "WorkingHoursId" SERIAL NOT NULL,
    "RestaurantId" INTEGER NOT NULL,
    "DayOfWeek" INTEGER NOT NULL,
    "OpenTime" TIMESTAMP(3) NOT NULL,
    "CloseTime" TIMESTAMP(3) NOT NULL,
    "IsClosed" BOOLEAN NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("WorkingHoursId")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "AmenityId" SERIAL NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("AmenityId")
);

-- CreateTable
CREATE TABLE "RestaurantAmenity" (
    "RestaurantId" INTEGER NOT NULL,
    "AmenityId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantAmenity_pkey" PRIMARY KEY ("RestaurantId","AmenityId")
);

-- CreateTable
CREATE TABLE "Review" (
    "ReviewId" SERIAL NOT NULL,
    "RestaurantId" INTEGER NOT NULL,
    "UserId" TEXT NOT NULL,
    "Rating" INTEGER NOT NULL,
    "Comment" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "IsEdited" BOOLEAN NOT NULL,
    "EditedAt" TIMESTAMP(3),
    "StatusId" INTEGER NOT NULL,
    "PhotoUrl1" TEXT NOT NULL,
    "PhotoUrl2" TEXT NOT NULL,
    "PhotoUrl3" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("ReviewId")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "FavoriteId" SERIAL NOT NULL,
    "UserId" TEXT NOT NULL,
    "RestaurantId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("FavoriteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_StatusId_fkey" FOREIGN KEY ("StatusId") REFERENCES "Status"("StatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Role"("RoleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_StatusId_fkey" FOREIGN KEY ("StatusId") REFERENCES "Status"("StatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_AddressId_fkey" FOREIGN KEY ("AddressId") REFERENCES "Address"("AddressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ClaimedByUserId_fkey" FOREIGN KEY ("ClaimedByUserId") REFERENCES "User"("UserId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantCuisine" ADD CONSTRAINT "RestaurantCuisine_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantCuisine" ADD CONSTRAINT "RestaurantCuisine_CuisineId_fkey" FOREIGN KEY ("CuisineId") REFERENCES "Cuisine"("CuisineId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantAmenity" ADD CONSTRAINT "RestaurantAmenity_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantAmenity" ADD CONSTRAINT "RestaurantAmenity_AmenityId_fkey" FOREIGN KEY ("AmenityId") REFERENCES "Amenity"("AmenityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_StatusId_fkey" FOREIGN KEY ("StatusId") REFERENCES "Status"("StatusId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;
