'use server'
import { Address } from '@influenceth/sdk'
import { db } from '@/server/db'

export const getAsteroidCount = async (address: string) =>
  db.asteroid.count({
    where: { ownerAddress: Address.toStandard(address) },
  })
