'use client'

import { useQueryStates } from 'nuqs'
import { useTransition } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressParams } from './params'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

const formSchema = z.object({
  walletAddress: z.string(),
})

export const WalletAddressForm = ({
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
  const [, setParams] = useQueryStates(addressParams, {
    shallow: false,
    startTransition,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ walletAddress }) =>
          setParams({ walletAddress })
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
                  Find Processes
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
          Find Processes
        </Button>
      </form>
    </Form>
  )
}
