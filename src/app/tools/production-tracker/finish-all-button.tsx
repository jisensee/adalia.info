import { useAccount } from '@starknet-react/core'
import { Activity } from 'influence-typed-sdk/api'
import { match, P } from 'ts-pattern'
import { ReactNode } from 'react'
import { Flag, User, Ban } from 'lucide-react'
import { useFinishAll } from './finish-all'
import { Button } from '@/components/ui/button'

type FinishAllButtonProps = {
  activities: Activity[]
  walletAddress?: string | null
  trackerLoading: boolean
}

export const FinishAllButton = ({
  activities,
  walletAddress,
  trackerLoading,
}: FinishAllButtonProps) => {
  const { finishStatus, finishAll, activitiesToFinish } =
    useFinishAll(activities)

  const { address } = useAccount()
  const isConnected = !!address
  const isCorrectWallet =
    address !== undefined && BigInt(walletAddress ?? 0) === BigInt(address)

  if (!walletAddress) {
    return null
  }

  return match({ isConnected, isCorrectWallet, activitiesToFinish } as const)
    .returnType<ReactNode>()
    .with(
      {
        isConnected: true,
        isCorrectWallet: true,
        activitiesToFinish: P.number.gt(0),
      },
      () => (
        <Button
          className='w-fit'
          icon={<Flag />}
          loading={finishStatus === 'pending' || trackerLoading}
          onClick={() => finishAll()}
        >
          Finish {activitiesToFinish} actions
        </Button>
      )
    )
    .with({ isConnected: false, activitiesToFinish: P.number.gt(0) }, () => (
      <Button className='w-fit' variant='outline' icon={<User />} disabled>
        Connect wallet to finish {activitiesToFinish} actions
      </Button>
    ))
    .with({ isConnected: true, isCorrectWallet: false }, () => (
      <Button className='w-fit' variant='destructive' icon={<Ban />} disabled>
        Wrong wallet connected
      </Button>
    ))
    .otherwise(() => null)
}
