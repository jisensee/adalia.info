'use client'

import { useQueryStates } from 'nuqs'
import { useEffect, useTransition } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { crewTrackerParams } from './params'
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

const formSchema = z.object({
  walletAddress: z.string(),
})

export const CrewTrackerForm = ({
  walletAddress,
}: {
  walletAddress?: string
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: { walletAddress },
  })
  const [loading, startTransition] = useTransition()
  const [{ walletAddress: currentWalletAddress }, setParams] = useQueryStates(
    crewTrackerParams,
    {
      shallow: false,
      startTransition,
    }
  )
  const { refresh } = useRouter()

  const connectedAddress = useAccounts()?.starknetAccount?.address
  useEffect(() => {
    if (connectedAddress && !currentWalletAddress) {
      form.setValue('walletAddress', connectedAddress, {
        shouldValidate: true,
      })
    }
  }, [connectedAddress, currentWalletAddress, form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ walletAddress }) =>
          walletAddress === currentWalletAddress
            ? refresh()
            : setParams({ walletAddress })
        )}
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
                  <Input {...field} className='md:max-w-[550px]' />
                </FormControl>
                <Button
                  className='hidden md:flex'
                  disabled={!form.formState.isValid}
                  loading={loading}
                >
                  Track Crews
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
          Track Crews
        </Button>
      </form>
    </Form>
  )
}
