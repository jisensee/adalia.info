'use client'

import { Asteroid, Product } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { useMemo, useState } from 'react'
import { ChartArea } from 'lucide-react'

import { useAsteroidAbundances } from './hooks'
import { AbundancesChart } from './abundances-chart'
import { ResourceAbundanceList } from './resource-abundance-list'
import { ResourceSelect } from './resource-select'
import { AbundancesTable } from './abundances-table'
import { LoadingIndicator } from '@/components/loading-indicator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export type AbundancesProps = {
  asteroidId: number
  lotCount: number
  abundances?: string
}

export const Abundances = ({
  asteroidId,
  abundances,
  lotCount,
}: AbundancesProps) => {
  const [selectedTab, setSelectedTab] = useState('asteroid')
  const resources = useMemo(
    () => (abundances ? Asteroid.getAbundances(abundances) : undefined),
    [abundances]
  )
  const availableResources = useMemo(
    () =>
      resources
        ? pipe(
            resources,
            D.toPairs,
            A.filter(([, abundance]) => abundance > 0),
            A.map(([product]) => parseInt(product)),
            A.sortBy((resource) => Product.getType(resource).name)
          )
        : undefined,
    [resources]
  )

  const [selectedResource, setSelectedResource] = useState(0)

  const {
    data: asteroidAbundances,
    isFetching: asteroidAbundancesLoading,
    refetch: calcAsteroidAbundances,
  } = useAsteroidAbundances(
    asteroidId,
    lotCount,
    abundances,
    availableResources
  )

  if (!availableResources || !resources || !abundances) return null

  const lotLimit = 25_000
  const analyzeButton =
    lotCount <= lotLimit ? (
      <div className='flex w-full justify-center p-3'>
        {asteroidAbundancesLoading ? (
          <div className='flex flex-col items-center'>
            <p>
              Analyzing resource abundances...this can take a few seconds on
              larger asteroids.
            </p>
            <LoadingIndicator />
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <Button
              onClick={() => calcAsteroidAbundances()}
              icon={<ChartArea />}
            >
              Analyze resource abundances
            </Button>
            <p className='text-warning'>
              This may take a few seconds on larger asteroids. Please be
              patient.
            </p>
          </div>
        )}
      </div>
    ) : (
      <p>
        Not available for asteroids with more than {lotLimit.toLocaleString()}{' '}
        lots due to computational limits.
      </p>
    )

  return (
    <div className='space-y-1'>
      <h2>Resource Abundances</h2>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='h-10'>
          <TabsTrigger className='text-md' value='asteroid'>
            Asteroid Abundances
          </TabsTrigger>
          <TabsTrigger className='text-md' value='chart'>
            Lot Chart
          </TabsTrigger>
          <TabsTrigger className='text-md' value='table'>
            Lot Table
          </TabsTrigger>
        </TabsList>
        {asteroidAbundances && selectedTab !== 'asteroid' && (
          <ResourceSelect
            resources={availableResources}
            selectedResource={selectedResource}
            onSelectedResourceChange={setSelectedResource}
          />
        )}
        <TabsContent value='asteroid'>
          <ResourceAbundanceList abundances={resources} />
        </TabsContent>
        <TabsContent value='chart'>
          {asteroidAbundances ? (
            <AbundancesChart
              asteroidAbundances={asteroidAbundances}
              selectedResource={selectedResource}
            />
          ) : (
            analyzeButton
          )}
        </TabsContent>
        <TabsContent value='table'>
          {asteroidAbundances ? (
            <AbundancesTable
              asteroidAbundances={asteroidAbundances}
              resources={availableResources}
              selectedResource={selectedResource}
            />
          ) : (
            analyzeButton
          )}
        </TabsContent>
      </Tabs>
      {}
    </div>
  )
}
