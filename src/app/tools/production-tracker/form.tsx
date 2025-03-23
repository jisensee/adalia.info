import { useQueryStates } from 'nuqs'
import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, RefreshCw } from 'lucide-react'
import { productionTrackerParams } from './params'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useAccounts } from '@/hooks/wallet-hooks'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  walletAddress: z.string(),
})

export type ProductionTrackerFormProps = {
  loading: boolean
  refresh: () => void
  initalFetchDone: boolean
}

export const ProductionTrackerForm = ({
  loading,
  refresh,
  initalFetchDone,
}: ProductionTrackerFormProps) => {
  const [{ walletAddress: currentWalletAddress }, setParams] = useQueryStates(
    productionTrackerParams
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: { walletAddress: currentWalletAddress ?? undefined },
  })

  const connectedAddress = useAccounts()?.starknetAccount?.address
  useEffect(() => {
    if (connectedAddress && !currentWalletAddress) {
      form.setValue('walletAddress', connectedAddress, {
        shouldValidate: true,
      })
    }
  }, [connectedAddress, currentWalletAddress, form])

  return (
    <div className='space-y-2'>
      <p className={cn({ hidden: currentWalletAddress })}>
        Connect your StarkNet wallet or enter your address mannualy to check the
        status of all your production facilities.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(({ walletAddress }) => {
            if (walletAddress === currentWalletAddress) {
              refresh()
            } else {
              setParams({ walletAddress })
            }
          })}
          className='flex flex-col gap-3 md:flex-row'
        >
          <FormField
            name='walletAddress'
            control={form.control}
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Wallet address</FormLabel>
                <div className='flex gap-x-3'>
                  <FormControl>
                    <Input {...field} className='md:w-[550px]' />
                  </FormControl>
                  <Button
                    className='hidden md:flex'
                    variant={initalFetchDone ? 'outline' : 'default'}
                    icon={initalFetchDone ? <RefreshCw /> : <Download />}
                    disabled={!form.formState.isValid}
                    loading={loading}
                  >
                    {initalFetchDone ? 'Refresh' : 'Track Production'}
                  </Button>
                </div>
              </FormItem>
            )}
          />
          <Button
            className='md:hidden'
            disabled={!form.formState.isValid}
            loading={loading}
          >
            Track Production
          </Button>
        </form>
      </Form>
    </div>
  )
}
