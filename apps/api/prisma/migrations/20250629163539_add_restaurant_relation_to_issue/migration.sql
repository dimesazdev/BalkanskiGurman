-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_RestaurantId_fkey" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurant"("RestaurantId") ON DELETE CASCADE ON UPDATE CASCADE;
