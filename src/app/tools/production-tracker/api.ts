import { preReleaseInfluenceApi } from '@/lib/influence-api'

const getCrewProcesses = async (crewId: number) =>
  preReleaseInfluenceApi.entities({
    match: {
      path: 'Control.controller.id',
      value: crewId,
    },
    label: 5,
    components: ['Processor', 'Location', 'Extractor', 'Name', 'Building'],
  })

const getCrewsIds = async (walletAddress: string) => {
  const entities = await preReleaseInfluenceApi.entities({
    match: {
      path: 'Nft.owners.starknet',
      value: walletAddress.toLowerCase(),
    },
    label: 1,
  })
  return [...new Set(entities.map((e) => e.id))]
}

export const getProcesses = async (walletAddress: string) => {
  const crewIds = await getCrewsIds(walletAddress)

  return Promise.all(crewIds.map(getCrewProcesses)).then((r) => r.flat())
}
