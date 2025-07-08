-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "requestedByGuard" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "scheduledDate" DROP NOT NULL,
ALTER COLUMN "entryTime" DROP NOT NULL,
ALTER COLUMN "durationHours" DROP NOT NULL,
ALTER COLUMN "durationMinutes" DROP NOT NULL;
