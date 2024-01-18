-- CreateTable
CREATE TABLE "Asteroid" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "orbitalPeriod" INTEGER NOT NULL,

    CONSTRAINT "Asteroid_pkey" PRIMARY KEY ("id")
);
