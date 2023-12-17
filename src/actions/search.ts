'use server'

import { AsteroidRarity } from '@prisma/client'
import { db } from '@/server/db'
import { AsteroidService } from '@/server/asteroid-service'

export type AsteroidResult = {
  type: 'asteroid'
  id: number
  name?: string
}

export type AsteroidRarityResult = {
  type: 'asteroid-rarity'
  rarity: AsteroidRarity
}

export type AsteroidOwnerResult = {
  type: 'asteroid-owner'
  address: string
  ownedAsteroids: number
}

export type AsteroidStatusSearch = 'scanned' | 'unscanned' | 'owned' | 'unowned'

export type AsteroidStatusResult = {
  type: 'asteroid-status'
  status: AsteroidStatusSearch
}

export type SearchResult =
  | AsteroidResult
  | AsteroidRarityResult
  | AsteroidOwnerResult
  | AsteroidStatusResult

const searchAsteroids = async (
  searchTerm: string
): Promise<AsteroidResult[]> => {
  const asteroidResults = await AsteroidService.search(searchTerm)

  return asteroidResults.map((asteroid) => ({
    type: 'asteroid',
    id: asteroid.id,
    name: asteroid.name ?? undefined,
  }))
}

const searchOwner = async (
  searchTerm: string
): Promise<AsteroidOwnerResult[]> => {
  const count = await db.asteroid.count({
    where: {
      ownerAddress: searchTerm,
    },
  })

  return count > 0
    ? [
        {
          type: 'asteroid-owner',
          address: searchTerm,
          ownedAsteroids: count,
        },
      ]
    : []
}

const searchRarities = (searchTerm: string): AsteroidRarityResult[] => {
  return Object.values(AsteroidRarity)
    .filter((r) => r.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((r) => ({
      type: 'asteroid-rarity',
      rarity: r,
    }))
}

const searchStatus = (searchTerm: string): AsteroidStatusResult[] => {
  const statuses: AsteroidStatusSearch[] = [
    'owned',
    'unowned',
    'scanned',
    'unscanned',
  ]
  return statuses
    .filter((s) => s.includes(searchTerm.toLowerCase()))
    .map((s) => ({
      type: 'asteroid-status',
      status: s,
    }))
}

export const search = async (searchTerm: string): Promise<SearchResult[]> => {
  if (searchTerm === '') {
    return []
  }
  const trimmed = searchTerm.trim().toLowerCase()
  const asteroidResults = await searchAsteroids(trimmed)
  const rarityResults = searchRarities(trimmed)
  const ownerResult = await searchOwner(trimmed)
  const statusResults = searchStatus(trimmed)

  return [
    ...asteroidResults,
    ...rarityResults,
    ...ownerResult,
    ...statusResults,
  ]
}
