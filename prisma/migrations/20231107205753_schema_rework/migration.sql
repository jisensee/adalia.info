/*
  Warnings:

  - The values [RESOURCE_SCAN] on the enum `AsteroidScanStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `surfaceArea` on the `Asteroid` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Blockchain" AS ENUM ('ETHEREUM', 'STARKNET');

-- AlterEnum
BEGIN;
CREATE TYPE "AsteroidScanStatus_new" AS ENUM ('UNSCANNED', 'LONG_RANGE_SCAN', 'ORBITAL_SCAN');
ALTER TABLE "Asteroid" ALTER COLUMN "scanStatus" TYPE "AsteroidScanStatus_new" USING ("scanStatus"::text::"AsteroidScanStatus_new");
ALTER TYPE "AsteroidScanStatus" RENAME TO "AsteroidScanStatus_old";
ALTER TYPE "AsteroidScanStatus_new" RENAME TO "AsteroidScanStatus";
DROP TYPE "AsteroidScanStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Asteroid" DROP COLUMN "surfaceArea",
ADD COLUMN     "blockchain" "Blockchain",
ADD COLUMN     "lastScan" TIMESTAMP(3),
ADD COLUMN     "purchaseOrder" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "scanStatus" SET DEFAULT 'UNSCANNED';

-- CreateTable
CREATE TABLE "AsteroidOwnerChange" (
    "id" SERIAL NOT NULL,
    "asteroidId" INTEGER NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "fromChain" "Blockchain" NOT NULL,
    "toChain" "Blockchain" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsteroidOwnerChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsteroidImportRun" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsteroidImportRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AsteroidOwnerChange" ADD CONSTRAINT "AsteroidOwnerChange_asteroidId_fkey" FOREIGN KEY ("asteroidId") REFERENCES "Asteroid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
