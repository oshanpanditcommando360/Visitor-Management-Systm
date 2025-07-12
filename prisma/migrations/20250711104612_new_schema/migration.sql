-- AlterTable
ALTER TABLE "EndUser" ADD COLUMN     "canAddVisitor" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "requestedByEndUser" BOOLEAN NOT NULL DEFAULT false;
