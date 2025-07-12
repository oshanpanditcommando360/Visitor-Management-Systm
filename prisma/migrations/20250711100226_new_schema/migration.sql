/*
  Warnings:

  - Made the column `department` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('CLIENT_ONLY', 'END_USER_ONLY', 'BOTH');

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "department" SET NOT NULL;

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "approvalType" "ApprovalType",
ADD COLUMN     "department" "Department",
ADD COLUMN     "endUserId" TEXT,
ADD COLUMN     "endUserName" TEXT;

-- CreateTable
CREATE TABLE "EndUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "post" TEXT NOT NULL,
    "approvalType" "ApprovalType" NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EndUser_email_key" ON "EndUser"("email");

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_endUserId_fkey" FOREIGN KEY ("endUserId") REFERENCES "EndUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndUser" ADD CONSTRAINT "EndUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
