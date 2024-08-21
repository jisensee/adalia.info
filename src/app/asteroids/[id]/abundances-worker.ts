import { calcLotAbundances, CalcLotAbundancesArgs } from '@/lib/abundances'

onmessage = (e) => {
  const args = e.data as CalcLotAbundancesArgs
  const abundances = calcLotAbundances(args, (progress) =>
    postMessage({ type: 'progress', progress })
  )
  postMessage({ type: 'result', abundances })
}
