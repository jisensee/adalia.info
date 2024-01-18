'use client'

import { useAsteroidFilterNavigation } from '@/components/asteroid-filters/hooks'
import { Button } from '@/components/ui/button'

export const OwnerAsteroidsButton = ({ address }: { address: string }) => {
  const navigate = useAsteroidFilterNavigation()

  return (
    <Button
      variant='outline'
      size='xs'
      onClick={() => navigate({ owners: [address] })}
    >
      Show all
    </Button>
  )
}
