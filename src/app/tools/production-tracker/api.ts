import { preReleaseInfluenceApi } from '@/lib/influence-api/api'

const getCrewProcesses = async (crewId: number) =>
  preReleaseInfluenceApi.entities({
    match: {
      path: 'Control.controller.id',
      value: crewId,
    },
    label: 5,
    components: ['Processor', 'Location', 'Extractor', 'Name', 'Building'],
  })

const getCrewsIds = async (walletAddress: string) => [
  ...new Set(
    (await preReleaseInfluenceApi.util.crews(walletAddress)).map((c) => c.id)
  ),
]

export const getProcesses = async (walletAddress: string) => {
  const crewIds = await getCrewsIds(walletAddress)

  return Promise.all(crewIds.map(getCrewProcesses)).then((r) => r.flat())
}
