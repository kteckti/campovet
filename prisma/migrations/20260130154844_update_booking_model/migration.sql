/*
  Warnings:

  - You are about to drop the column `totalPrice` on the `Booking` table. All the data in the column will be lost.
  - Made the column `kennelId` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_kennelId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "totalPrice",
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "kennelId" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_kennelId_fkey" FOREIGN KEY ("kennelId") REFERENCES "Kennel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
