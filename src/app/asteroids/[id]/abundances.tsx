'use client'

import { Asteroid, Product } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { useMemo, useState } from 'react'
import { ChartArea } from 'lucide-react'

import { useAsteroidAbundances } from './hooks'
import { LotAbundancesChart } from './lot-abundances-chart'
import { ResourceAbundanceList } from './resource-abundance-list'
import { ResourceSelect } from './resource-select'
import { AbundancesTable } from './abundances-table'
import { AbundancesChart } from './abundances-chart'
import { AbundanceAnalysis } from './abundance-analysis'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

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
    progress: abundancesProgress,
  } = useAsteroidAbundances(
    asteroidId,
    lotCount,
    abundances,
    availableResources
  )

  if (!availableResources || !resources || !abundances) return null

  const analyzeButton = (
    <div className='flex w-full justify-center p-3'>
      {asteroidAbundancesLoading ? (
        <div className='flex flex-col items-center gap-y-2 text-primary'>
          <ChartArea size={48} className='animate-pulse' />
          <p className='animate-pulse text-center text-3xl'>
            Analyzing resource abundances
          </p>
          {lotCount > 300 && (
            <Progress className='h-8 w-72' value={abundancesProgress}>
              {Math.round(abundancesProgress)}%
            </Progress>
          )}
          <p className='italic'>
            This can take a couple moments on larger asteroids, please be
            patient.
          </p>
        </div>
      ) : (
        <div className='flex flex-col items-center'>
          <Button onClick={() => calcAsteroidAbundances()} icon={<ChartArea />}>
            Analyze resource abundances
          </Button>
        </div>
      )}
    </div>
  )

  const chartAvailable = lotCount <= 10_000

  return (
    <div className='space-y-1'>
      <h2>Resource Abundances</h2>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className='h-10'>
          <TabsTrigger className='text-md' value='asteroid'>
            Asteroid Abundances
          </TabsTrigger>
          <TabsTrigger className='text-md' value='abundance-analysis'>
            Abundance Analysis
          </TabsTrigger>
          <TabsTrigger className='text-md' value='chart'>
            Lot Chart
          </TabsTrigger>
          <TabsTrigger className='text-md' value='table'>
            Lot Table
          </TabsTrigger>
        </TabsList>
        {asteroidAbundances && ['chart', 'table'].includes(selectedTab) && (
          <ResourceSelect
            resources={availableResources}
            selectedResource={selectedResource}
            onSelectedResourceChange={setSelectedResource}
          />
        )}
        <TabsContent value='asteroid'>
          <div className='flex flex-col gap-5 md:flex-row'>
            <ResourceAbundanceList abundances={resources} />
            <AbundancesChart abundances={resources} />
          </div>
        </TabsContent>
        <TabsContent value='abundance-analysis'>
          {asteroidAbundances && availableResources && (
            <AbundanceAnalysis
              abundances={asteroidAbundances}
              availableResources={availableResources}
              asteroidId={asteroidId}
              showLotTable={() => setSelectedTab('table')}
            />
          )}
          {!asteroidAbundances && analyzeButton}
        </TabsContent>
        <TabsContent value='chart'>
          {!chartAvailable && (
            <p>
              The lot chart is not available for larger asteroids since it is
              not really usable for that many lots. Please use the lot table
              instead.
            </p>
          )}
          {asteroidAbundances && chartAvailable && (
            <LotAbundancesChart
              asteroidAbundances={asteroidAbundances}
              selectedResource={selectedResource}
            />
          )}
          {!asteroidAbundances && chartAvailable && analyzeButton}
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
