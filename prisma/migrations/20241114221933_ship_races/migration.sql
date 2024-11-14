-- CreateTable
CREATE TABLE "ShipRace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "lastBlockNumber" INTEGER NOT NULL,

    CONSTRAINT "ShipRace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipRaceParticipant" (
    "id" SERIAL NOT NULL,
    "shipId" INTEGER NOT NULL,
    "shipRaceId" INTEGER NOT NULL,

    CONSTRAINT "ShipRaceParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipRaceTransit" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "origin" INTEGER NOT NULL,
    "destination" INTEGER NOT NULL,
    "departure" TIMESTAMP(3) NOT NULL,
    "arrival" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipRaceTransit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShipRaceParticipant" ADD CONSTRAINT "ShipRaceParticipant_shipRaceId_fkey" FOREIGN KEY ("shipRaceId") REFERENCES "ShipRace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipRaceTransit" ADD CONSTRAINT "ShipRaceTransit_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ShipRaceParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
