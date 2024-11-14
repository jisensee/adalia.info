/*
  Warnings:

  - Added the required column `firstPrice` to the `ShipRace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondPrice` to the `ShipRace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thirdPrice` to the `ShipRace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerName` to the `ShipRaceParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShipRace" ADD COLUMN     "firstPrice" INTEGER NOT NULL,
ADD COLUMN     "secondPrice" INTEGER NOT NULL,
ADD COLUMN     "thirdPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShipRaceParticipant" ADD COLUMN     "playerName" TEXT NOT NULL;
