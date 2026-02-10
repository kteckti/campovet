-- AlterTable
ALTER TABLE "Kennel" ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "breed" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;
