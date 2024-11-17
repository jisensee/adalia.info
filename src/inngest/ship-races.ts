import { hash, num, RpcProvider } from 'starknet'
import { A, pipe } from '@mobily/ts-belt'
import { Prisma } from '@prisma/client'
import { Time } from '@influenceth/sdk'
import { addMinutes, isWithinInterval, subMinutes } from 'date-fns'
import { inngest } from './client'
import { db } from '@/server/db'

const provider = new RpcProvider({
  nodeUrl: `https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
})

export const updateShipRaces = inngest.createFunction(
  { id: 'update-ship-races' },
  { cron: '*/5 * * * *' },
  async () => {
    await updateCurrentRace()
  }
)

const getRaceData = async () => {
  const race = await db.shipRace.findFirst({
    where: {
      start: {
        lte: subMinutes(new Date(), 10),
      },
      end: {
        gte: addMinutes(new Date(), 10),
      },
    },
    include: {
      participants: true,
    },
  })
  if (!race) return undefined
  const participants = new Map(race.participants.map((p) => [p.shipId, p]))
  return {
    race,
    participants,
  }
}

const TRANSIT_STARTED = num.toHex(hash.starknetKeccak('TransitStarted'))

const updateCurrentRace = async () => {
  const [raceData, latestBlock] = await Promise.all([
    getRaceData(),
    provider.getBlock('latest').then((b) => b.block_number),
  ])

  if (!raceData || raceData.race.lastBlockNumber === latestBlock) {
    return
  }
  const startBlock = raceData.race.lastBlockNumber
    ? raceData.race.lastBlockNumber + 1
    : latestBlock

  console.log(`Syncing from block ${startBlock} to ${latestBlock}`)
  const eventsList = await provider.getEvents({
    address:
      '0x0422d33a3638dcc4c62e72e1d6942cd31eb643ef596ccac2351e0e21f6cd4bf4',
    from_block: { block_number: startBlock },
    to_block: { block_number: latestBlock },
    keys: [[TRANSIT_STARTED]],
    chunk_size: 10,
  })

  const convertDate = (d: string) =>
    Time.fromOrbitADays(parseInt(d, 16) / 24 / 60 / 60).toDate()
  const transits = pipe(
    eventsList.events,
    A.filterMap(({ data }) => {
      const shipId = Number(data[1])
      const participant = raceData.participants.get(shipId)
      if (!participant) {
        return
      }
      return {
        participantId: participant.id,
        origin: parseInt(data[3] ?? '1'),
        destination: parseInt(data[5] ?? '1'),
        departure: convertDate(data[6] ?? '0'),
        arrival: convertDate(data[7] ?? '0'),
      } satisfies Prisma.ShipRaceTransitCreateManyInput
    }),
    A.filter((t) => {
      const raceInterval = {
        start: raceData.race.start,
        end: raceData.race.end,
      }
      return (
        isWithinInterval(t.arrival, raceInterval) &&
        isWithinInterval(t.departure, raceInterval)
      )
    })
  )
  await db.shipRaceTransit.createMany({
    data: transits,
  })

  await db.shipRace.update({
    where: {
      id: raceData.race.id,
    },
    data: {
      lastBlockNumber: latestBlock,
    },
  })
  console.log(`Sync complete at block ${latestBlock}`)
}
