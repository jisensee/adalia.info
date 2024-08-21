import { calcLotAbundances, CalcLotAbundancesArgs } from '@/lib/abundances'

onmessage = (e) => {
  const args = e.data as CalcLotAbundancesArgs
  const abundances = calcLotAbundances(args)
  postMessage(abundances)
}
