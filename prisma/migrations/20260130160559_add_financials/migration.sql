-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "totalCost" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Kennel" ADD COLUMN     "dailyRate" DECIMAL(10,2) NOT NULL DEFAULT 0.0;
