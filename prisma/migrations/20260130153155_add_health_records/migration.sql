-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "foodRestrictions" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "vetName" TEXT,
ADD COLUMN     "vetPhone" TEXT;

-- CreateTable
CREATE TABLE "PetMedication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "petId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "petId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PetMedication" ADD CONSTRAINT "PetMedication_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetLog" ADD CONSTRAINT "PetLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
