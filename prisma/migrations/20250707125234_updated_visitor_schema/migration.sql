/*
  Warnings:

  - You are about to drop the column `durationHours` on the `Visitor` table. All the data in the column will be lost.
  - You are about to drop the column `durationMinutes` on the `Visitor` table. All the data in the column will be lost.
  - You are about to drop the column `entryTime` on the `Visitor` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `Visitor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "durationHours",
DROP COLUMN "durationMinutes",
DROP COLUMN "entryTime",
DROP COLUMN "scheduledDate",
ADD COLUMN     "approvedByClient" BOOLEAN,
ADD COLUMN     "scheduledEntry" TIMESTAMP(3),
ADD COLUMN     "scheduledExit" TIMESTAMP(3);
