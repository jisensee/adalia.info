import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const client = new PrismaClient()

export const db = process.env.VERCEL_URL
  ? client.$extends(withAccelerate())
  : client
