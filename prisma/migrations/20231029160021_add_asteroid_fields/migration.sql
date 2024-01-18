/*
  Warnings:

  - Added the required column `eccentricity` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inclination` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `radius` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scanStatus` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semiMajorAxis` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spectralType` to the `Asteroid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surfaceArea` to the `Asteroid` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AsteroidScanStatus" AS ENUM ('UNSCANNED', 'LONG_RANGE_SCAN', 'RESOURCE_SCAN');

-- CreateEnum
CREATE TYPE "AsteroidBonusType" AS ENUM ('YIELD', 'VOLATILE', 'METAL', 'ORGANIC', 'RARE_EARTH', 'FISSILE');

-- CreateEnum
CREATE TYPE "AsteroidSpectralType" AS ENUM ('C', 'S', 'M', 'I', 'CI', 'CS', 'SI', 'CM', 'SM', 'CMS', 'CIS');

-- CreateEnum
CREATE TYPE "AsteroidSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'HUGE');

-- CreateEnum
CREATE TYPE "AsteroidRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'SUPERIOR', 'EXCEPTIONAL', 'INCOMPARABLE');

-- AlterTable
ALTER TABLE "Asteroid" ADD COLUMN     "eccentricity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "inclination" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ownerAddress" TEXT,
ADD COLUMN     "radius" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rarity" "AsteroidRarity",
ADD COLUMN     "scanStatus" "AsteroidScanStatus" NOT NULL,
ADD COLUMN     "semiMajorAxis" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "size" "AsteroidSize" NOT NULL,
ADD COLUMN     "spectralType" "AsteroidSpectralType" NOT NULL,
ADD COLUMN     "surfaceArea" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "AsteroidBonus" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "modifier" INTEGER NOT NULL,
    "type" "AsteroidBonusType" NOT NULL,
    "asteroidId" INTEGER NOT NULL,

    CONSTRAINT "AsteroidBonus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AsteroidBonus" ADD CONSTRAINT "AsteroidBonus_asteroidId_fkey" FOREIGN KEY ("asteroidId") REFERENCES "Asteroid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
