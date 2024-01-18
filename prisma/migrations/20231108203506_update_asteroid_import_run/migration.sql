/*
  Warnings:

  - You are about to drop the column `timestamp` on the `AsteroidImportRun` table. All the data in the column will be lost.
  - Added the required column `start` to the `AsteroidImportRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AsteroidImportRun" DROP COLUMN "timestamp",
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL;
