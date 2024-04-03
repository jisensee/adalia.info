'use server'
import { fixAddressForInfluenceApi } from '@/lib/utils'
import { db } from '@/server/db'

export const getAsteroidCount = async (address: string) =>
  db.asteroid.count({
    where: { ownerAddress: fixAddressForInfluenceApi(address) },
  })
