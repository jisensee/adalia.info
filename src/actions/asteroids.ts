'use server'
import { db } from '@/server/db'

export const getAsteroidCount = async (address: string) =>
  db.asteroid.count({ where: { ownerAddress: address.toLowerCase() } })
