/*
  Warnings:

  - Added the required column `runningWorkers` to the `AsteroidImportRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AsteroidImportRun" ADD COLUMN     "runningWorkers" INTEGER NOT NULL;
