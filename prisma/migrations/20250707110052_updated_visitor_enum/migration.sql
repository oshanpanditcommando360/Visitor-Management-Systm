/*
  Warnings:

  - You are about to drop the column `managingContact` on the `Visitor` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisitorStatus" ADD VALUE 'APPROVED';
ALTER TYPE "VisitorStatus" ADD VALUE 'DENIED';

-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "managingContact";
