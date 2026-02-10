/*
  Warnings:

  - You are about to drop the column `checkIn` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Booking` table. All the data in the column will be lost.
  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `size` on the `Kennel` table. All the data in the column will be lost.
  - The `status` column on the `Kennel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `birthDate` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `breed` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "checkIn",
DROP COLUMN "checkOut",
DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Kennel" DROP COLUMN "size",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "birthDate",
DROP COLUMN "breed",
DROP COLUMN "notes",
DROP COLUMN "weight";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "KennelStatus";

-- DropEnum
DROP TYPE "Role";
