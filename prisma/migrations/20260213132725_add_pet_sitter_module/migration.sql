-- CreateTable
CREATE TABLE "PetSitterAppointment" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "address" TEXT,
    "distanceKm" DECIMAL(10,2),
    "fuelCost" DECIMAL(10,2),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrencePattern" TEXT,
    "recurrenceEndDate" TIMESTAMP(3),
    "parentAppointmentId" TEXT,
    "serviceValue" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "petId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetSitterAppointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PetSitterAppointment" ADD CONSTRAINT "PetSitterAppointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetSitterAppointment" ADD CONSTRAINT "PetSitterAppointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetSitterAppointment" ADD CONSTRAINT "PetSitterAppointment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "petSitterAppointmentId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_petSitterAppointmentId_fkey" FOREIGN KEY ("petSitterAppointmentId") REFERENCES "PetSitterAppointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
