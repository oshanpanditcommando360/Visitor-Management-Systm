-- CreateEnum
CREATE TYPE "Department" AS ENUM ('FINANCE', 'ADMIN', 'HR', 'IT', 'OPERATIONS');

-- AlterEnum
ALTER TYPE "VisitorStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "department" "Department";
