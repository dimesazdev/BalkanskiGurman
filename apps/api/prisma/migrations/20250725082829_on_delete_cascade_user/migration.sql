-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_UserId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_ClaimedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_UserId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_UserId_fkey";

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ClaimedByUserId_fkey" FOREIGN KEY ("ClaimedByUserId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("UserId") ON DELETE CASCADE ON UPDATE CASCADE;
