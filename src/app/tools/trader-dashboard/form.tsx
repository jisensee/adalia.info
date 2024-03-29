'use client'

import { useQueryStates } from 'nuqs'
import { useTransition } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RefreshCw } from 'lucide-react'
import { traderDashboardParams } from './params'
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

export const TraderDashboardForm = () => {
  const [loading, startTransition] = useTransition()
  const [{ walletAddress }, setParams] = useQueryStates(traderDashboardParams, {
    shallow: false,
    startTransition,
  })
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: { walletAddress: walletAddress ?? undefined },
  })

  return (
    <div>
      {!walletAddress && (
        <p>Enter your wallet address to enable personalized market insights.</p>
      )}
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
                    icon={<RefreshCw />}
                    loading={loading}
                  >
                    Fetch Data
                  </Button>
                </div>
              </FormItem>
            )}
          />
          <Button
            className='md:hidden'
            disabled={!form.formState.isValid}
            icon={<RefreshCw />}
            loading={loading}
          >
            Fetch Data
          </Button>
        </form>
      </Form>
    </div>
  )
}
